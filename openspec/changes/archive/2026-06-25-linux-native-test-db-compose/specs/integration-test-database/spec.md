## ADDED Requirements

### Requirement: Integration tests use a dedicated compose-managed database

The system SHALL provide a dedicated PostgreSQL test database through a single explicit Docker Compose configuration that is shared by local development and CI, and that configuration SHALL be the source of truth for the test database host, port, database name, and credentials.

#### Scenario: Local and CI start the same test database definition

- **WHEN** a developer or CI job starts the integration test database
- **THEN** both environments use the same compose-managed PostgreSQL service definition and connection settings

#### Scenario: The test database is isolated from development data

- **WHEN** the integration test database starts
- **THEN** it uses a dedicated database name, credentials, and host port that are not shared with the development database

#### Scenario: Running tests starts the compose-managed database

- **WHEN** the integration test command runs
- **THEN** the test workflow starts the compose-managed test database before executing tests

#### Scenario: Development database settings remain unchanged outside tests

- **WHEN** a developer runs application code outside the test command
- **THEN** the normal development `DATABASE_URL` continues to work without compose-managed test database startup

### Requirement: Integration tests run in test mode

The system SHALL run backend integration tests with `NODE_ENV=test`, and test-only setup SHALL be triggered from that flag.

#### Scenario: The integration test command sets test mode explicitly

- **WHEN** the integration test command starts
- **THEN** it runs with `NODE_ENV=test`
- **AND** the test bootstrap uses that flag to enable test-only behavior

#### Scenario: Non-test commands do not activate test bootstrap

- **WHEN** a non-test command runs without `NODE_ENV=test`
- **THEN** the test-only bootstrap path does not activate

### Requirement: Integration tests refuse unsafe database targets

The system SHALL refuse to run backend integration tests unless the configured `DATABASE_URL` exactly matches the compose-defined test database connection string.

#### Scenario: A non-test database URL is detected

- **WHEN** the integration test bootstrap sees a `DATABASE_URL` that does not exactly match the compose-defined test database connection string
- **THEN** the test run aborts before executing any integration tests

#### Scenario: A dedicated test database URL is configured

- **WHEN** the integration test bootstrap sees the compose-defined test database connection string in `DATABASE_URL`
- **THEN** the test run proceeds normally

### Requirement: Integration test bootstrap remains minimal

The system SHALL keep integration-test environment setup limited to a minimal safety check and SHALL NOT parse env files, load environment values dynamically, or remap `TEST_DATABASE_URL` into `DATABASE_URL`.

#### Scenario: Test bootstrap performs only the safety check

- **WHEN** the integration test environment is initialized
- **THEN** it performs only the safety check needed to validate the compose-provided `DATABASE_URL`

#### Scenario: Development runs keep using the normal database URL

- **WHEN** the application or development tooling runs without `NODE_ENV=test`
- **THEN** the normal `DATABASE_URL` remains untouched and no test bootstrap is applied
