#!/usr/bin/env bash
# Copies pre-built QVAC worker bundle to SDK location
# This replaces what @qvac/sdk/expo-plugin would do during prebuild
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BUNDLE_SRC="$PROJECT_DIR/qvac/worker.bundle.js"
BUNDLE_DST="$PROJECT_DIR/node_modules/@qvac/sdk/dist/worker.mobile.bundle.js"

if [ -f "$BUNDLE_SRC" ]; then
  cp "$BUNDLE_SRC" "$BUNDLE_DST"
  echo "✅ QVAC worker bundle copied to SDK dist"
else
  echo "❌ QVAC worker bundle not found at $BUNDLE_SRC"
  exit 1
fi
