import { WDKService } from '@tetherto/wdk-react-native-provider';
import { useLocalSearchParams } from 'expo-router';
import { useDebouncedNavigation } from '@/hooks/use-debounced-navigation';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { getUniqueId } from 'react-native-device-info';
import { colors } from '@/constants/colors';
import getErrorMessage from '@/utils/get-error-message';

const TETHER_GREEN = '#50AF95';

/**
 * Auto-generates mnemonic silently (no display, no confirm).
 * Stores private key via WDK, then skips straight to complete.
 */
export default function SecureWalletScreen() {
  const router = useDebouncedNavigation();
  const params = useLocalSearchParams<{ walletName?: string; avatar?: string }>();
  const [status, setStatus] = useState('Generating keys…');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setStatus('Generating seed phrase…');
        const prf = await getUniqueId();
        const mnemonicString = await WDKService.createSeed({ prf });

        if (!mnemonicString) throw new Error('Empty mnemonic');
        const words = mnemonicString.split(' ');
        if (words.length !== 12) throw new Error(`Bad mnemonic: ${words.length} words`);

        setStatus('Deriving addresses…');
        // Small delay for visual feedback
        await new Promise((r) => setTimeout(r, 500));

        // Skip confirm-phrase entirely, go to complete
        router.replace({
          pathname: './complete',
          params: {
            mnemonic: words.join(','),
            walletName: params.walletName ?? 'My Wallet',
            avatar: params.avatar ?? '💎',
          },
        });
      } catch (e) {
        console.error('Wallet creation failed:', e);
        setError(getErrorMessage(e, 'Failed to create wallet. Please restart the app.'));
      }
    })();
  }, []);

  return (
    <View style={s.container}>
      {error ? (
        <>
          <Text style={s.errorIcon}>⚠️</Text>
          <Text style={s.errorText}>{error}</Text>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color={TETHER_GREEN} />
          <Text style={s.status}>{status}</Text>
          <Text style={s.sub}>Your keys are stored locally and never leave this device.</Text>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  status: { color: colors.text, fontSize: 16, fontWeight: '600', marginTop: 20, textAlign: 'center' },
  sub: { color: colors.textSecondary, fontSize: 12, marginTop: 8, textAlign: 'center' },
  errorIcon: { fontSize: 40 },
  errorText: { color: colors.error, fontSize: 14, marginTop: 12, textAlign: 'center' },
});
