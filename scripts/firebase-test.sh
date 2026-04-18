#!/usr/bin/env bash
# Firebase Test Lab runner for Transcend APK
# Usage: ./scripts/firebase-test.sh [path-to-apk]
#
# If no APK path given, builds a fresh release APK first.
# Results: logcat, video, screenshots stored in GCS and downloaded locally.

set -euo pipefail

PROJECT_ID="zero-485510"
RESULTS_BUCKET="gs://zero-apk-delivery"
DEVICE_MODEL="MediumPhone.arm"
DEVICE_VERSION="34"
TIMEOUT="300s"
LOCAL_RESULTS="./test-results"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[firebase-test]${NC} $*"; }
warn() { echo -e "${YELLOW}[firebase-test]${NC} $*"; }
err() { echo -e "${RED}[firebase-test]${NC} $*" >&2; }

# Determine APK
APK_PATH="${1:-}"
if [[ -z "$APK_PATH" ]]; then
  log "No APK specified. Building release APK..."
  cd "$(dirname "$0")/.."
  export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
  cd android && ./gradlew assembleRelease --no-daemon -q
  APK_PATH="$(find app/build/outputs/apk/release -name '*.apk' | head -1)"
  cd ..
  if [[ -z "$APK_PATH" ]]; then
    err "Build failed — no APK found"
    exit 1
  fi
  APK_PATH="android/$APK_PATH"
  log "Built: $APK_PATH"
fi

# Upload APK to GCS if local path
if [[ "$APK_PATH" != gs://* ]]; then
  APK_NAME="$(basename "$APK_PATH")"
  GCS_APK="${RESULTS_BUCKET}/${APK_NAME}"
  log "Uploading APK to $GCS_APK ..."
  gsutil -q cp "$APK_PATH" "$GCS_APK"
else
  GCS_APK="$APK_PATH"
  APK_NAME="$(basename "$APK_PATH")"
fi

# Generate unique results dir
TIMESTAMP="$(date -u +%Y%m%d-%H%M%S)"
RESULTS_DIR="test-results/${APK_NAME%.apk}-${TIMESTAMP}"

log "Running robo test on ${DEVICE_MODEL} (API ${DEVICE_VERSION})..."
log "Results dir: ${RESULTS_BUCKET}/${RESULTS_DIR}/"

gcloud firebase test android run \
  --type robo \
  --app "$GCS_APK" \
  --device model="${DEVICE_MODEL}",version="${DEVICE_VERSION}" \
  --timeout "$TIMEOUT" \
  --results-bucket="$RESULTS_BUCKET" \
  --results-dir="$RESULTS_DIR" \
  --no-auto-google-login \
  --format=json \
  2>&1 | tee /tmp/firebase-test-output.json

EXIT_CODE=${PIPESTATUS[0]}

# Download results locally
mkdir -p "$LOCAL_RESULTS/$TIMESTAMP"
log "Downloading results..."
gsutil -q -m cp -r "${RESULTS_BUCKET}/${RESULTS_DIR}/**" "$LOCAL_RESULTS/$TIMESTAMP/" 2>/dev/null || true

# Parse logcat for our app logs
LOGCAT="$LOCAL_RESULTS/$TIMESTAMP/logcat"
if [[ -f "$LOGCAT" ]] || LOGCAT="$(find "$LOCAL_RESULTS/$TIMESTAMP" -name 'logcat' | head -1)"; then
  log ""
  log "=== APP LOGS (ReactNativeJS) ==="
  grep "ReactNativeJS" "$LOGCAT" 2>/dev/null | grep -v "at Object\|at async\|at fn\|Version:\|URL:\|Request body:" | head -60
  
  log ""
  log "=== ERRORS ==="
  grep -E "ReactNativeJS.*E |FATAL|CRASH|ANR" "$LOGCAT" 2>/dev/null | head -20

  log ""
  log "=== KEY EVENTS ==="
  grep -E "\[keychain-patch\]|\[wdk\]|\[qvac\]|\[model-asset\]|IllegalBlock|CRYPTO_FAILED" "$LOGCAT" 2>/dev/null | head -30
fi

# Check for video
VIDEO="$(find "$LOCAL_RESULTS/$TIMESTAMP" -name 'video.mp4' 2>/dev/null | head -1)"
if [[ -n "$VIDEO" ]]; then
  log ""
  log "📹 Test video: $VIDEO"
fi

# Summary
log ""
if [[ $EXIT_CODE -eq 0 ]]; then
  log "✅ Test completed successfully"
else
  warn "⚠️  Test finished with exit code $EXIT_CODE"
fi

log "Results: $LOCAL_RESULTS/$TIMESTAMP/"
log "GCS: ${RESULTS_BUCKET}/${RESULTS_DIR}/"
log "Console: https://console.firebase.google.com/project/${PROJECT_ID}/testlab/histories/"

exit $EXIT_CODE
