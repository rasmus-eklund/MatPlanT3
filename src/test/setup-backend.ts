import { plugin } from "bun";
import { mock } from "bun:test";

import "~/test/setup-env";

plugin({
  name: "backend-test-server-only",
  setup(build) {
    build.onResolve({ filter: /^server-only$/ }, () => ({
      path: "server-only",
      namespace: "backend-test",
    }));
    build.onLoad({ filter: /.*/, namespace: "backend-test" }, () => ({
      contents: "",
      loader: "js",
    }));
  },
});

void mock.module("server-only", () => ({}));
