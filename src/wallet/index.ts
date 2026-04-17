/**
 * Wallet entry point.
 *
 * Phase 2a: This file returns a stub wallet that throws on every method.
 * That's deliberate — it forces us to plug the real implementation in via
 * the WalletProvider context and lets the UI render "not initialized" correctly.
 *
 * Phase 2b: Replace stub with real WDK-backed wallet via the bridge in
 * src/wallet/wdk-native.ts
 */

import { createStubWallet } from './stub';
import type { Wallet } from './types';

export type { Wallet, Chain, TokenSymbol, WalletAddress, TokenBalance, SendParams, TxResult } from './types';

let singleton: Wallet | null = null;

export function getWallet(): Wallet {
  if (!singleton) {
    singleton = createStubWallet();
  }
  return singleton;
}
