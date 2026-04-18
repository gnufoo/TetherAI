import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { useDebugLog, type LogEntry } from '@/providers/DebugLogProvider';

type Filter = 'all' | 'error' | 'wdk' | 'qvac' | 'network';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'error', label: 'Error' },
  { key: 'wdk', label: 'WDK' },
  { key: 'qvac', label: 'QVAC' },
  { key: 'network', label: 'Network' },
];

const LEVEL_COLORS: Record<string, string> = {
  info: colors.text,
  warn: '#f59e0b',
  error: '#ff6b6b',
  debug: '#888',
};

export default function DebugScreen() {
  const insets = useSafeAreaInsets();
  const { logs, clear, exportLogs } = useDebugLog();
  const [filter, setFilter] = useState<Filter>('all');
  const listRef = useRef<FlatList>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const filtered = filter === 'all'
    ? logs
    : filter === 'error'
      ? logs.filter((l) => l.level === 'error')
      : logs.filter((l) => l.category === filter);

  useEffect(() => {
    if (autoScroll && filtered.length > 0) {
      const t = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
      return () => clearTimeout(t);
    }
  }, [filtered.length, autoScroll]);

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(exportLogs());
  }, [exportLogs]);

  const renderItem = useCallback(({ item }: { item: LogEntry }) => {
    const time = `+${(item.timestamp / 1000).toFixed(1)}s`;
    const levelColor = LEVEL_COLORS[item.level] || colors.text;
    return (
      <Text style={[styles.logLine, { color: levelColor }]}>
        <Text style={styles.logTime}>[{time}]</Text>{' '}
        <Text style={styles.logCategory}>[{item.category}]</Text> {item.message}
      </Text>
    );
  }, []);

  const keyExtractor = useCallback((item: LogEntry) => item.id, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Debug Log</Text>
        <Text style={styles.entryCount}>{filtered.length} entries</Text>
      </View>

      {/* Filter pills */}
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterPill, filter === f.key && styles.filterPillActive]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Log list */}
      <FlatList
        ref={listRef}
        data={filtered}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        onScrollBeginDrag={() => setAutoScroll(false)}
        onEndReached={() => setAutoScroll(true)}
        onEndReachedThreshold={0.1}
      />

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.bottomBtn} onPress={handleCopy} activeOpacity={0.7}>
          <Text style={styles.bottomBtnText}>Copy All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBtn} onPress={clear} activeOpacity={0.7}>
          <Text style={styles.bottomBtnText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  entryCount: { fontSize: 12, color: colors.textSecondary },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  filterPillActive: {
    borderColor: colors.tetherGreenBorder,
    backgroundColor: colors.tetherGreenFaded,
  },
  filterText: { fontSize: 12, color: colors.textSecondary },
  filterTextActive: { color: colors.tetherGreen, fontWeight: '600' },
  list: { flex: 1 },
  listContent: { padding: 12, gap: 2 },
  logLine: { fontFamily: mono, fontSize: 11, lineHeight: 16 },
  logTime: { color: colors.textSecondary },
  logCategory: { color: colors.textTertiary },
  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  bottomBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  bottomBtnText: { fontSize: 14, fontWeight: '500', color: colors.text },
});
