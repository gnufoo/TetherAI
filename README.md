# TetherAI

**A sovereign wallet + on-device AI demo** — built to pitch a Tether × Transsion partnership.

Target hardware: Infinix Note 50 Pro (Mali-G57 MC2, 8GB RAM).
Powered by: Tether WDK (wallet) + Tether QVAC (edge AI, coming in v0.3).

## Quick Start (Windows development machine)

**Prerequisites:**
- Node 20+ (you have via Android Studio tooling)
- Android Studio with at least one AVD (emulator) set up
- Git configured

**First-time setup:**
```powershell
# Clone (you already did this)
git clone https://github.com/gnufoo/TetherAI.git
cd TetherAI

# Install dependencies
npm install

# Start Expo dev server
npx expo start
# Press 'a' to launch on Android emulator
# Press 'r' to reload, 'shift+r' to clear cache + reload
```

**Every iteration after that:**
```powershell
git pull            # Pull latest changes from Zero (on GCP)
# App hot-reloads automatically if Expo is running
# If package.json changed: npm install first
```

## How to Send State Back to Zero

Zero can't see your emulator. Help him by committing screenshots and logs:

```powershell
# Screenshot the emulator
adb exec-out screencap -p > docs\screens\latest.png
git add docs\screens\latest.png
git commit -m "screenshot: [what screen]"
git push

# Grab recent logs
adb logcat -d -t 200 > docs\logcat.txt
git add docs\logcat.txt
git commit -m "logs: [what happened]"
git push
```

## Project Structure

```
TetherAI/
├── app/              # Expo Router screens (React Native)
├── src/
│   ├── wallet/       # WDK integration
│   ├── ai/           # QVAC integration (v0.3+)
│   ├── agent/        # Unified NL → action layer (v0.4+)
│   └── ui/           # Shared UI components
├── assets/           # Images, fonts
├── docs/             # Screenshots, logs, build notes
└── package.json
```

## Roadmap

- **v0.1** ← *you are here*: Scaffold + splash + wallet screen skeleton
- **v0.2**: WDK integration, seed generation, real USDT balance on Tron testnet
- **v0.3**: QVAC edge AI, BitNet 1B running locally
- **v0.4**: Unified agent — natural language → wallet actions
- **v1.0**: Infinix Note 50 Pro polish, demo video, Tether+Transsion pitch
