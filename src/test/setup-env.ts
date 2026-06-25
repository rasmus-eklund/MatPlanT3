const TEST_DATABASE_URL =
  "postgresql://postgres:password@127.0.0.1:5433/matplant_test";

if (process.env.DATABASE_URL !== TEST_DATABASE_URL) {
  throw new Error(
    `Refusing to run backend tests unless DATABASE_URL exactly matches ${TEST_DATABASE_URL}.`,
  );
}
