#!/bin/sh
set -e

echo "[entrypoint] Running database migrations..."
bunx prisma migrate deploy

echo "[entrypoint] Starting application..."
exec bun dist/src/main.js
