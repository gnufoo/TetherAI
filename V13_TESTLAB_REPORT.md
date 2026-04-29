# v13-stable Firebase Test Lab Verdict — 2026-04-19 09:36 UTC

**Build:** commit `5c04018` (`v13-stable` tag), clean release APK, 1.4 GB
**Device:** MediumPhone.arm API 34 (arm64 emulator)
**Run:** `matrix-1u2poynrldf7z` · test time 22s · outcome: **Application crashed**

## TL;DR

v13-stable **does not run cleanly on a stock Firebase Test Lab device.** It crashes ~5s after wallet creation. Three distinct defects in one crash:

1. **QVAC model load broken** — `AssetCopierPackage` not registered in `MainApplication.kt` after Expo prebuild
2. **WDK bitcoin/TON addresses broken** — `ADDON_NOT_FOUND` for `libbare-tcp.2.0.9.so` / `libbare-os.3.6.2.so` (versions pinned in the worklet bundle don't exist in the APK's native libs)
3. **WDK EVM addresses broken** — `TypeError: Class extends value undefined is not a constructor or null` for ethereum/polygon/arbitrum (likely same root cause cascading)

The uncaught promise rejection in the Bare worker thread (`mqt_v_js`, tid 8042) triggers SIGABRT via `libbare-kit.so`'s `js_callback_s::on_call`. That's just the abort mechanism — not the root cause.

## Evidence (from logcat)

```
02:34:59.513  [keychain-patch] Patched keychain to use SECURITY_LEVEL.ANY
02:34:59.579  [wdk] WDK.initialize() start
02:35:00.110  [wdk] WDK.initialize() ok                       ← OK so far
02:35:01.961  [qvac] Extracting bundled model from APK assets...
02:35:01.965 E [qvac] loadModel failed: AssetCopier native module not found. ← DEFECT #1
02:35:02.126  [wdk] getUniqueId() ok (len=16)
02:35:02.228  [wdk] importSeedPhrase() ok
02:35:02.329  [wdk] WDKService.createWallet() ok
02:35:02.345  [wdk] addr[bitcoin]  FAIL ADDON_NOT_FOUND libbare-tcp.2.0.9.so   ← DEFECT #2
02:35:02.724  [wdk] addr[ethereum] FAIL Class extends undefined              ← DEFECT #3
02:35:02.724  [wdk] addr[polygon]  FAIL Class extends undefined
02:35:02.724  [wdk] addr[arbitrum] FAIL Class extends undefined
02:35:02.724  [wdk] addr[ton]      FAIL ADDON_NOT_FOUND libbare-os.3.6.2.so
02:35:02.724  [wdk] addr[ethereum] FAIL Class extends undefined (EVM 4337?)
02:35:02.785  [wdk] getWalletAddresses() ok ← Promise.allSettled resolves
02:35:03.xxx  bare: Uncaught (in promise) AddonError                          ← CRASH
02:35:03.838  F DEBUG : SIGABRT in libbare-kit.so js_callback_s::on_call
```

The JS side handles the per-chain failures via `Promise.allSettled` — but a *separate* uncaught rejection (probably a continuation inside the worker) aborts the process. Chain of events: 6 chain calls dispatched in parallel → 4 fail sync-ish → 2 EVM chains eventually throw inside the Bare worker VM → uncaught → SIGABRT.

## Native crash signature

```
Process: com.transsion.transcend
signal 6 (SIGABRT), code -1 (SI_QUEUE)
pid: 7957, tid: 8042, name: mqt_v_js
backtrace:
  #00  libc.so (abort+164)
  #01  libbare-kit.so (offset 0x2bd8000)
  #02  libbare-kit.so (js_callback_s::on_call+52)
  #03  libbare-kit.so
```

## What "v13 the good one" probably means

v13 is cleaner than the current WIP (which broke more things experimentally). But it was never fully working end-to-end on a fresh Test Lab device. It likely got further on Tony's physical Transsion device because (a) addon version pinning can accidentally match a device's existing Bare kit cache, or (b) testing was happening under Metro dev-client where bundles are different.

## Next debug directions (not started, awaiting Tony)

- **Defect #1 (AssetCopierPackage):** Either Expo config plugin needs to register it, or we patch `android/app/src/main/java/.../MainApplication.kt` post-prebuild. Look for existing plugin config in `plugins/` folder or `app.json`.
- **Defect #2 (ADDON_NOT_FOUND):** The WDK worklet bundle (`node_modules/@tetherto/pear-wrk-wdk/.../*.worklet.bundle.mjs`) references specific `.so` versions. Either:
  - Regenerate the bundle against the currently-shipping `libbare-tcp.*.so` / `libbare-os.*.so` in `node_modules/react-native-bare-kit/android/src/main/addons/arm64-v8a/`
  - Or ship the pinned versions as APK assets
- **Defect #3 (Class extends undefined):** May be a consequence of #2 — if bare-tcp fails to load, EVM providers that depend on it fail their class-hierarchy setup.

## Artifacts

- APK: `/tmp/apk-serve/transcend-v13-20260419-0937.apk` (1.4 GB) also at `gs://zero-apk-delivery/test-results/app-release-20260419-092432/app-release.apk`
- Logcat: `/tmp/v13-results/logcat`
- Native crash: `/tmp/v13-results/data_app_native_crash_0_com_transsion_transcend.txt`
- System tombstone: `/tmp/v13-results/SYSTEM_TOMBSTONE_0_com_transsion_transcend.txt`
- Screenshots: `/tmp/v13-results/{0,1,2,3}.png`
- Console: https://console.firebase.google.com/project/zero-485510/testlab/histories/bh.b288875af3f53483/matrices/7718252674246688241
