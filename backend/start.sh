#!/bin/bash
# NestJS Backend Launcher
cd /app/backend
export PORT=8001
export MONGO_URL="${MONGO_URL:-mongodb://localhost:27017}"
export DB_NAME="${DB_NAME:-auto_platform}"
export JWT_SECRET="${JWT_SECRET:-auto-platform-secret-key-2024}"
export NODE_ENV="${NODE_ENV:-development}"
exec yarn dev
