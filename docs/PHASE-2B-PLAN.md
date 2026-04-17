# Phase 2B — Real Wallet Integration Plan

## Core Discovery

WDK is a **Bare runtime** library. It imports `bare-node-runtime/global` and uses `bare-*` polyfills for everything (crypto, fs, net, etc.). This is Tether's "Node.js alternative designed for embedded" — NOT React Native JS.

**We CANNOT run WDK directly in Metro's JS bundle.**

The bundle already includes `@tetherto/wdk` in node_modules, but importing it from React code will fail at runtime: `bare-node-runtime` expects V8 + Bare's native bindings, not Hermes (RN's JS engine).

## Three Possible Architectures

### Option 1: Run WDK inside Bare Runtime on device (official Tether path)
- Use `bare-react-native` or similar bridge to host a Bare V8 worker alongside Hermes
- React Native UI ↔ bridge ↔ Bare worker ↔ WDK
- **Pros:** Uses WDK as designed. Full API. Tether's recommended.
- **Cons:** Much more complex. Requires adding `bare-kit` native modules to Android/iOS. Another round of custom-dev-client rebuild. Bridge serialization overhead. Docs are sparse (beta).

### Option 2: Swap WDK for equivalent RN-native crypto
- Use `ethers.js v6` + `bip39` + `@noble/curves` directly (all RN-compatible)
- Build the same feature surface (HD wallet, USDT transfer) but in plain JS
- **Pros:** Ships today. No bridge. All libs work in Hermes. Smaller bundle.
- **Cons:** We don't get to say "built on WDK". We'd be re-implementing what WDK wraps.

### Option 3: Hybrid — use Tether's Wallet JS SDK directly
- Tether ALSO publishes non-Bare variants of the same crypto code
- Look for `@tetherto/wdk-wallet-evm/src/*.js` — much of it is plain JS on top of `ethers`
- Import specific modules directly, bypassing the `bare-node-runtime/global` entry
- **Pros:** We're still using Tether's code. WDK story intact.
- **Cons:** Hacky. Unsupported import path. May break on WDK updates.

## Recommendation: **Option 2 now, Option 1 later**

For the Tether/Transsion pitch demo, what matters is:
1. **A working USDT wallet** that does real on-chain transactions
2. **Bare-kit integration** in the roadmap slide, not the demo

The demo app says "TetherAI" — we pitch the AGENT layer as the differentiator, not the wallet layer. The wallet just needs to work.

### Messaging to Tether:
> "We're using ethers.js today for speed of iteration. We'll migrate to full WDK once the Bare RN bridge is stable — you've got beta packages for this. We believe the agent layer (our differentiator) will consume WDK directly from the Bare runtime, keeping UI thin."

This is honest, shows we know the ecosystem, and lets us ship.

## Implementation Plan (Option 2 path)

### Step 1: Replace stub.ts with a real EVM wallet using ethers.js

```
src/wallet/
├── types.ts          (existing — keeps same interface)
├── index.ts          (existing — switches backend via env var)
├── stub.ts           (existing — used as fallback)
├── evm-wallet.ts     (NEW — real implementation using ethers)
├── storage.ts        (NEW — expo-secure-store wrapper for seed)
└── WalletProvider.tsx (existing — unchanged)
```

### Step 2: Dependencies to add
- `ethers@^6.14.4` (same version WDK uses)
- `@noble/hashes` (for BIP39 word list; already included via WDK)
- `react-native-get-random-values` (polyfill for ethers crypto)
- `@ethersproject/shims` (BigNumber, etc. for RN)

### Step 3: Chain config
Start with **Tron** (since our UI says "USDT · TRON") OR pivot UI to **Ethereum USDT**.

**Decision:** Start with **Ethereum Sepolia testnet** + USDC (free faucet tokens available). We update the UI to say "USDT · Ethereum" then migrate to mainnet USDT when ready. This gets us a real end-to-end loop without Tron-specific library (which WDK-wallet-tron would need, and we don't have).

### Step 4: The actual flow
1. **First launch:** generate random 12-word mnemonic via `bip39`
2. **Save:** encrypt mnemonic via expo-secure-store
3. **Derive:** use ethers `HDNodeWallet.fromPhrase(mnemonic).deriveChild(0)` → get address
4. **Balance:** connect to Sepolia RPC → query USDC balance (ERC-20 `balanceOf`)
5. **Refresh button** on wallet screen pulls fresh balance
6. **Send screen** (new): input address + amount → `sendTransaction` with gas estimate → show tx hash + etherscan link

### Step 5: Build on what exists
- `WalletProvider` already has `refresh()` — wire it to real RPC
- `wallet/index.tsx` already shows balance from `useWallet()` — will just show real numbers
- Add send flow as a new screen: `app/wallet/send.tsx`

## Risks

1. **RN crypto polyfill quirks** — `react-native-get-random-values` must be imported at the top of the entry file. Easy to miss.
2. **Sepolia RPC flakiness** — use multiple RPC providers with fallback (Infura, Alchemy, Ankr).
3. **Gas estimation on empty wallet** — needs some test ETH in the wallet first; we'll have a "fund me" QR code showing the address.

## Milestones

- [ ] 2B.1 — `ethers` + polyfills integrated, no crash
- [ ] 2B.2 — "Create Wallet" flow generates mnemonic, stores securely, derives address
- [ ] 2B.3 — Wallet screen shows real address (instead of "—")  
- [ ] 2B.4 — Balance query works on Sepolia (we fund it with test ETH + USDC)
- [ ] 2B.5 — Send screen: build + sign + broadcast a USDC transfer
- [ ] 2B.6 — Real tx lands on-chain, etherscan link works
- [ ] 2B.7 — Tony installs updated APK on phone, sends himself 1 USDC, it arrives

## What Ships

A demo where Tony (or a Tether exec) can:
1. Open the app
2. See their generated Ethereum address + QR code
3. Get test USDC from a faucet (or receive from another wallet)
4. Send USDC to another address
5. See the transaction on Etherscan

That's a real wallet. Tether gets it.
