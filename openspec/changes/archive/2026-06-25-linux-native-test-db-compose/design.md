## Context

The repository currently starts the backend test database through PowerShell scripts and uses a GitHub Actions workflow that defines Postgres separately from local development. Test bootstrap logic in `src/test/setup-env.ts` also loads `.env.test`, remaps `TEST_DATABASE_URL` into `DATABASE_URL`, and enforces a coarse safety check before backend tests run.

The goal is to make local development in WSL/Linux and CI use the same dedicated test database setup while keeping the existing integration tests and their safety properties intact.

## Goals / Non-Goals

**Goals:**

- Use one explicit Docker Compose definition for the dedicated test database in local development and CI.
- Keep integration tests isolated from the development database.
- Remove `TEST_DATABASE_URL` to `DATABASE_URL` remapping and other unnecessary bootstrap indirection.
- Keep a clear, small guard that refuses to run tests against a non-test database.
- Run integration tests with `NODE_ENV=test` so test-only behavior is explicit and consistent.
- Preserve current test behavior, including schema push and Drizzle-backed integration tests.

**Non-Goals:**

- Changing the application development or production database configuration.
- Introducing a new database provider, migration system, or test framework.
- Changing the integration test assertions or fixture behavior.
- Adding a separate seeding workflow for tests unless one already exists as part of the current suite.

## Decisions

- **Shared compose file for test infrastructure**. Use a single checked-in compose file for the test database rather than a GitHub Actions service block plus separate local scripts.
  - Rationale: the compose file becomes the source of truth for host, port, database name, and credentials, so local and CI stay aligned.
  - Alternative considered: keep CI service config and only replace local scripts. Rejected because it preserves two definitions of the same infrastructure.

- **Compose-provided `DATABASE_URL` for tests**. Let Docker Compose provide the dedicated test database connection string directly and use it unchanged in tests.
  - Rationale: the connection string should come from the compose environment itself, so there is no second variable or runtime rewrite to keep in sync.
  - Alternative considered: keep `TEST_DATABASE_URL` as a separate input and continue rewriting it in `setup-env.ts`. Rejected because it obscures the true connection target.

- **Keep a minimal bootstrap helper**. Retain a small `src/test/setup-env.ts` or equivalent preload only if needed for `NODE_ENV`-gated safety checks; remove env-file parsing, dynamic env loading, and URL remapping.
  - Rationale: the suite only needs a single explicit guard to stop accidental use of a non-test database.
  - Alternative considered: remove bootstrap code entirely and push every check into CI and shell scripts. Rejected because the safety guard should live with the test bootstrap.

- **Use fixed, dedicated test coordinates**. Keep a stable test port, database name, and credentials in compose.
  - Rationale: predictable settings simplify the safety guard and make the local/CI setup easy to reason about.
  - Alternative considered: dynamically allocate ports or generate credentials. Rejected because test infrastructure is local-only and does not benefit from extra variability.

- **Use compose health checks instead of ad hoc waiting**. Let CI wait on the compose service readiness rather than sleeping or probing manually.
  - Rationale: readiness is part of the database definition and should live with the database definition.
  - Alternative considered: leave CI to use the existing Postgres service with a separate health probe. Rejected because it keeps CI-specific behavior separate from local behavior.

## Risks / Trade-offs

- [Risk] Fixed test port can conflict with another local Postgres instance. → Mitigation: document the port clearly and keep the test database isolated so the failure mode is obvious.
- [Risk] A too-permissive safety check could still allow an unsafe database URL. → Mitigation: validate the compose-defined test URL exactly instead of relying on a generic substring check.
- [Risk] A too-strict safety check could block legitimate local setups. → Mitigation: keep the accepted test URL exactly aligned with the compose file and avoid any alternate test URL forms.
- [Risk] CI and local compose drift if the workflow re-specifies settings. → Mitigation: source the workflow from the same compose file and avoid duplicating connection details in GitHub Actions, scripts, or TypeScript.

## Migration Plan

1. Add the shared test compose file and update the package scripts so running tests automatically starts it.
2. Update GitHub Actions to use the compose file for the test database and wait for readiness.
3. Simplify `src/test/setup-env.ts` so it no longer remaps database URLs and only performs the minimal safety check.
4. Update docs and examples to show the new Linux/WSL workflow.
5. Run the full integration suite locally and in CI to confirm the test behavior is unchanged.

Rollback strategy:

- Revert the workflow and package scripts to the existing service/shell-script setup if the compose flow introduces a regression.
- Keep the safety check intact during rollout so failures remain explicit instead of silently hitting the wrong database.

## Open Questions

- Should the minimal test bootstrap live in `src/test/setup-env.ts` or move to a different preload module if that makes the test entry points clearer?
