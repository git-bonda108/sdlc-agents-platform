# Evaluation

An honest inventory of what is tested in this repository today, what the code visibly handles, and the evaluation harness the system should have. Nothing below reports a metric that was not produced by a file in this repository, and the one existing metrics document is cited with its caveat.

## What automated tests exist

**`TESTS/test_api.py`** — the only automated test file. Eight pytest functions exercising the FastAPI app in-process via `fastapi.testclient.TestClient`:

| Test | Covers |
|---|---|
| `test_root` | `GET /` returns 200 and the service banner |
| `test_health_check` | `GET /health` returns `{"status": "healthy"}` |
| `test_create_project` | `POST /projects/` round-trips the name |
| `test_get_projects` | `GET /projects/` returns a list |
| `test_create_task` | Creates a project, then a task referencing its id |
| `test_get_tasks` | `GET /tasks/` returns a list |
| `test_create_document` | Creates a project, then a document referencing its id |
| `test_create_agent` | `POST /agents/` round-trips the name |

Run from the repository root (module-mode so the root is importable):

```bash
python -m pytest TESTS/test_api.py -v
```

Caveats an engineer should know before trusting a green run:

- **Schema prerequisite.** The app never calls `Base.metadata.create_all`; run the initialization step in `scripts/setup.sh` (or the snippet in the README) first, or every write test fails against an empty database.
- **Shared mutable state.** Tests run against the real configured database (`sqlite:///./sdlc_system.db` by default), not a fixture-scoped one, and leave rows behind. There is no teardown, no test isolation, and re-runs accumulate data.
- **Status-code looseness.** Creation tests assert 200 (FastAPI's default) rather than 201, and no test covers validation failures (422), the 404 paths, or malformed bodies.
- **No coverage of `AGENTS/`, `RAG/`, or `UTILS/`.** The crew requires an LLM key and the RAG module downloads an embedding model on first use; neither has tests, mocked or otherwise.

`UTILS/helpers.py` contains a `FileValidator` that syntax-checks Python files and parses config files across a directory tree. It is a validation utility, not a test suite, but it is runnable (`python UTILS/helpers.py`) and was the mechanism behind the syntax-validation claims in the historical reports.

## Metrics that exist in the repository, with sources

- `VALIDATION_SUMMARY.md` reports "73,018 total files" and "12,163 Python files" and a "PRODUCTION READY" status. Those counts describe the pre-publication working workspace (including dependencies and symlinked batch content), not this repository, which contains 134 tracked files (fifteen of them dangling symbolic links into the original batch workspace). The syntax-validation checkmarks for the five core modules are consistent with the committed code; the production-readiness claim is aspirational and is superseded by `DOCS/HARDENING.md`.
- `DOCS/Batch7/DEPLOYMENT_STATUS.md` reports "145 total files, 57 Python files" for the Batch 7 workspace and lists quality tooling (Ruff, Black, MyPy) as "configuration ready". Same caveat: it describes that batch workspace, and the referenced test suite and tooling configs are not in this repository.

No latency, accuracy, retrieval-quality, or agent-output metrics exist anywhere in the repository.

## Edge cases the code visibly handles

Enumerated from the code, not from intent:

- **API**: 404 via `HTTPException` for missing project/task ids; request-body validation by Pydantic models; per-request session cleanup in a `finally` block (`MODELS/database.py:get_db`).
- **RAG**: idempotent collection initialization — `get_collection` falling back to `create_collection` in a `try/except` (`RAG/rag_system.py`). Note the `except` is bare, so a genuinely broken Chroma store is indistinguishable from a first run.
- **Utilities**: every I/O helper in `UTILS/helpers.py` catches exceptions, logs them, and returns a safe value (`{}`, `False`, or a partial list); `validate_python_syntax` distinguishes `SyntaxError` from other failures.
- **Frontend sockets**: `hooks/useSocket.ts` (three copies) sets a 10s connection timeout, falls back websocket→polling, surfaces `connect_error` and server `error` events into component state, and refuses to connect without an authenticated user/token.
- **Deployment**: `CONFIG/Batch5/docker-compose.yml` gates service startup on `service_healthy` healthchecks (Postgres `pg_isready`, Redis `ping`, HTTP checks for backend/frontend/Chroma); `CONFIG/Batch7/docker-compose.yml` sets `restart: unless-stopped` on every service.
- **Configured (not enforced in code at HEAD)**: `SERVICES/Batch3B/manager_config.yaml` declares per-phase timeouts, `max_iterations` caps, `max_retries: 3` for the LLM and external providers, and approval gates.

Notable gaps, also visible in the code: no retry or timeout on any API-side operation; no timeout around `crew.kickoff()`; `RAGSystem.search` assumes at least one result page exists; `allow_origins=["*"]` with credentials (see hardening doc); the crew path never validates that the LLM key is present before running.

## Proposed evaluation harness

No harness exists. This section is a design, clearly labeled as such, sized to what the code is.

**1. API contract suite (extend what exists).**
Fixture-scoped SQLite (`tmp_path`), `create_all` in a fixture, teardown per test; add 404/422 cases and status-code assertions; run in CI on every push. Gate: 100% pass.

**2. Retrieval golden dataset.**
Shape: `queries.jsonl` with `{query, relevant_doc_ids}` over a fixed corpus of 50–200 SDLC documents checked into `TESTS/fixtures/`. Metrics: recall@5 and MRR from `RAGSystem.search` output (it already returns ranked ids and distances). Gates: recall@5 ≥ 0.8 on the golden set; alert on >2-point regression. This directly exercises the chunking/top-k choices that `manager_config.yaml` tunes.

**3. Crew output rubric.**
For a fixed set of 5–10 project descriptions, score each pipeline stage's output against a per-stage rubric (plan: has milestones and ownership; code: parses/compiles; tests: runnable and referencing the code; docs: covers the produced artifacts). Judge: human at first, LLM-as-judge with spot audits once the rubric is stable. Record cost and wall-clock per run, since the sequential pipeline's latency is its known trade-off. Gate: no stage scores below threshold on two consecutive runs.

**4. Integration smoke.**
Once the crew and RAG are wired into the API (extension steps 1–2 in the architecture doc): one end-to-end test — create project → execute → assert documents/tasks were persisted — run against the compose stack in CI, gated on the existing healthchecks.
