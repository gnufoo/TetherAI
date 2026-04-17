import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function AIScreen() {
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
            On-device AI
          </Text>
          <View className="w-10" />
        </View>

        <View className="mt-8">
          <Text className="text-transsion-orange font-mono text-xs tracking-[3px]">
            QVAC · BITNET B1.58
          </Text>
          <Text className="text-text mt-3 text-3xl font-bold leading-tight">
            A billion parameters.{'\n'}In your pocket.{'\n'}Offline.
          </Text>
          <Text className="text-text-muted mt-4 text-sm leading-relaxed">
            When this screen is live, your phone will run a full language model
            with zero internet — fine-tuned for Swahili, Hausa, agricultural
            advice, and financial literacy. 77% less VRAM than Gemma. Faster
            than DeepSeek R1 on the same hardware.
          </Text>
        </View>

        <View className="mt-8 rounded-3xl border border-transsion-orange/30 bg-transsion-orange/5 p-5">
          <Text className="text-transsion-orange text-sm font-semibold">
            Coming in v0.3
          </Text>
          <Text className="text-text-muted mt-2 text-sm leading-relaxed">
            Real QVAC SDK integration. BitNet 1B (~800MB) will be bundled with
            the APK. First inference: ~3 sec cold start, ~5–10 tokens/sec on
            Mali-G57.
          </Text>
        </View>

        <View className="mt-8">
          <Text className="text-text-muted font-mono text-xs tracking-widest">
            PROMPT PREVIEW
          </Text>
          <View className="bg-bg-elevated mt-3 rounded-2xl border border-text-faint/20 p-4">
            <Text className="text-text text-sm">
              "Sibley habari asubuhi?"
            </Text>
            <View className="mt-3 h-px bg-text-faint/20" />
            <Text className="text-text-muted mt-3 text-sm italic">
              (awaiting QVAC integration…)
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
