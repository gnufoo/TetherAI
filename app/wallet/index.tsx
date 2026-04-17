import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function WalletScreen() {
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
              <Text className="text-text text-5xl font-bold">0.00</Text>
              <Text className="text-accent ml-3 text-xl font-semibold">USDT</Text>
            </View>
            <Text className="text-text-muted mt-1 text-sm">≈ NGN 0 · KES 0</Text>

            <View className="mt-5 flex-row gap-2">
              <ActionPill icon="arrow-up" label="Send" />
              <ActionPill icon="arrow-down" label="Receive" />
              <ActionPill icon="qr-code" label="Scan" />
              <ActionPill icon="trending-up" label="Yield" />
            </View>
          </View>

          {/* Seed phrase status */}
          <View className="mx-6 mt-4 rounded-2xl border border-transsion-gold/30 bg-transsion-gold/5 p-4">
            <View className="flex-row items-center">
              <Ionicons name="warning-outline" size={20} color="#F5C542" />
              <Text className="text-transsion-gold ml-2 text-sm font-semibold">
                Wallet not initialized
              </Text>
            </View>
            <Text className="text-text-muted mt-2 text-sm leading-relaxed">
              No seed phrase has been generated yet. WDK integration is coming in
              v0.2 — this screen currently shows the target UI.
            </Text>
          </View>

          {/* Recent activity */}
          <View className="mx-6 mt-6">
            <Text className="text-text-muted font-mono text-xs tracking-widest">
              RECENT ACTIVITY
            </Text>
            <View className="mt-3 rounded-2xl border border-text-faint/20 bg-bg-elevated p-8">
              <Text className="text-text-muted text-center text-sm">
                No transactions yet
              </Text>
            </View>
          </View>

          {/* Debug footer */}
          <View className="mx-6 mt-10">
            <Text className="text-text-faint text-xs">
              Network: (no WDK yet) · Address: (no WDK yet)
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
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <Pressable className="bg-bg-elevated flex-1 items-center gap-1 rounded-2xl border border-text-faint/20 py-3 active:opacity-60">
      <Ionicons name={icon} size={18} color="#26A17B" />
      <Text className="text-text text-xs">{label}</Text>
    </Pressable>
  );
}
