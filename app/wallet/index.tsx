import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useWallet } from '@/wallet/WalletProvider';

export default function WalletScreen() {
  const { isInitialized, address, usdtBalance, loading } = useWallet();

  const shortAddr = address
    ? `${address.address.slice(0, 6)}…${address.address.slice(-4)}`
    : '—';

  const formatted = usdtBalance?.formatted ?? '0.00';

  return (
    <View className="bg-bg flex-1">
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <View className="flex-row items-center px-6 pt-4">
            <Pressable
              onPress={() => router.back()}
              className="rounded-full p-2 active:opacity-60"
            >
              <Ionicons name="chevron-back" size={24} color="#F5F5F5" />
            </Pressable>
            <Text className="text-text flex-1 text-center text-base font-semibold">
              Wallet
            </Text>
            <View className="w-10" />
          </View>

          {/* Balance card */}
          <View className="mx-6 mt-4 rounded-3xl border border-accent/30 bg-accent/5 p-6">
            <Text className="text-text-muted font-mono text-xs tracking-widest">
              USDT BALANCE · TRON
            </Text>
            <View className="mt-2 flex-row items-baseline">
              <Text className="text-text text-5xl font-bold">{formatted}</Text>
              <Text className="text-accent ml-3 text-xl font-semibold">USDT</Text>
            </View>
            <Text className="text-text-muted mt-1 text-sm">
              {loading ? 'Loading…' : `≈ NGN ${(Number(formatted) * 1580).toFixed(0)}`}
            </Text>

            <View className="mt-5 flex-row gap-2">
              <ActionPill icon="arrow-up" label="Send" disabled={!isInitialized} />
              <ActionPill
                icon="arrow-down"
                label="Receive"
                disabled={!isInitialized}
              />
              <ActionPill icon="qr-code" label="Scan" disabled={!isInitialized} />
              <ActionPill
                icon="trending-up"
                label="Yield"
                disabled={!isInitialized}
              />
            </View>
          </View>

          {/* Init status */}
          {!isInitialized && (
            <View className="mx-6 mt-4 rounded-2xl border border-transsion-gold/30 bg-transsion-gold/5 p-4">
              <View className="flex-row items-center">
                <Ionicons name="warning-outline" size={20} color="#F5C542" />
                <Text className="text-transsion-gold ml-2 text-sm font-semibold">
                  Wallet not initialized
                </Text>
              </View>
              <Text className="text-text-muted mt-2 text-sm leading-relaxed">
                Real WDK integration is coming in Phase 2b. This screen
                demonstrates the final UI shape the app will ship with.
              </Text>
              <Pressable
                disabled
                className="mt-3 rounded-xl border border-accent/40 bg-accent/10 p-3 opacity-50"
              >
                <Text className="text-accent text-center text-sm font-semibold">
                  Generate new seed (pending WDK)
                </Text>
              </Pressable>
            </View>
          )}

          {/* Recent activity */}
          <View className="mx-6 mt-6">
            <Text className="text-text-muted font-mono text-xs tracking-widest">
              RECENT ACTIVITY
            </Text>
            <View className="bg-bg-elevated border-text-faint/20 mt-3 rounded-2xl border p-8">
              <Text className="text-text-muted text-center text-sm">
                No transactions yet
              </Text>
            </View>
          </View>

          {/* Debug footer */}
          <View className="mx-6 mt-10">
            <Text className="text-text-faint text-xs">
              Network: Tron · Address: {shortAddr}
            </Text>
            <Text className="text-text-faint text-xs">
              Backend: stub (awaiting WDK bare-kit bridge)
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ActionPill({
  icon,
  label,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      className={`bg-bg-elevated border-text-faint/20 flex-1 items-center gap-1 rounded-2xl border py-3 ${
        disabled ? 'opacity-40' : 'active:opacity-60'
      }`}
    >
      <Ionicons name={icon} size={18} color="#26A17B" />
      <Text className="text-text text-xs">{label}</Text>
    </Pressable>
  );
}
