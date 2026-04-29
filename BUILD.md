# BUILD.md — Transcend (tetherai) Android Build Runbook

**Audience:** future-Zero (or anyone) building this repo's APK on the mecp-server VM.

**Scope:** From a clean checkout at tag `v13-stable` to a signed release APK + Firebase Test Lab run.

---

## TL;DR — 3 pre-flight checks, 1 build, 1 test

The build keeps failing on 3 specific landmines because 3 things are **gitignored** and therefore **lost on every clean / revert**:

1. `.env` — loses `EXPO_PUBLIC_*` vars → WDK silently hangs at runtime
2. `node_modules/bare-lief` — ships no android-arm64 prebuild → `:react-native-bare-kit:link` fails
3. `android/` — Expo-managed native dir → no `gradlew` until prebuild runs

Fix them in order, then build. Don't guess.

---

## Environment (every shell)

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64     # JDK 21 on this box is JRE-only
export ANDROID_HOME=/home/gnufoo/clawd/build-infra/android-sdk   # persistent copy; NOT /tmp/android-sdk
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH
cd ~/clawd/build-infra/tetherai
```

---

## Pre-flight (run every time `android/` is regenerated or tree is reset)

### 1. Seed `.env` (gitignored — will be absent after revert)

```bash
[ -f .env ] || cat > .env <<'EOF'
EXPO_PUBLIC_WDK_INDEXER_BASE_URL=https://wdk-api.tether.io
EXPO_PUBLIC_WDK_INDEXER_API_KEY=demo
EXPO_PUBLIC_TRON_API_KEY=demo
EXPO_PUBLIC_TRON_API_SECRET=demo
EOF
```

**Why:** Expo inlines `EXPO_PUBLIC_*` at bundle time. Missing file → `undefined` → the WDK Bare worklet awaits `fetch('undefined/api/...')` forever. Symptom: "Initializing wallet…" never advances.

For demo/test runs, `demo` keys are fine. For real network interaction, ask Tony for actual keys.

### 2. Remove `bare-lief` from node_modules

```bash
npm rm bare-lief --legacy-peer-deps   # --legacy-peer-deps is required (peer conflict with @qvac/sdk)
```

Verify it's actually gone:
```bash
find node_modules -maxdepth 4 -name bare-lief -type d   # expect empty
```

**Why:** `bare-lief` (any version currently in the tree) publishes prebuilds for `linux-*`, `darwin-*`, `win32-*` — but **not `android-arm64`**. The `:react-native-bare-kit:link` gradle task tries to `copyfile` the missing `.bare` binary → `ENOENT` → build fails. We don't need `bare-lief` for this app; removing it is the fix.

### 3. Prebuild `android/` if missing

```bash
if [ ! -f android/gradlew ]; then
  rm -rf android
  npx expo prebuild --platform android --clean
fi
echo "sdk.dir=$ANDROID_HOME" > android/local.properties   # gradle needs this to find the SDK
```

**Why:** Expo regenerates `android/` from `app.json`. It's gitignored (`/android` in `.gitignore`). On a fresh checkout or after `rm -rf android`, there's no `gradlew`. Prebuild takes ~30 sec.

---

## Build

```bash
cd android
./gradlew assembleRelease --no-daemon
# ~5-10 min clean (on this VM, nproc=16). Incremental: ~1-3 min.
```

Output:
```
app/build/outputs/apk/release/app-release.apk      # ~1.4 GB, all 4 ABIs
```

**Use `assembleRelease`, NOT `assembleDebug`.** Debug = Expo dev-client shell (requires Metro bundler running). Release = self-contained, signed with `android/app/debug.keystore` (pwd: `android` — fine for sideloading).

---

## Test on Firebase Test Lab

```bash
cd ~/clawd/build-infra/tetherai
bash scripts/firebase-test.sh android/app/build/outputs/apk/release/app-release.apk
# ~10-15 min end-to-end (upload to GCS + provisioning + robo run + download results)
```

Results land in `./test-results/<timestamp>/` with:
- `logcat` — full device log, grep for `ReactNativeJS`, `[wdk]`, `[qvac]`, `FATAL`, `CRASH`
- `video.mp4` — screen recording of the robo run
- screenshots per activity

Config (already set in the script):
- Project: `zero-485510`
- Bucket: `gs://zero-apk-delivery`
- Device: `MediumPhone.arm` API 34
- Timeout: 300s

---

## Known failure modes

| Symptom | Root cause | Fix |
|---|---|---|
| `:react-native-bare-kit:link FAILED` / `ENOENT ... bare-lief.bare` | `bare-lief` present, no android-arm64 prebuild | `npm rm bare-lief --legacy-peer-deps` |
| `./gradlew: No such file or directory` | `android/` not prebuilt | `npx expo prebuild --platform android --clean` |
| `SDK location not found` | `android/local.properties` missing | `echo "sdk.dir=$ANDROID_HOME" > android/local.properties` |
| Gradle: `JAVA_COMPILER` / toolchain not provided | JDK 21 selected (JRE-only on this host) | Export `JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64` |
| APK installs, wallet hangs on "Initializing wallet…" | `.env` missing when APK was built | Recreate `.env`, rebuild |
| `npm rm bare-lief` → ERESOLVE | Peer dep pinning from `@qvac/sdk` | Always pass `--legacy-peer-deps` |
| APK SIGABRTs with `ADDON_NOT_FOUND` on launch | Bare addon version mismatch (e.g. worklet pins `libbare-crypto.1.11.6.so`, APK has `1.13.4.so`) | Do NOT let WDK's postinstall regenerate the worklet bundle. Restore with `git checkout v13-stable -- node_modules/@tetherto/pear-wrk-wdk` or reinstall that exact package without triggering a broader `npm install`. |

---

## Session budget

- Clean build: 10-15 min (prebuild 30s + gradle 5-10 min + CMake for 4 ABIs).
- Firebase Test Lab: 10-15 min.
- **Plan for ~25-30 min wall time** from "start build" to "have logcat". Don't start unless you can commit that.

---

## Why this file exists

This repo's build has 3 non-obvious landmines (gitignored `.env`, unshipped arm64 prebuild, Expo-managed `android/`). Each takes 5-20 min to rediscover on a fresh session. This file short-circuits that. Keep it updated when a new landmine appears — the rule is: **if a future session would waste >5 min rediscovering it, write it here.**

Related:
- `~/clawd/skills/apk-build-serve/SKILL.md` — cross-project Android-build skill (same content, cross-referenced)
- `~/clawd/memory/2026-04-19.md` — debug log for ADDON_NOT_FOUND / worklet version mismatch
