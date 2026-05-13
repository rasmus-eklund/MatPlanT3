#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const mode = process.argv[2] ?? "working";

function git(args, options = {}) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "ignore"],
    ...options,
  });
}

function gitMaybe(args) {
  try {
    return git(args);
  } catch {
    return "";
  }
}

function splitNul(value) {
  return value.split("\0").filter(Boolean);
}

function unique(values) {
  return [...new Set(values)];
}

function trackedExisting(files) {
  return files.filter((file) => existsSync(file));
}

function stagedFiles() {
  return splitNul(
    git(["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"]),
  );
}

function workingFiles() {
  const modified = splitNul(
    git(["diff", "--name-only", "--diff-filter=ACMR", "-z"]),
  );
  const untracked = splitNul(
    git(["ls-files", "--others", "--exclude-standard", "-z"]),
  );

  return unique([...modified, ...untracked]);
}

function upstreamRef() {
  const upstream = gitMaybe([
    "rev-parse",
    "--abbrev-ref",
    "--symbolic-full-name",
    "@{u}",
  ]).trim();

  if (upstream) {
    return upstream;
  }

  return gitMaybe([
    "symbolic-ref",
    "--quiet",
    "--short",
    "refs/remotes/origin/HEAD",
  ])
    .trim()
    .replace(/^origin\//, "origin/");
}

function pushFiles() {
  const upstream = upstreamRef();

  if (!upstream) {
    return workingFiles();
  }

  const committed = splitNul(
    git([
      "diff",
      "--name-only",
      "--diff-filter=ACMR",
      "-z",
      `${upstream}...HEAD`,
    ]),
  );

  return unique([...committed, ...workingFiles()]);
}

function prettierBin() {
  const cli = join("node_modules", "prettier", "bin", "prettier.cjs");

  if (!existsSync(cli)) {
    console.error("Prettier is not installed. Run your package install first.");
    process.exit(1);
  }

  return cli;
}

function runPrettier(files) {
  if (files.length === 0) {
    return;
  }

  const result = spawnSync(
    process.execPath,
    [prettierBin(), "--write", "--ignore-unknown", ...files],
    { stdio: "inherit" },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function hasUncommittedChanges(files) {
  const result = spawnSync("git", ["diff", "--quiet", "--", ...files], {
    stdio: "ignore",
  });

  return result.status !== 0;
}

const files =
  mode === "pre-commit"
    ? stagedFiles()
    : mode === "pre-push"
      ? pushFiles()
      : workingFiles();

const existingFiles = trackedExisting(files);

if (existingFiles.length === 0) {
  process.exit(0);
}

runPrettier(existingFiles);

if (mode === "pre-commit") {
  execFileSync("git", ["add", "--", ...existingFiles], { stdio: "inherit" });
}

if (mode === "pre-push" && hasUncommittedChanges(existingFiles)) {
  console.error(
    "Prettier updated files. Commit those formatting changes, then push again.",
  );
  process.exit(1);
}
