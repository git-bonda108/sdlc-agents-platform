# Hardening

Current security and operational posture as committed, followed by a staged ladder to production grounded in what the code actually is: a local-first FastAPI + CrewAI + ChromaDB system with containerized deployment topologies.

## Current posture

**Authentication and authorization**
- None implemented. `API/main.py` has no auth middleware or dependency; every endpoint is anonymous. `SERVICES/Batch3B/manager_config.yaml` states the same explicitly (`enable_auth: false`, `api_key_required: false`, `rate_limiting: false`).
- Building blocks are staged but unused: `python-jose[cryptography]` and `passlib[bcrypt]` are pinned in `PREREQUISITES/requirements.txt`; `SECRET_KEY`, `JWT_ALGORITHM`, `JWT_EXPIRE_MINUTES` are declared in `.env.example`; the Batch5 frontend sends a bearer token in the Socket.IO handshake and the Batch5 docs describe JWT + RBAC. Nothing at HEAD validates a token.

**CORS**
- `allow_origins=["*"]` combined with `allow_credentials=True` in `API/main.py`. Beyond being over-permissive, this combination is rejected by the CORS spec (browsers will not honor wildcard-with-credentials), so it must change for any credentialed frontend to work at all. The code's own comment says "Configure properly in production"; `CORS_ORIGINS` in `.env.example` is the intended source.

**Secrets handling**
- All secrets flow through environment variables; `.env` is gitignored; `.env.example` contains placeholders only; `manager_config.yaml` uses `${VAR}` substitution throughout. No hardcoded provider keys exist anywhere in the tree (verified at HEAD — see the secrets review below).
- Compose files carry weak development defaults for infrastructure credentials (see review table).

**Error handling**
- API: 404s are explicit; everything else surfaces as unhandled-exception 500s. No global exception handler, no request validation beyond Pydantic types.
- RAG: a bare `except` on collection initialization can mask a corrupted store. Utility helpers log-and-return-safe-values, which keeps tools running but can hide failures from callers that don't check.

**Observability**
- Logging is `logging.basicConfig(INFO)` in `UTILS/helpers.py` plus CrewAI's `verbose=True`; the API itself logs nothing beyond uvicorn access logs. `structlog` and `prometheus-client` are pinned but unwired. The Batch5 compose defines Prometheus and Grafana services (behind a `monitoring` profile) and per-service healthchecks; the Batch7 compose adds restart policies. The audit block in `manager_config.yaml` (file logging, rotation, sensitive-data masking) is declared, not implemented.

**Deployment surface**
- `PREREQUISITES/Dockerfile` runs uvicorn as root on `0.0.0.0:8000` with no non-root user and copies the whole tree into the image. Compose files publish PostgreSQL (5432) and Redis (6379) to the host. Nginx with an SSL volume exists in the Batch5/Batch7 topologies, so a TLS termination point is already designed in.
- Repository hygiene: `UI/Batch5/frontend/.next/cache/config.json` is a committed Next.js build-cache artifact (harmless — a telemetry timestamp — but `.next/` belongs in `.gitignore`), and `PREREQUISITES/package.json` is a stray vendored npm manifest.

## Staged ladder to production

**Stage 1 — Identity, keys, and transport**
1. Pin CORS to explicit origins from `CORS_ORIGINS` and drop the wildcard/credentials combination.
2. Implement JWT issuance/validation with the already-pinned `python-jose`/`passlib`, keyed by `SECRET_KEY`; protect the write endpoints first, then reads. The Socket.IO handshake token in the frontends defines the client contract.
3. Move infrastructure credentials out of compose literals: `env_file`/Docker secrets locally, a managed secret store (Vault, or the cloud provider's) beyond that. Change every development default (`password`, `sdlc_pass`, `hitl_password`, Grafana `admin`) at deploy time.
4. Terminate TLS at the nginx layer that Batch5/Batch7 compose files already define; stop publishing Postgres/Redis ports to the host — internal networks exist in both files.

**Stage 2 — Monitoring and failure behavior**
1. Wire `structlog` for structured request logging and `prometheus-client` for request/latency counters (both already in requirements); expose `/metrics` and point the existing Prometheus service at it.
2. Add a global exception handler returning structured errors, replace the bare `except` in `RAG/rag_system.py` with a narrow one that logs the failure, and add timeouts/retries around LLM calls using the `max_retries`/`timeout` values `manager_config.yaml` already specifies.
3. Extend the healthcheck pattern from the Batch5 compose to the primary compose; have `/health` verify database connectivity rather than returning a constant.
4. Implement the audit-logging block from `manager_config.yaml` (rotating file, sensitive-data masking) before any multi-user deployment.

**Stage 3 — Deployment engineering**
1. Dockerfile: non-root user, `.dockerignore` (exclude `UI/`, `DOCS/`, `chroma_db/`), multi-worker server (`uvicorn --workers` or gunicorn+uvicorn workers), pinned base image digest.
2. Adopt Alembic migrations (pinned, unconfigured) so PostgreSQL schema changes are versioned; stop relying on `create_all`.
3. Vulnerability scanning: `pip-audit`/`safety` for the requirements file — the AI pins (`crewai==0.1.0`, `langchain==0.0.340`, `torch==2.1.0`) are old and should be upgraded deliberately — plus image scanning (Trivy) in CI.
4. Backups for the two stateful stores: PostgreSQL dumps and the ChromaDB persist directory, with restore drills.

**Stage 4 — Compliance and operations**
1. Access control roles: the Batch5 design (Admin/PM/Developer/QA/Stakeholder RBAC) is the spec; enforce roles server-side once JWT lands.
2. Data lifecycle: retention/deletion for `documents` rows and their vector-store counterparts (deletes must hit both stores — `RAGSystem.delete_document` exists for the vector side).
3. Rate limiting and request size caps (`MAX_FILE_SIZE` is declared in `.env.example`) at the nginx layer.
4. Periodic secret rotation and dependency-update cadence, documented in the repository.

## Secrets review at HEAD

The following credential-like strings were individually inspected. **None is a live credential; nothing needed redaction, and no history purge or rotation is required.** All are development defaults or placeholders — they still must be overridden in any non-local deployment (Stage 1.3).

| Path | Finding | Verdict |
|---|---|---|
| `PREREQUISITES/docker-compose.yml` | `POSTGRES_PASSWORD=password` (and matching `DATABASE_URL`) | Development default, not a real secret |
| `PREREQUISITES/.env.example` | `SECRET_KEY=your-secret-key-here-change-in-production`, `OPENAI_API_KEY=your-openai-api-key-here` | Placeholders only — correct pattern for an example file |
| `CONFIG/Batch7/docker-compose.yml` | `POSTGRES_PASSWORD=sdlc_pass` (and matching `DATABASE_URL`) | Development default |
| `CONFIG/Batch5/docker-compose.yml` | `POSTGRES_PASSWORD=hitl_password`, `SECRET_KEY=your-secret-key-change-in-production`, `GF_SECURITY_ADMIN_PASSWORD=admin` | Development defaults / placeholders |
| `MODELS/Batch7/docs/migration_guide.md` | References to `API_KEYS`/`SECRET_KEY` as configuration concepts | Documentation prose; contains no values |
| `SERVICES/Batch3B/manager_config.yaml` | `api_key`/`api_token` fields for the LLM deployment and issue-tracker integrations, all as `${ENV_VAR}` references | Environment-variable substitution; no literal values |

A pattern-level sweep of the full tree (provider key formats, private-key blocks, JWT literals, generic `key/token/password =` assignments) found no other credential-like material. `.gitignore` already excludes `.env`.
