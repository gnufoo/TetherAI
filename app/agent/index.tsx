import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function AgentScreen() {
  return (
    <View className="bg-bg flex-1">
      <SafeAreaView className="flex-1 px-6">
        <View className="flex-row items-center pt-4">
          <Pressable
            onPress={() => router.back()}
            className="rounded-full p-2 active:opacity-60"
          >
            <Ionicons name="chevron-back" size={24} color="#F5F5F5" />
          </Pressable>
          <Text className="text-text flex-1 text-center text-base font-semibold">
            Agent
          </Text>
          <View className="w-10" />
        </View>

        <View className="mt-8">
          <Text className="text-transsion-gold font-mono text-xs tracking-[3px]">
            UNIFIED WALLET + AI
          </Text>
          <Text className="text-text mt-3 text-3xl font-bold leading-tight">
            Speak.{'\n'}
            <Text className="text-transsion-gold">It moves money.</Text>
          </Text>
          <Text className="text-text-muted mt-4 text-sm leading-relaxed">
            The magic trick: a local AI parses what you say, WDK executes the
            transaction, nothing touches a server outside this phone.
          </Text>
        </View>

        <View className="mt-8 rounded-3xl border border-transsion-gold/30 bg-transsion-gold/5 p-5">
          <Text className="text-transsion-gold text-sm font-semibold">
            Coming in v0.4
          </Text>
          <Text className="text-text-muted mt-2 text-sm leading-relaxed">
            Built on top of v0.2 (WDK) + v0.3 (QVAC). Example intents we will
            support:
          </Text>
          <View className="mt-4 gap-2">
            <ExampleIntent text='"Send my sister 20 USDT"' />
            <ExampleIntent text='"Lend my USDT at 4% yield"' />
            <ExampleIntent text='"Convert 50,000 NGN to USDT"' />
            <ExampleIntent text='"Schedule 10 USDT to mother every Friday"' />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function ExampleIntent({ text }: { text: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Ionicons name="chatbubble-outline" size={16} color="#F5C542" />
      <Text className="text-text text-sm italic">{text}</Text>
    </View>
  );
}
