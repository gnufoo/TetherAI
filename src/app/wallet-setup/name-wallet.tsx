import { useDebouncedNavigation } from '@/hooks/use-debounced-navigation';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';

const TETHER_GREEN = '#50AF95';

/**
 * Auto-skip: creates a default wallet and goes straight to secure-wallet.
 * No name prompt, no avatar selection.
 */
export default function NameWalletScreen() {
  const router = useDebouncedNavigation();

  useEffect(() => {
    // Small delay so the user sees the creation animation
    const t = setTimeout(() => {
      router.replace({
        pathname: './secure-wallet',
        params: { walletName: 'My Wallet', avatar: '💎' },
      });
    }, 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={s.container}>
      <ActivityIndicator size="large" color={TETHER_GREEN} />
      <Text style={s.text}>Creating your wallet…</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  text: { color: colors.textSecondary, fontSize: 14, marginTop: 16 },
});
