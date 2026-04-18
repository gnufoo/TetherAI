import type { Wallet } from './mock-types';

export const mockWallet: Wallet = {
  created: '2026-04-17',
  mnemonic: '•••• •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• ••••',
  addresses: [
    {
      chain: 'btc',
      address: 'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3',
      derivationPath: "m/84'/0'/0'/0/0",
    },
    {
      chain: 'ton',
      address: 'UQDrjaLahLkMB-hMCmkzOyBuHJ139ZUYmPHu6RRBKnbdLIYI',
      derivationPath: "m/44'/607'/0'",
    },
    {
      chain: 'polygon',
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0BeB0',
      derivationPath: "m/44'/60'/0'/0/0",
    },
    {
      chain: 'ethereum',
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0BeB0',
      derivationPath: "m/44'/60'/0'/0/0",
    },
    {
      chain: 'tron',
      address: 'TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax',
      derivationPath: "m/44'/195'/0'/0/0",
    },
  ],
  balances: [
    {
      chain: 'polygon',
      native: { symbol: 'MATIC', amount: '12.4', usd: 8.9 },
      tokens: [
        { symbol: 'USDT', amount: '428.50', usd: 428.5, contract: '0xc2132D...' },
      ],
    },
    {
      chain: 'ethereum',
      native: { symbol: 'ETH', amount: '0.082', usd: 268.3 },
      tokens: [
        { symbol: 'USDT', amount: '150.00', usd: 150.0, contract: '0xdAC17...' },
      ],
    },
    {
      chain: 'tron',
      native: { symbol: 'TRX', amount: '210', usd: 24.6 },
      tokens: [
        { symbol: 'USDT', amount: '62.30', usd: 62.3, contract: 'TR7NHq...' },
      ],
    },
    {
      chain: 'btc',
      native: { symbol: 'BTC', amount: '0.00481', usd: 312.0 },
      tokens: [],
    },
    {
      chain: 'ton',
      native: { symbol: 'TON', amount: '8.2', usd: 48.4 },
      tokens: [],
    },
  ],
};

export function totalUsd(w = mockWallet): number {
  return w.balances.reduce(
    (acc, b) => acc + b.native.usd + b.tokens.reduce((a, t) => a + t.usd, 0),
    0,
  );
}

export function primaryUsdt() {
  return {
    chain: 'polygon' as const,
    amount: '428.50',
    usd: 428.5,
  };
}
