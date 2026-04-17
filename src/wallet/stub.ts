/**
 * Stub wallet — used until real WDK integration lands.
 * Every method throws or returns "not initialized" state.
 * Lets the UI render correctly + makes wiring points explicit.
 */

import type { Wallet, Chain, TokenSymbol, TokenBalance, WalletAddress, SendParams, TxResult } from './types';

const notReady = (what: string): never => {
  throw new Error(
    `[wallet/stub] ${what} not available — WDK integration pending (Phase 2b).`
  );
};

export function createStubWallet(): Wallet {
  return {
    async isInitialized() {
      return false;
    },
    async createNew() {
      return notReady('createNew');
    },
    async importMnemonic(_mnemonic: string) {
      return notReady('importMnemonic');
    },
    async exportMnemonic() {
      return notReady('exportMnemonic');
    },
    async getAddress(_chain: Chain, _index = 0): Promise<WalletAddress> {
      return notReady('getAddress');
    },
    async getBalance(chain: Chain, token: TokenSymbol): Promise<TokenBalance> {
      // Return a zero-balance rather than throwing, so the Wallet screen can render.
      return {
        chain,
        symbol: token,
        address: '',
        balance: 0n,
        decimals: 6,
        formatted: '0.00',
      };
    },
    async send(_params: SendParams): Promise<TxResult> {
      return notReady('send');
    },
    async wipe() {
      // No-op for stub.
    },
  };
}
