# TranscenD

**The future of USD₮, on your phone.**

Mobile USD₮ wallet built on the [Tether Wallet Development Kit (WDK)](https://docs.wdk.tether.io/), extended with Transsion-native capabilities:

1. **WDK Tether Wallet** — full multi-chain USD₮ wallet powered by WDK + Bare runtime
2. **Tether Edge AI** — on-device agentic intelligence for your wallet
3. **Offline USD₮ Transfer** — device-to-device USD₮ transfers with no internet required

## Foundation

TranscenD forks from [`@tetherto/wdk-starter-react-native`](https://github.com/tetherto/wdk-starter-react-native) (Apache 2.0). We extend the reference implementation with the three pillars above.

## Stack

- **Expo** ~54 (React Native 0.81.4, React 19.1.0)
- **expo-router** for file-based routing
- **Tether WDK** via `@tetherto/wdk-react-native-provider` + `react-native-bare-kit`
- **Bare runtime** for isolated cryptographic operations
- **Android minSdk 29** (required by bare-kit)
- **iOS 15.1+**

## Build Pipeline

Server-side builds on `mecp-server` (see `../BUILD_PIPELINE.md`).
Triggered by Zero, delivered as APK via HTTP tunnel.

## Local Development

```bash
# After build: install APK on device, then
npx expo start --dev-client --tunnel
```

## Configuration

Create `.env` from `.env.example` and fill in API keys for full functionality
(WDK Indexer, Tron provider).

## License

Apache 2.0 (inherited from WDK starter).
