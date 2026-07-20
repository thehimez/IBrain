#!/bin/bash
set -e

echo "==> Installing root dependencies"
bun install

echo "==> Installing frontend dependencies"
cd frontend && bun install && cd ..

echo "==> Installing mobile dependencies"
cd mobile && bun install && cd ..

echo "==> Running database migrations"
bun run src/cli.ts migrate --yes 2>/dev/null || true

echo "==> Post-merge setup complete"
