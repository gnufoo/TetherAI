import { DarkTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { WalletProvider, WDKService } from '@tetherto/wdk-react-native-provider';
import { ThemeProvider } from '@tetherto/wdk-uikit-react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import getChainsConfig from '@/config/get-chains-config';
import { Toaster } from 'sonner-native';
import { colors } from '@/constants/colors';
import DebugLogProvider, { debugLog } from '@/providers/DebugLogProvider';
import QVACProvider from '@/providers/QVACProvider';
import { patchKeychainSecurity } from '@/services/keychain-patch';

// Patch keychain BEFORE any provider initializes
patchKeychainSecurity();

SplashScreen.preventAutoHideAsync();

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.background,
  },
};

// ── ErrorBoundary ──

type ErrorBoundaryState = { error: Error | null };

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    debugLog(
      `Render error: ${error.message}`,
      'error',
      'error',
      { stack: error.stack, componentStack: info.componentStack },
    );
  }

  handleCopy = async () => {
    const { error } = this.state;
    if (error) {
      await Clipboard.setStringAsync(`${error.message}\n\n${error.stack ?? ''}`);
    }
  };

  handleRestart = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <View style={ebStyles.container}>
          <Text style={ebStyles.title}>Something went wrong</Text>
          <Text style={ebStyles.message}>{this.state.error.message}</Text>
          <View style={ebStyles.actions}>
            <TouchableOpacity style={ebStyles.btn} onPress={this.handleCopy}>
              <Text style={ebStyles.btnText}>Copy Error</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[ebStyles.btn, ebStyles.btnPrimary]}
              onPress={this.handleRestart}
            >
              <Text style={[ebStyles.btnText, ebStyles.btnTextPrimary]}>Restart</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}

const ebStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 12 },
  message: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  actions: { flexDirection: 'row', gap: 12 },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  btnPrimary: { backgroundColor: colors.tetherGreen, borderColor: colors.tetherGreen },
  btnText: { fontSize: 14, fontWeight: '600', color: colors.text },
  btnTextPrimary: { color: colors.black },
});

// ── Root Layout ──

export default function RootLayout() {
  useEffect(() => {
    const initApp = async () => {
      try {
        await WDKService.initialize();
      } catch (error) {
        console.error('Failed to initialize services in app layout:', error);
      } finally {
        SplashScreen.hideAsync();
      }
    };

    initApp();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DebugLogProvider>
        <ErrorBoundary>
          <ThemeProvider
            defaultMode="dark"
            brandConfig={{
              primaryColor: colors.primary,
            }}
          >
            <WalletProvider
              config={{
                indexer: {
                  apiKey: process.env.EXPO_PUBLIC_WDK_INDEXER_API_KEY!,
                  url: process.env.EXPO_PUBLIC_WDK_INDEXER_BASE_URL!,
                },
                chains: getChainsConfig(),
                enableCaching: true,
              }}
            >
              <QVACProvider>
                <NavigationThemeProvider value={CustomDarkTheme}>
                  <View style={{ flex: 1, backgroundColor: colors.background }}>
                    <Stack
                      screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: colors.background },
                      }}
                    />
                    <StatusBar style="light" />
                  </View>
                </NavigationThemeProvider>
              </QVACProvider>
            </WalletProvider>
            <Toaster
              offset={90}
              toastOptions={{
                style: {
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
                titleStyle: { color: colors.text },
                descriptionStyle: { color: colors.text },
              }}
            />
          </ThemeProvider>
        </ErrorBoundary>
      </DebugLogProvider>
    </GestureHandlerRootView>
  );
}
