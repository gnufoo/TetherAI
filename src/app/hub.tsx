import { colors } from '@/constants/colors';
import { useRouter } from 'expo-router';
import {
  Bluetooth,
  BrainCircuit,
  Wallet as WalletIcon,
  Settings,
} from 'lucide-react-native';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Tile = {
  title: string;
  subtitle: string;
  route: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  accent: string;
  status?: 'ready' | 'preview';
};

const tiles: Tile[] = [
  {
    title: 'WDK Tether Wallet',
    subtitle: 'USD₮ across chains · built on Tether WDK',
    route: '/wallet',
    Icon: WalletIcon,
    accent: colors.primary,
    status: 'ready',
  },
  {
    title: 'Tether Edge AI',
    subtitle: 'On-device intelligence for your wallet',
    route: '/edge-ai',
    Icon: BrainCircuit,
    accent: '#4CC9F0',
    status: 'preview',
  },
  {
    title: 'Offline USD₮ Transfer',
    subtitle: 'Send value with no internet required',
    route: '/offline',
    Icon: Bluetooth,
    accent: '#7B61FF',
    status: 'preview',
  },
];

export default function Hub() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>TranscenD</Text>
            <Text style={styles.tagline}>The future of USD₮, on your phone.</Text>
          </View>
          <TouchableOpacity
            accessibilityLabel="Settings"
            onPress={() => router.push('/settings')}
            hitSlop={10}
          >
            <Settings size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Hero tiles */}
        <View style={styles.tiles}>
          {tiles.map((tile) => (
            <TouchableOpacity
              key={tile.title}
              style={styles.tile}
              onPress={() => router.push(tile.route as any)}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: `${tile.accent}22`, borderColor: `${tile.accent}44` },
                ]}
              >
                <tile.Icon size={28} color={tile.accent} />
              </View>
              <View style={styles.tileBody}>
                <View style={styles.tileTitleRow}>
                  <Text style={styles.tileTitle}>{tile.title}</Text>
                  {tile.status === 'preview' && (
                    <View style={styles.previewPill}>
                      <Text style={styles.previewPillText}>PREVIEW</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.tileSubtitle}>{tile.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer context */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Built on Tether WDK · Powered by Transsion
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 12,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    marginTop: 8,
  },
  brand: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  tiles: {
    gap: 14,
  },
  tile: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileBody: {
    flex: 1,
  },
  tileTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tileTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  previewPill: {
    backgroundColor: colors.cardDark,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  previewPillText: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tileSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 40,
    alignItems: 'center',
  },
  footerText: {
    color: colors.textTertiary,
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
