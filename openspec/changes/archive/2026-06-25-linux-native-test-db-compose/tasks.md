## 1. Shared Test Database Infrastructure

- [x] 1.1 Add a checked-in Docker Compose definition for the dedicated integration test database with explicit name, port, credentials, and healthcheck.
- [x] 1.2 Replace the PowerShell-based `db:test:start` and `db:test:stop` package scripts with a compose-based test script that automatically starts the test database before running tests.
- [x] 1.3 Remove or retire the old `scripts/start-test-db.ps1` and `scripts/stop-test-db.ps1` entry points after the compose flow is working.

## 2. Test Bootstrap and CI Wiring

- [x] 2.1 Simplify `src/test/setup-env.ts` so it no longer parses `.env.test` manually, loads env dynamically, or remaps `TEST_DATABASE_URL` into `DATABASE_URL`.
- [x] 2.2 Keep a small, explicit safety check in the test bootstrap that rejects any `DATABASE_URL` that does not exactly match the compose-defined test database URL.
- [x] 2.3 Update `.github/workflows/ci.yml` to use the same compose-based test workflow as local development, wait for readiness, push the test schema, and run the suite with `NODE_ENV=test`.

## 3. Developer Experience and Verification

- [x] 3.1 Update package scripts and repository docs so local WSL/Linux development uses the same compose-based test flow as CI.
- [x] 3.2 Verify the integration suite still passes against the dedicated compose-managed test database.
- [x] 3.3 Confirm the safety guard blocks a non-test `DATABASE_URL` and allows the dedicated test database URL.
