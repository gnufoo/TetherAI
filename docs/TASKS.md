# Task Log

## Task 002 — Custom Dev Client build (Phase 2a)

**Goal:** Produce a custom Expo Dev Client APK that includes WDK's native
dependencies, install it on your phone, and confirm hot reload still works.

### Background

Expo Go can only load apps that use libraries pre-bundled in Expo Go itself.
WDK brings its own native crypto stack (sodium-native, bare-kit). So we need a
**custom dev client** — think "Expo Go, but with our specific native modules".

After this one-time APK is installed, `npx expo start --dev-client` gives us
the same hot reload workflow as before.

### Prerequisites

- EAS account (you just created one ✅)
- Java JDK 17+ (Android Studio includes this at
  `C:\Program Files\Android\Android Studio\jbr`)
- Android SDK (you have this via Android Studio)
- `ANDROID_HOME` env var pointing to the SDK

### Steps

```bash
cd ~/Work/Projects/gnufoo/TetherAI

# 1. Pull latest
git checkout -- .   # discard any local changes
git pull

# 2. Fresh install with WDK + dev-client deps
rm -rf node_modules package-lock.json
npm install

# 3. Sanity check — should list WDK packages
ls node_modules/@tetherto/
ls node_modules/expo-dev-client

# 4. Log into EAS
npx eas login

# 5. Configure the project (first time only)
npx eas init
# Answers when prompted:
#   - Project owner: <your username>
#   - Project slug: tetherai (or accept default)
# This updates app.json with projectId + eas.json with your account

# 6. Prebuild native projects (generates android/ and ios/ folders)
npx expo prebuild --clean

# 7. Local EAS build (takes 10-20 min first time, faster after)
#    This produces an APK in the repo root.
npx eas build --profile development --platform android --local
```

### If local build has issues

Common issues and fixes:

**"Cannot find Android SDK":**
```bash
export ANDROID_HOME="/mnt/c/Users/<YOU>/AppData/Local/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator"
```

**"JAVA_HOME not set":**
```bash
export JAVA_HOME="/mnt/c/Program Files/Android/Android Studio/jbr"
```

**WSL Android SDK issues:** Build can be slow when the SDK is on the Windows
side (NTFS). Consider installing Android SDK inside WSL for speed. Or fall
back to cloud EAS:
```bash
npx eas build --profile development --platform android
# Builds in Expo's cloud, you download the APK from the link it gives you.
```

### When the build succeeds

You'll have a file like `build-XXXXXXXXXXXX.apk` in the project root.

```bash
# Install on phone via ADB (phone connected via USB, USB debugging on)
adb install -r ./build-*.apk

# OR — email the APK to yourself, open on phone, tap to install.
# Android will warn "Install from unknown source" — allow it.

# Once installed, open the "TetherAI" app icon on your phone.
# It will wait for a dev server.

# Start Metro with dev-client mode
npx expo start --dev-client --tunnel

# Scan the QR code from the TetherAI app
# (NOT from Expo Go anymore — this app has its own QR scanner)
```

### What you should see

Same UI as v0.1 (home + 3 tiles). The wallet screen now says:
- "USDT BALANCE · TRON"
- "0.00 USDT"
- "≈ NGN 0"
- "Wallet not initialized"
- "Network: Tron · Address: —"
- "Backend: stub (awaiting WDK bare-kit bridge)"

### Report back to Zero

If it works: great, we move to Phase 2b (real WDK wiring).

If something breaks: screenshot + paste the error into chat.

---

## Task 001 — DONE ✅

v0.1 scaffold working on Expo Go. Home + 3 tiles. Visual identity locked.
