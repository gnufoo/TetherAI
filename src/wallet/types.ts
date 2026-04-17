/**
 * Shared wallet types.
 * Designed to mirror WDK's public interface shape so we can swap implementations
 * (JS-bridge, Bare runtime, native) without changing UI code.
 */

export type Chain = 'ethereum' | 'tron' | 'polygon' | 'base' | 'arbitrum';

export type TokenSymbol = 'USDT' | 'USDC' | 'ETH' | 'TRX' | 'NATIVE';

export interface WalletAddress {
  chain: Chain;
  address: string;
  derivationIndex: number;
}

export interface TokenBalance {
  chain: Chain;
  symbol: TokenSymbol;
  address: string;
  balance: bigint;
  decimals: number;
  /** Human-readable string: formatted with decimals, e.g. "12.45". */
  formatted: string;
}

export interface SendParams {
  chain: Chain;
  to: string;
  amount: bigint;
  token: TokenSymbol;
}

export interface TxResult {
  hash: string;
  chain: Chain;
  explorerUrl?: string;
}

export interface Wallet {
  /** Whether a seed has been generated / imported. */
  isInitialized(): Promise<boolean>;

  /** Generate a new BIP39 seed and persist it securely. */
  createNew(): Promise<{ mnemonic: string }>;

  /** Import an existing BIP39 mnemonic. */
  importMnemonic(mnemonic: string): Promise<void>;

  /** Export mnemonic (requires authentication — used on settings → reveal). */
  exportMnemonic(): Promise<string>;

  /** Get address for a given chain + index (default 0). */
  getAddress(chain: Chain, index?: number): Promise<WalletAddress>;

  /** Query balance for a token. */
  getBalance(chain: Chain, token: TokenSymbol): Promise<TokenBalance>;

  /** Build, sign, and broadcast a transaction. */
  send(params: SendParams): Promise<TxResult>;

  /** Forget seed + wipe secure storage. */
  wipe(): Promise<void>;
}
