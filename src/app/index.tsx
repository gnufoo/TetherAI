import { useWallet } from '@tetherto/wdk-react-native-provider';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pricingService } from '../services/pricing-service';
import { colors } from '@/constants/colors';

const ONBOARDED_KEY = 'transcend_onboarded';

export default function Index() {
  const { wallet, isInitialized, isUnlocked } = useWallet();
  const [isPricingReady, setIsPricingReady] = useState(false);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await pricingService.initialize();
      } catch (e) {
        console.error('Pricing init failed:', e);
      }
      setIsPricingReady(true);

      const val = await AsyncStorage.getItem(ONBOARDED_KEY);
      setOnboarded(val === 'true');
    })();
  }, []);

  if (!isInitialized || !isPricingReady || onboarded === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If not onboarded, show onboarding
  if (!onboarded && !wallet) {
    return <Redirect href="/onboarding" />;
  }

  // If wallet exists and locked, authorize
  if (wallet && !isUnlocked) {
    return <Redirect href="/authorize" />;
  }

  // Otherwise go to tab navigator (works with or without real wallet — mock data fills in)
  return <Redirect href="/(tabs)/wallet" />;
}
