/**
 * WalletProvider — React context wrapping the Wallet interface.
 * Screens consume `useWallet()` to access wallet state + actions.
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { getWallet } from './index';
import type { Wallet, WalletAddress, TokenBalance } from './types';

interface WalletContextValue {
  wallet: Wallet;
  isInitialized: boolean;
  address: WalletAddress | null;
  usdtBalance: TokenBalance | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const wallet = getWallet();
  const [isInitialized, setIsInitialized] = useState(false);
  const [address, setAddress] = useState<WalletAddress | null>(null);
  const [usdtBalance, setUsdtBalance] = useState<TokenBalance | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const initialized = await wallet.isInitialized();
      setIsInitialized(initialized);

      if (initialized) {
        const addr = await wallet.getAddress('tron', 0);
        setAddress(addr);
        const bal = await wallet.getBalance('tron', 'USDT');
        setUsdtBalance(bal);
      } else {
        setAddress(null);
        // Still populate a zero-balance so UI can render skeleton.
        const bal = await wallet.getBalance('tron', 'USDT');
        setUsdtBalance(bal);
      }
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    refresh().catch(console.error);
  }, [refresh]);

  return (
    <WalletContext.Provider
      value={{ wallet, isInitialized, address, usdtBalance, loading, refresh }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useWallet must be used inside <WalletProvider>');
  }
  return ctx;
}
