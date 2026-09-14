# Architecture

This document describes the system as committed: the consolidated core at the repository root, the per-batch material that documents how it was built, and the seams left for integration. Claims here are grounded in specific files; where a capability exists only as configuration or design documentation, that is said explicitly.

## Component map

| Component | Files | Role |
|---|---|---|
| REST API | `API/main.py` | FastAPI app exposing CRUD endpoints for projects, tasks, documents, and agent records; CORS middleware; health endpoint |
| Data layer | `MODELS/database.py` | SQLAlchemy engine/session factory and four declarative models (`Project`, `Task`, `Document`, `Agent`); `get_db` generator for per-request sessions |
| Agent orchestration | `AGENTS/crew_manager.py` | `SDLCAgent` base class plus four role subclasses; `CrewManager` builds a CrewAI `Crew` with four tasks and runs it via `kickoff()` |
| Retrieval | `RAG/rag_system.py` | `RAGSystem` (ChromaDB persistent client, sentence-transformers embeddings, add/search/update/delete) and `DocumentProcessor` (text/markdown/Python extraction) |
| Utilities | `UTILS/helpers.py` | Config load/save (JSON/YAML), directory and file-type helpers, file inventory, Python syntax validation, `FileValidator` |
| Tests | `TESTS/test_api.py` | Eight pytest functions against the API via `TestClient` |
| Service config | `SERVICES/Batch3B/manager_config.yaml` | Declarative configuration for a phase-gated SDLC manager: LLM provider routing, RAG tuning (chunking, hybrid retrieval, reranking), phase timeouts/approvals, audit settings |
| Frontends | `UI/Batch5/frontend`, `UI/batch5-frontend`, `UI/Batch6/dashboard/frontend`, `UI/Batch7/frontend` | Next.js/TypeScript components: HITL collaboration (workflow designer, comment threads, file preview, Socket.IO hooks) and operations dashboards (metrics, timelines, team performance) |
| Deployment | `PREREQUISITES/Dockerfile`, `PREREQUISITES/docker-compose.yml`, `CONFIG/Batch5/docker-compose.yml`, `CONFIG/Batch7/docker-compose.yml` | Container builds and service topologies of increasing completeness (API+Postgres+Redis; full HITL stack with Celery, Prometheus, Grafana; integrated stack with ChromaDB server and nginx) |

The `DOCS/Batch3`–`Batch7` folders are design documentation from the batch build-out. They reference backend modules (for example `backend/agents/devops.py`, `backend/orchestration/task_orchestrator.py`) that belonged to the working batch codebases and are not part of this repository. Treat them as design references, not as descriptions of code present at HEAD.

## Data flow

### API request path (wired end to end)

1. A client calls an endpoint on `API/main.py` (for example `POST /projects/`).
2. FastAPI validates the body against the corresponding Pydantic model (`ProjectCreate`, `TaskCreate`, `DocumentCreate`, `AgentCreate`).
3. The `get_db` dependency opens a SQLAlchemy session from `SessionLocal` and guarantees `close()` in a `finally` block.
4. The handler constructs the ORM object, commits, refreshes, and returns it; FastAPI serializes it back to JSON.
5. `GET` detail endpoints return 404 via `HTTPException` when the row does not exist.

Schema creation is not part of the request path or app startup: tables are created by the inline `Base.metadata.create_all` step in `scripts/setup.sh` (or run manually). An API started against an empty database will fail on first write.

### Crew execution path (standalone)

1. `CrewManager.execute_project(description)` builds four `Task` objects, each templated with the project description and bound to one agent.
2. `Crew(agents=[...], tasks=[...])` runs under CrewAI's default sequential process: planning → development → testing → documentation, each task receiving the prior tasks' output as context per CrewAI semantics.
3. `kickoff()` returns the final result to the caller. Nothing persists the result; the `Document`/`Task` tables are the natural destination but are not written by this path.

### Retrieval path (standalone)

1. `RAGSystem.__init__` opens a persistent ChromaDB client at `./chroma_db` and loads `all-MiniLM-L6-v2` locally.
2. `add_document`/`add_documents_batch` embed content and store text, embedding, and metadata under caller-supplied IDs (batch embedding is a single model call for the whole list).
3. `search(query, n_results)` embeds the query and performs vector similarity, returning content, metadata, and distance per hit.
4. `DocumentProcessor` supplies text from files; its Python handler keeps only comment/docstring/def/class lines — a line-based heuristic the code itself flags as a candidate for AST-based parsing.

## Orchestration analysis: what runs parallel, sequential, async

- **Sequential**: the CrewAI pipeline. Four tasks in fixed order, one agent each, no delegation (`allow_delegation=False` on every agent). This is the simplest correct topology for a produce-consume chain (plan feeds development feeds testing feeds docs); it trades wall-clock time for determinism and easy attribution of output to stage.
- **Parallel**: nothing in the core executes concurrently at HEAD. The batch design documents (Batch4) describe dynamic crew composition and parallel task patterns; that stayed at the design level here.
- **Async**: API handlers are declared `async def` but call synchronous SQLAlchemy sessions, so requests serialize on the event loop during DB work. At the current scale (single-user, local-first) this is harmless; under load the standard fixes are sync `def` handlers (thread pool) or async engine/sessions. The frontends use Socket.IO (`hooks/useSocket.ts`) with a 10-second connection timeout and websocket→polling fallback, targeting `/socket.io` on the API origin — the server side of that contract is described in Batch5 docs and is not implemented in `API/main.py`.

## State and context engineering

- **Relational state**: four tables (`projects`, `tasks`, `documents`, `agents`) with status/priority defaults and created/updated timestamps. Cross-entity references (`project_id` on tasks and documents) are plain integer columns without `ForeignKey` constraints or ORM relationships — referential integrity is by convention.
- **Vector state**: one ChromaDB collection (`sdlc_documents`) with caller-managed document IDs. The `get_collection`-then-`create_collection` fallback in the constructor makes initialization idempotent (at the cost of a bare `except`).
- **Agent context**: each CrewAI task's context is the templated description plus prior task outputs (CrewAI's sequential default). There is no retrieval-augmented context assembly for agents yet: `crew_manager.py` imports CrewAI's `BaseTool` but defines no tools, so agents cannot query the RAG store. `manager_config.yaml` specifies the intended context discipline for the integrated system — chunking (1000 chars, 200 overlap, semantic strategy), top-k 10 with rerank to 5, a 4000-token context window, and memory decay/consolidation parameters — which is configuration for components documented in Batch3/3B rather than code at HEAD.
- **Bounding**: the config caps context (window size, max memory entries, chunk sizes) declaratively. The core code applies no explicit token budgeting; `n_results` on search is the only retrieval bound in code.

## Design decisions and trade-offs visible in the code

1. **Consolidated core, preserved history.** The root modules are a deliberately small, syntactically clean consolidation of a much larger multi-batch working system; the batch docs/configs/frontends were kept as the record of the full design. Trade-off: the repository is honest about being a foundation plus blueprints, rather than shipping a partially working monolith.
2. **CRUD API decoupled from agent execution.** The API manages SDLC records; the crew runs out-of-band. This keeps the API fast and testable without an LLM key, and makes agent invocation an explicit integration point instead of a hidden side effect. Trade-off: at HEAD, nothing persists crew output.
3. **Local-first AI stack.** Embeddings run locally (sentence-transformers) and the vector store is embedded ChromaDB, so retrieval works offline with no per-query cost; only the crew's LLM calls need a provider key. Trade-off: local embedding model quality/dimension (384) is fixed unless swapped.
4. **SQLite default with PostgreSQL escape hatch.** `DATABASE_URL` defaults to a file DB for zero-setup local runs; every compose file switches to PostgreSQL. Trade-off: two databases to keep honest, and no migration tooling wired yet (Alembic is pinned in requirements but has no `alembic.ini`/versions directory).
5. **Configuration as specification.** `manager_config.yaml` encodes the target operational envelope — per-phase timeouts and `max_iterations`, `approval_required` gates for human review, audit logging with sensitive-data masking, provider-routing for LLMs — ahead of the code that consumes it. This is the clearest statement of the intended production behavior and doubles as the integration spec.

## Extending this system

Grounded next steps, in the order the current seams suggest:

1. **Wire the crew into the API and persist its output.** Add `POST /projects/{id}/execute` that calls `CrewManager.execute_project` and writes stage outputs to `documents` (and stage status to `tasks`). The `Agent` table already stores a JSON `config` column — use it to parameterize role/goal/backstory instead of the hardcoded subclasses, making crews data-driven with no schema change.
2. **Give agents retrieval.** `crew_manager.py` already imports `BaseTool`; implement a `RAGSearchTool` that wraps `RAGSystem.search` and attach it to the agents. This closes the loop the Batch3B integration docs describe, and `manager_config.yaml`'s retrieval block (top-k, rerank, thresholds) is the ready-made tuning surface.
3. **Implement the Socket.IO server contract.** The three copies of `useSocket.ts` and the HITL components (WorkflowDesigner, CommentSystem, FilePreview) define the client protocol — auth token in the handshake, project/document rooms, `cursor_update` events. A `python-socketio` mount on the FastAPI app would make the committed frontends functional against the committed backend.
4. **Formalize the schema.** Add `ForeignKey` constraints and ORM relationships for `project_id` references, then initialize Alembic (already pinned) so the SQLite→PostgreSQL path in the compose files has migrations rather than `create_all`.
5. **Promote phase gates from config to code.** `manager_config.yaml`'s `phases` block (timeouts, iteration caps, `approval_required`) maps directly onto a state machine over the existing `Task.status` field, with approval pauses surfaced through the HITL frontend — turning the strongest piece of design in the repository into enforced behavior.
