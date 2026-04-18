import { Tabs } from 'expo-router';
import { BrainCircuit, Terminal, Wallet, WifiOff } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useQVAC } from '@/providers/QVACProvider';
import { useDebugLog } from '@/providers/DebugLogProvider';

export default function TabLayout() {
  const { agentState } = useQVAC();
  const { logs } = useDebugLog();

  const errorCount = logs.filter((l) => l.level === 'error').length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#50AF95',
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="edge-ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ color, size }) => <BrainCircuit size={size} color={color} />,
          tabBarBadge: agentState.loading ? '' : undefined,
          tabBarBadgeStyle: agentState.loading
            ? { backgroundColor: '#f59e0b', minWidth: 8, maxHeight: 8, borderRadius: 4, top: 2 }
            : undefined,
        }}
      />
      <Tabs.Screen
        name="offline"
        options={{
          title: 'Offline',
          tabBarIcon: ({ color, size }) => <WifiOff size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="debug"
        options={{
          title: 'Debug',
          tabBarIcon: ({ color, size }) => <Terminal size={size} color={color} />,
          tabBarBadge: errorCount > 0 ? errorCount : undefined,
          tabBarBadgeStyle: errorCount > 0
            ? { backgroundColor: colors.danger, fontSize: 10 }
            : undefined,
        }}
      />
    </Tabs>
  );
}
