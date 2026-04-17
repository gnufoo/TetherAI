import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

type TileProps = {
  href: string;
  title: string;
  subtitle: string;
  accent: 'tether' | 'transsion' | 'unified';
};

const ACCENT_STYLES: Record<TileProps['accent'], { bg: string; glow: string }> = {
  tether: { bg: 'bg-accent/10', glow: 'border-accent/40' },
  transsion: { bg: 'bg-transsion-orange/10', glow: 'border-transsion-orange/40' },
  unified: { bg: 'bg-transsion-gold/10', glow: 'border-transsion-gold/40' },
};

function Tile({ href, title, subtitle, accent }: TileProps) {
  const styles = ACCENT_STYLES[accent];
  return (
    <Link href={href} asChild>
      <Pressable
        onPressIn={() => Haptics.selectionAsync()}
        className={`rounded-3xl border ${styles.glow} ${styles.bg} p-5 active:opacity-70`}
      >
        <Text className="text-text text-xl font-semibold">{title}</Text>
        <Text className="text-text-muted mt-1 text-sm">{subtitle}</Text>
      </Pressable>
    </Link>
  );
}

export default function Home() {
  return (
    <View className="bg-bg flex-1">
      <LinearGradient
        colors={['#0a0a0a', '#0f1a15', '#0a0a0a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <SafeAreaView className="flex-1 px-6">
          <View className="mt-12">
            <Text className="text-accent font-mono text-xs tracking-[3px]">
              TETHER × TRANSSION
            </Text>
            <Text className="text-text mt-3 text-4xl font-bold leading-tight">
              Your money.{'\n'}Your intelligence.{'\n'}
              <Text className="text-accent">Your device.</Text>
            </Text>
            <Text className="text-text-muted mt-4 text-base leading-relaxed">
              A sovereign wallet and an on-device AI — pre-installed,
              no bank, no cloud.
            </Text>
          </View>

          <View className="mt-10 gap-4">
            <Tile
              href="/wallet"
              accent="tether"
              title="Wallet"
              subtitle="Self-custodial USDT · powered by Tether WDK"
            />
            <Tile
              href="/ai"
              accent="transsion"
              title="On-device AI"
              subtitle="Billion-param models, offline · powered by QVAC"
            />
            <Tile
              href="/agent"
              accent="unified"
              title="Agent"
              subtitle="Speak → it moves money"
            />
          </View>

          <View className="mt-auto mb-6">
            <Text className="text-text-faint text-xs">
              v0.1 · TetherAI scaffold · Target: Infinix Note 50 Pro
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
