import { colors } from '@/constants/colors';
import { Bluetooth } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OfflineScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.center}>
        <View style={styles.iconRing}>
          <Bluetooth size={56} color="#7B61FF" />
        </View>
        <Text style={styles.title}>Offline Transfer</Text>
        <Text style={styles.subtitle}>
          Send USD₮ via Bluetooth or NFC — no internet required
        </Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Coming in v2</Text>
        </View>
        <Text style={styles.body}>
          Transcend will enable peer-to-peer value transfer using local radios. Perfect for markets
          and regions with unreliable connectivity.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  iconRing: {
    width: 112,
    height: 112,
    borderRadius: 32,
    backgroundColor: '#7B61FF22',
    borderWidth: 1,
    borderColor: '#7B61FF44',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 8 },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.warningBackground,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    marginBottom: 24,
  },
  pillText: { fontSize: 12, fontWeight: '600', color: colors.warning },
  body: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
});
