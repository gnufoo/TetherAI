# Task log — for Tony's local Claude Code

Zero (on GCP) pushes tasks here. Tony's local Claude Code picks up the latest,
executes on the Windows machine + Android emulator, commits results back.

## Workflow for local Claude Code

1. `git pull` in the repo
2. Read the most recent task at the bottom of this file
3. Execute it on Tony's Windows machine
4. Write results to `docs/results/NNN-summary.md`
5. If a screenshot was requested: `adb exec-out screencap -p > docs/screens/NNN.png`
6. If logs were requested: `adb logcat -d -t 300 > docs/logs/NNN-logcat.txt`
7. `git add . && git commit -m "results: task NNN" && git push`

## Current Task: 001 — First build & smoke test

**Zero wants to see:** The app running on your Android emulator.

**Steps for Claude Code on Windows:**

```powershell
# Make sure you're in the repo dir
cd C:\Users\<you>\TetherAI   # wherever you cloned it

# Pull latest
git pull

# Install dependencies (first time, takes a few min)
npm install

# Start an emulator (pick any AVD you have set up)
# If you don't have one, create one in Android Studio:
#   Tools → Device Manager → Create Device → Pixel 7 → API 34 (Android 14)
#
# List available AVDs:
#   & "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -list-avds
#
# Boot one:
#   & "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd <NAME>

# Wait for emulator to be ready:
adb wait-for-device
adb shell getprop sys.boot_completed    # should print '1' when ready

# Start Expo dev server (in a new terminal or background)
npx expo start --android

# OR if that fails, try explicitly:
npx expo run:android
```

**What to capture:**

1. Screenshot of the home screen once it loads: save to `docs/screens/001-home.png`
2. Screenshot after tapping "Wallet": save to `docs/screens/001-wallet.png`
3. Screenshot after tapping "On-device AI": save to `docs/screens/001-ai.png`
4. Screenshot after tapping "Agent": save to `docs/screens/001-agent.png`

**If any step fails:** Write what broke in `docs/results/001-summary.md` — include the exact error message. Zero will fix it in the next round.

**Tony's time commitment:** ~5–10 min for the `npm install`, then the app should come up on the emulator in ~30 sec.
