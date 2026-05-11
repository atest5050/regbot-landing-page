#!/bin/sh
set -e

echo "=== Installing Node.js ==="
brew install node@20 || true
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
node --version
npm --version

echo "=== Installing dependencies ==="
cd "$CI_PRIMARY_REPOSITORY_PATH"
npm ci

echo "=== Building web assets ==="
npm run build

echo "=== Syncing Capacitor ==="
npx cap sync ios

echo "=== Done ==="
