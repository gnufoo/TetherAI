import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/constants/colors';

const ONBOARDED_KEY = 'transcend_onboarded';

import { WDKService } from '@tetherto/wdk-react-native-provider';
import { useWallet } from '@tetherto/wdk-react-native-provider';
import { getUniqueId } from 'react-native-device-info';
import * as Keychain from 'react-native-keychain';
import { useQVAC } from '@/providers/QVACProvider';
import { debugLog } from '@/providers/DebugLogProvider';

type Step = 'welcome' | 'creating' | 'done';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('welcome');
  const [walletDone, setWalletDone] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const { agentState, loadModel } = useQVAC();
  const { createWallet } = useWallet();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const begin = async () => {
    setStep('creating');

    // Start model loading in parallel
    loadModel();

    // 90-second total timeout
    const deadline = setTimeout(() => {
      debugLog('Onboarding 90s timeout — proceeding anyway', 'app', 'warn');
      finishOnboarding();
    }, 90_000);

    // Step 1: Create wallet
    try {
      // Clear corrupted Android Keystore crypto keys first
      // The IllegalBlockSizeException comes from orphaned Keystore aliases after reinstall
      try {
        const { AssetCopier } = require('react-native').NativeModules;
        if (AssetCopier?.clearAndroidKeyStore) {
          const cleared = await AssetCopier.clearAndroidKeyStore();
          debugLog(`Cleared ${cleared} Android Keystore aliases`, 'wdk', 'info');
        }
      } catch (ksErr: any) {
        debugLog(`Keystore clear failed (non-fatal): ${ksErr?.message}`, 'wdk', 'warn');
      }

      // Reset ALL keychain entries to prevent IllegalBlockSizeException
      // The exception comes from corrupted Android Keystore keys after reinstall
      try {
        // Find every service that has stored credentials
        const allServices = await Keychain.getAllGenericPasswordServices();
        debugLog(`Found ${allServices.length} keychain services: ${allServices.join(', ')}`, 'wdk', 'debug');
        for (const svc of allServices) {
          try {
            await Keychain.resetGenericPassword({ service: svc });
            debugLog(`Reset keychain service: ${svc}`, 'wdk', 'debug');
          } catch (e: any) {
            debugLog(`Failed to reset service ${svc}: ${e?.message}`, 'wdk', 'warn');
          }
        }
        // Also reset default (no service name)
        await Keychain.resetGenericPassword();
        debugLog(`Keychain fully reset (${allServices.length} services + default)`, 'wdk', 'info');
      } catch (kcErr: any) {
        debugLog(`Keychain enumeration failed: ${kcErr?.message}`, 'wdk', 'warn');
        // Fallback: try resetting known WDK services
        for (const svc of ['wdk.secretManager', 'wdk.secretManager.seed', 'wdk.secretManager.mnemonic', 'wdk.secretManager.wallet']) {
          try { await Keychain.resetGenericPassword({ service: svc }); } catch (_) {}
        }
        try { await Keychain.resetGenericPassword(); } catch (_) {}
      }

      debugLog('Onboarding: creating wallet seed', 'wdk', 'info');
      const prf = await getUniqueId();
      const mnemonic = await WDKService.createSeed({ prf });

      if (!mnemonic) throw new Error('Empty mnemonic');
      const words = mnemonic.split(' ');
      if (words.length !== 12) throw new Error(`Bad mnemonic: ${words.length} words`);

      // Auto-retry on IllegalBlockSizeException (Keystore needs warm-up on first use)
      let lastErr: any = null;
      let success = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          debugLog(`Onboarding: createWallet attempt ${attempt}/3`, 'wdk', 'info');
          await createWallet({ name: 'My Wallet', mnemonic });
          success = true;
          break;
        } catch (err: any) {
          lastErr = err;
          const msg = err?.message || String(err);
          debugLog(`attempt ${attempt} failed: ${msg.slice(0, 80)}`, 'wdk', 'warn');
          if (/IllegalBlockSize|E_CRYPTO/.test(msg) && attempt < 3) {
            debugLog(`retrying after keystore warm-up...`, 'wdk', 'info');
            await new Promise((r) => setTimeout(r, 500));
            continue;
          }
          break;
        }
      }
      if (!success) throw lastErr;
      debugLog('Onboarding: wallet created', 'wdk', 'info');
      setWalletDone(true);
    } catch (e: any) {
      debugLog(`Onboarding wallet error: ${e?.message ?? e}`, 'wdk', 'error');
      setWalletError(e?.message ?? 'Wallet creation failed');
    }

    clearTimeout(deadline);
    finishOnboarding();
  };

  const finishOnboarding = async () => {
    setStep('done');
    await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
    setTimeout(() => router.replace('/(tabs)/wallet'), 800);
  };

  if (step === 'welcome') {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.center}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>T</Text>
          </View>
          <Text style={styles.appName}>Transcend</Text>
          <Text style={styles.tagline}>
            A self-custodial wallet with an on-device AI assistant.{'\n'}No cloud. No middlemen.
            Your keys, your intelligence.
          </Text>

          <View style={styles.features}>
            <Feature icon="🔐" title="Self-custodial" body="Your keys never leave this phone." />
            <Feature
              icon="🧠"
              title="On-device AI"
              body="Talk to your wallet — all inference runs locally."
            />
            <Feature
              icon="⚡"
              title="USDT, everywhere"
              body="Send on Polygon or instantly via Lightning."
            />
          </View>
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={begin} activeOpacity={0.8}>
          <Text style={styles.ctaText}>Create my wallet</Text>
        </TouchableOpacity>
        <PoweredBy />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.center}>
        <Spinner />
        <Text style={styles.buildTitle}>
          {step === 'creating' && 'Setting up your wallet...'}
          {step === 'done' && "You're all set"}
        </Text>
        <Text style={styles.buildBody}>
          {step === 'creating' &&
            'Generating seed, deriving addresses, and loading the AI model in parallel.'}
          {step === 'done' && 'Ready when you are.'}
        </Text>

        <View style={styles.steps}>
          <StepLine label="WDK · wallet created" done={walletDone} error={walletError} />
          <StepLine
            label="QVAC · model loaded"
            done={agentState.loaded}
            progress={agentState.loading ? agentState.loadProgress : undefined}
          />
        </View>
      </View>
      <PoweredBy />
    </View>
  );
}

function Feature({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <View style={styles.feature}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureBody}>{body}</Text>
      </View>
    </View>
  );
}

function Spinner() {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.spinnerWrap}>
      <View style={styles.spinnerTrack} />
      <Animated.View style={[styles.spinnerArc, { transform: [{ rotate: spin }] }]} />
    </View>
  );
}

function StepLine({
  label,
  done,
  progress,
  error,
}: {
  label: string;
  done: boolean;
  progress?: number;
  error?: string | null;
}) {
  return (
    <View style={styles.stepLine}>
      <View
        style={[
          styles.stepDot,
          done
            ? styles.stepDotDone
            : error
              ? styles.stepDotError
              : progress !== undefined
                ? styles.stepDotProgress
                : styles.stepDotPending,
        ]}
      >
        <Text
          style={[
            styles.stepDotChar,
            done
              ? styles.stepDotCharDone
              : error
                ? styles.stepDotCharError
                : progress !== undefined
                  ? styles.stepDotCharProgress
                  : styles.stepDotCharPending,
          ]}
        >
          {done ? '✓' : error ? '✗' : progress !== undefined ? '...' : '·'}
        </Text>
      </View>
      <Text style={[styles.stepLabel, done ? styles.stepLabelDone : styles.stepLabelPending]}>
        {error ? `${label} (failed)` : label}
      </Text>
      {progress !== undefined && !done && (
        <Text style={styles.stepPercent}>{Math.round(progress * 100)}%</Text>
      )}
    </View>
  );
}

function PoweredBy() {
  return (
    <View style={styles.powered}>
      <Text style={styles.poweredLabel}>POWERED BY</Text>
      <View style={styles.poweredRow}>
        <Text style={styles.poweredBrand}>QVAC</Text>
        <Text style={styles.poweredDot}>·</Text>
        <Text style={styles.poweredBrand}>WDK</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.tetherGreenFaded,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoLetter: { fontSize: 36, fontWeight: '700', color: colors.tetherGreen },
  appName: { fontSize: 30, fontWeight: '700', color: colors.text, marginBottom: 8 },
  tagline: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },

  features: { marginTop: 40, width: '100%', maxWidth: 300, gap: 12 },
  feature: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  featureIcon: { fontSize: 20, width: 32 },
  featureTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  featureBody: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  ctaButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.tetherGreen,
    alignItems: 'center',
  },
  ctaText: { fontSize: 16, fontWeight: '700', color: colors.black },

  buildTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 32,
    textAlign: 'center',
  },
  buildBody: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 18,
  },

  steps: { marginTop: 32, width: '100%', maxWidth: 300, gap: 12 },
  stepLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotDone: { backgroundColor: colors.tetherGreen },
  stepDotProgress: { backgroundColor: colors.tetherGreenFaded },
  stepDotPending: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  stepDotError: { backgroundColor: colors.dangerBackground, borderWidth: 1, borderColor: colors.danger },
  stepDotChar: { fontSize: 10, fontWeight: '700' },
  stepDotCharDone: { color: colors.black },
  stepDotCharProgress: { color: colors.tetherGreen },
  stepDotCharPending: { color: colors.textSecondary },
  stepDotCharError: { color: colors.danger },
  stepLabel: { fontSize: 12, flex: 1 },
  stepLabelDone: { color: colors.text },
  stepLabelPending: { color: colors.textSecondary },
  stepPercent: { fontSize: 12, color: colors.tetherGreen },

  spinnerWrap: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
  spinnerTrack: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.border,
  },
  spinnerArc: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: colors.tetherGreen,
  },

  powered: { alignItems: 'center', marginTop: 24, gap: 4 },
  poweredLabel: { fontSize: 10, color: colors.textSecondary, letterSpacing: 2 },
  poweredRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  poweredBrand: { fontSize: 11, fontWeight: '600', color: colors.tetherGreen },
  poweredDot: { fontSize: 11, color: colors.textSecondary },
});
