import { colors } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { BrainCircuit, ChevronLeft, Cpu, Lock, Zap } from 'lucide-react-native';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const capabilities = [
  {
    Icon: Zap,
    title: 'Agentic wallet assistant',
    body: 'Ask in natural language. The agent reads your balance, explains gas, suggests the cheapest chain for a transfer, and can execute when you approve.',
  },
  {
    Icon: Lock,
    title: 'Runs fully on-device',
    body: 'Your keys and your conversations never leave the phone. No cloud inference, no training on your data.',
  },
  {
    Icon: Cpu,
    title: 'Quantised for Transsion hardware',
    body: 'Optimised to run under 2 GB RAM on Transsion devices. The experience that cloud-only wallets cannot match.',
  },
];

export default function EdgeAI() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tether Edge AI</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.iconRing}>
            <BrainCircuit size={44} color="#4CC9F0" />
          </View>
          <Text style={styles.heroTitle}>On-device intelligence</Text>
          <Text style={styles.heroBody}>
            Tether Edge AI turns your wallet into a conversational agent that
            understands your balance, your history, and your intent — without
            ever leaving your device.
          </Text>
        </View>

        <View style={styles.capabilities}>
          {capabilities.map((cap) => (
            <View key={cap.title} style={styles.capability}>
              <View style={styles.capIcon}>
                <cap.Icon size={20} color="#4CC9F0" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.capTitle}>{cap.title}</Text>
                <Text style={styles.capBody}>{cap.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.status}>
          <Text style={styles.statusLabel}>STATUS</Text>
          <Text style={styles.statusText}>
            Local LLM runtime in development. First conversation coming in the
            next build.
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
    backgroundColor: '#4CC9F022',
    borderWidth: 1,
    borderColor: '#4CC9F044',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  heroBody: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  capabilities: { gap: 14, marginBottom: 28 },
  capability: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
  },
  capIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#4CC9F022',
    justifyContent: 'center',
    alignItems: 'center',
  },
  capTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  capBody: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
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
