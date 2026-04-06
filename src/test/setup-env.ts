import { existsSync, readFileSync } from "fs";
import path from "path";

const loadEnvFile = (filePath: string) => {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] ??= value;
  }
};

loadEnvFile(path.resolve(process.cwd(), ".env.test"));

Object.assign(process.env, { NODE_ENV: "test" });
process.env.MEILISEARCH_HOST ??= "http://127.0.0.1:7700";
process.env.MEILISEARCH_KEY ??= "test-key";

if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "Set TEST_DATABASE_URL or DATABASE_URL before running backend integration tests.",
  );
}

if (
  !process.env.TEST_DATABASE_URL &&
  !process.env.DATABASE_URL.toLowerCase().includes("test")
) {
  throw new Error(
    "Refusing to run backend tests without TEST_DATABASE_URL. Use a dedicated test database.",
  );
}
