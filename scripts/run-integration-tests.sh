#!/bin/sh

set -eu

COMPOSE_FILE="./docker-compose.test.yml"
TEST_DATABASE_URL="postgresql://postgres:password@127.0.0.1:5433/matplant_test"

export NODE_ENV=test
export DATABASE_URL="$TEST_DATABASE_URL"
export MEILISEARCH_HOST="http://127.0.0.1:7700"
export MEILISEARCH_KEY="test-key"

docker compose -f "$COMPOSE_FILE" up -d --wait
bun run db:push:test
bun test
