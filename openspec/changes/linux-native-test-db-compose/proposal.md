## Why

Backend integration tests currently rely on environment indirection and separate startup paths, which makes the test flow harder to reason about on WSL/Linux and risks local and CI database settings drifting apart.

## What Changes

- Make Docker Compose the single source of truth for the integration test database host, port, database name, and credentials.
- Run the integration test command with `NODE_ENV=test` and use that flag to trigger test-only setup.
- Start the test database automatically as part of the test workflow through Docker Compose so local development and CI use the same path.
- Simplify test bootstrap so `src/test/setup-env.ts` only performs a minimal safety check and does not parse env files, load env dynamically, or remap database URLs.
- Remove all `TEST_DATABASE_URL` to `DATABASE_URL` translation logic.
- Keep development behavior unchanged outside of tests so developers can continue using their normal `DATABASE_URL`.

## Capabilities

### New Capabilities

- `integration-test-database`: dedicated local test database provisioning, explicit configuration, and safety checks for backend integration tests.

### Modified Capabilities

- None.

## Impact

- `scripts/start-test-db.ps1` and `scripts/stop-test-db.ps1` are replaced by compose-based startup and shutdown.
- `.github/workflows/ci.yml` and local test scripts both use the same compose-managed test database workflow.
- `src/test/setup-env.ts` is reduced to a small safety guard or removed if the guard moves elsewhere.
- `package.json` test scripts and any README instructions need to reflect the shared compose workflow and `NODE_ENV=test` trigger.
- The integration test database remains isolated from the development database and continues to back the existing Drizzle-backed tests.
