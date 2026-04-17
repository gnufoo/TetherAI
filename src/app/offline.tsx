import { colors } from '@/constants/colors';
import { useRouter } from 'expo-router';
import {
  Bluetooth,
  ChevronLeft,
  Plane,
  Radio,
  WifiOff,
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

const features = [
  {
    Icon: Radio,
    title: 'Device-to-device via Bluetooth',
    body: 'Pair two phones locally. A signed, pre-funded USD₮ transfer moves between devices with no internet or cell signal.',
  },
  {
    Icon: Plane,
    title: 'Airport-mode settlement',
    body: 'Payments settle on-chain the moment either party reconnects. Perfect for travelers, rural areas, and brownouts.',
  },
  {
    Icon: WifiOff,
    title: 'Built for emerging markets',
    body: 'Designed for Transsion users across Africa and SEA where connectivity is intermittent but stablecoin demand is high.',
  },
];

export default function Offline() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offline USD₮ Transfer</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.iconRing}>
            <Bluetooth size={44} color="#7B61FF" />
          </View>
          <Text style={styles.heroTitle}>Send value without a signal</Text>
          <Text style={styles.heroBody}>
            The only mobile USD₮ wallet that works when the network doesn't.
            Designed for the billion people who live with intermittent
            connectivity.
          </Text>
        </View>

        <View style={styles.features}>
          {features.map((feat) => (
            <View key={feat.title} style={styles.feature}>
              <View style={styles.featIcon}>
                <feat.Icon size={20} color="#7B61FF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featTitle}>{feat.title}</Text>
                <Text style={styles.featBody}>{feat.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.howItWorks}>
          <Text style={styles.howLabel}>HOW IT WORKS</Text>
          <View style={styles.step}>
            <Text style={styles.stepNum}>1</Text>
            <Text style={styles.stepText}>
              Sender authorises a transfer offline. Signed on-device.
            </Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNum}>2</Text>
            <Text style={styles.stepText}>
              Devices exchange the signed blob over Bluetooth LE.
            </Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNum}>3</Text>
            <Text style={styles.stepText}>
              Either device broadcasts when back online. Transfer settles.
            </Text>
          </View>
        </View>

        <View style={styles.status}>
          <Text style={styles.statusLabel}>STATUS</Text>
          <Text style={styles.statusText}>
            BLE pairing and signed-transfer handoff are in development.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  content: { padding: 20, paddingTop: 8 },
  hero: { alignItems: 'center', marginBottom: 36, marginTop: 16 },
  iconRing: {
    width: 92,
    height: 92,
    borderRadius: 24,
    backgroundColor: '#7B61FF22',
    borderWidth: 1,
    borderColor: '#7B61FF44',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroBody: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  features: { gap: 14, marginBottom: 28 },
  feature: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
  },
  featIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#7B61FF22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  featBody: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  howItWorks: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    gap: 10,
  },
  howLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNum: {
    color: '#7B61FF',
    fontSize: 18,
    fontWeight: '700',
    width: 20,
  },
  stepText: { color: colors.text, fontSize: 13, lineHeight: 19, flex: 1 },
  status: {
    backgroundColor: colors.warningBackground,
    borderColor: colors.warningBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  statusLabel: {
    color: colors.warning,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statusText: { color: colors.text, fontSize: 13, lineHeight: 18 },
});
