import { CommonActions, useNavigation } from '@react-navigation/native';
import { useWallet } from '@tetherto/wdk-react-native-provider';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';

type LogEntry = { t: number; kind: 'info' | 'ok' | 'err'; msg: string };

export default function CompleteScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ walletName: string; mnemonic: string }>();
  const { createWallet, isLoading } = useWallet();
  const [walletCreated, setWalletCreated] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const startRef = useRef<number>(Date.now());

  const log = (msg: string, kind: LogEntry['kind'] = 'info') => {
    const t = Date.now() - startRef.current;
    // eslint-disable-next-line no-console
    console.log(`[wallet-setup +${t}ms] ${msg}`);
    setLogs((prev) => [...prev, { t, kind, msg }]);
  };

  useEffect(() => {
    // Register a global log hook that the patched WDK provider calls into
    (globalThis as any).__wdkLog = (msg: string, kind?: LogEntry['kind']) => {
      log(msg, kind || 'info');
    };
    // Auto-create wallet when screen loads
    createWalletWithWDK();
    return () => {
      try { delete (globalThis as any).__wdkLog; } catch (_) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createWalletWithWDK = async () => {
    if (walletCreated) return;
    startRef.current = Date.now();
    setLogs([]);

    try {
      const walletName = params.walletName || 'My Wallet';
      const rawMnemonic = params.mnemonic ?? '';
      const mnemonic = rawMnemonic.split(',').join(' ');
      const wordCount = mnemonic.trim().split(/\s+/).filter(Boolean).length;
      log(`name="${walletName}" mnemonic_words=${wordCount}`);
      log(`indexer=${process.env.EXPO_PUBLIC_WDK_INDEXER_BASE_URL || '(undefined)'}`);
      log('calling createWallet(...)');

      // Watchdog — if no completion in 15s, mark as likely stuck
      const watchdog = setTimeout(() => {
        log('15s elapsed, still waiting on createWallet', 'err');
      }, 15000);
      const watchdog2 = setTimeout(() => {
        log('30s elapsed — likely stuck. Check network to indexer', 'err');
      }, 30000);

      // Auto-retry on IllegalBlockSizeException (Keystore wakes up on second try)
      let lastErr: any = null;
      let success = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          log(`createWallet attempt ${attempt}/3`);
          await createWallet({ name: walletName, mnemonic });
          success = true;
          break;
        } catch (err: any) {
          lastErr = err;
          const msg = err?.message || String(err);
          log(`attempt ${attempt} failed: ${msg.slice(0, 80)}`, 'err');
          if (/IllegalBlockSize|E_CRYPTO/.test(msg) && attempt < 3) {
            log(`retrying after keystore warm-up...`);
            await new Promise((r) => setTimeout(r, 500));
            continue;
          }
          break;
        }
      }
      clearTimeout(watchdog);
      clearTimeout(watchdog2);

      if (!success) throw lastErr;
      log('createWallet returned, wallet ready', 'ok');
      setWalletCreated(true);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      log(`FAILED: ${msg}`, 'err');
      // Also dump stack if available
      if (error instanceof Error && error.stack) {
        log(error.stack.split('\n').slice(0, 3).join(' | '), 'err');
      }
      console.error('Failed to create wallet:', error);
      Alert.alert(
        'Wallet Creation Failed',
        msg,
        [{ text: 'Retry', onPress: () => createWalletWithWDK() }]
      );
    }
  };

  const handleGoToWallet = () => {
    if (!walletCreated) {
      Alert.alert('Please Wait', 'Wallet is still being created...');
      return;
    }
    // Reset navigation stack and go to tabs (not standalone wallet route)
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: '(tabs)', params: { screen: 'wallet' } }],
      })
    );
  };

  const generalLoadingStatus = !walletCreated || isLoading;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {generalLoadingStatus ? 'Creating Your Wallet...' : "You're All Set!"}
        </Text>
        <Text style={styles.subtitle}>
          {generalLoadingStatus
            ? 'Setting up your secure multi-chain wallet. This will only take a moment...'
            : 'Your wallet is ready to use. Start exploring and managing your crypto securely.'}
        </Text>
        {generalLoadingStatus && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Initializing wallet...</Text>
          </View>
        )}

        {/* Debug log panel — shows real-time steps so we know where it hangs */}
        <View style={styles.logPanel}>
          <Text style={styles.logTitle}>Debug log</Text>
          <ScrollView style={styles.logScroll} nestedScrollEnabled>
            {logs.length === 0 ? (
              <Text style={styles.logEmpty}>(waiting for first step…)</Text>
            ) : (
              logs.map((l, i) => (
                <Text
                  key={i}
                  style={[
                    styles.logLine,
                    l.kind === 'err' && styles.logErr,
                    l.kind === 'ok' && styles.logOk,
                  ]}
                >
                  [{(l.t / 1000).toFixed(1)}s] {l.msg}
                </Text>
              ))
            )}
          </ScrollView>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[styles.button, generalLoadingStatus && styles.buttonDisabled]}
          onPress={handleGoToWallet}
          disabled={generalLoadingStatus}
        >
          <Text style={[styles.buttonText, generalLoadingStatus && styles.buttonTextDisabled]}>
            {generalLoadingStatus ? 'Creating Wallet...' : 'Go To Wallet'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  button: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
  },
  buttonDisabled: {
    backgroundColor: colors.card,
  },
  buttonTextDisabled: {
    color: colors.textTertiary,
  },
  loadingContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  logPanel: {
    marginTop: 24,
    alignSelf: 'stretch',
    backgroundColor: '#0a0a0a',
    borderColor: '#222',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    maxHeight: 280,
  },
  logTitle: {
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  logScroll: {
    flexGrow: 0,
  },
  logEmpty: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  logLine: {
    color: '#cfcfcf',
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  logErr: {
    color: '#ff6b6b',
  },
  logOk: {
    color: '#66d17a',
  },
});
