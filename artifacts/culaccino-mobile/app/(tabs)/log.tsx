import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { Transaction, TransactionType, useInventory } from '@/contexts/InventoryContext';
import { Feather } from '@expo/vector-icons';

// ── Helpers ───────────────────────────────────────────────────────────────
function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function dayKey(ts: string) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ── Filter config ─────────────────────────────────────────────────────────
type FilterKey = 'all' | 'withdrawal' | 'restock' | 'other';
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'withdrawal', label: 'Withdrawals' },
  { key: 'restock', label: 'Restocks' },
  { key: 'other', label: 'Other' },
];
const OTHER_TYPES: TransactionType[] = ['addition', 'adjustment', 'deletion'];

function matchesFilter(tx: Transaction, f: FilterKey) {
  if (f === 'all') return true;
  if (f === 'other') return OTHER_TYPES.includes(tx.type);
  return tx.type === f;
}

// ── Type meta ─────────────────────────────────────────────────────────────
const TYPE_LABEL: Record<string, string> = {
  withdrawal: 'Withdrawn',
  restock: 'Restocked',
  addition: 'Added',
  deletion: 'Deleted',
  adjustment: 'Adjusted',
};
const TYPE_ICON: Record<string, string> = {
  withdrawal: 'minus-circle',
  restock: 'plus-circle',
  addition: 'plus-square',
  deletion: 'trash-2',
  adjustment: 'edit-2',
};

// ── Grouped list item types ───────────────────────────────────────────────
type ListItem =
  | { kind: 'header'; label: string; key: string }
  | { kind: 'row'; tx: Transaction };

// ── Component ─────────────────────────────────────────────────────────────
export default function LogScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { transactions, items, refresh } = useInventory();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [refreshing, setRefreshing] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  // Build color map from current theme (must be in component body)
  const typeColor: Record<string, string> = {
    withdrawal: colors.destructive,
    restock: colors.success,
    addition: colors.success,
    deletion: colors.destructive,
    adjustment: colors.mutedForeground,
  };

  // Filter and group by day
  const listData = useMemo<ListItem[]>(() => {
    const filtered = transactions.filter(tx => matchesFilter(tx, filter));
    const grouped: ListItem[] = [];
    let lastDay = '';
    for (const tx of filtered) {
      const day = dayKey(tx.timestamp);
      if (day !== lastDay) {
        grouped.push({ kind: 'header', label: day, key: `header-${day}-${tx.id}` });
        lastDay = day;
      }
      grouped.push({ kind: 'row', tx });
    }
    return grouped;
  }, [transactions, filter]);

  async function handleRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  function handleRowPress(tx: Transaction) {
    // Only navigate if item still exists (may have been deleted)
    const exists = items.some(i => i.id === tx.itemId);
    if (exists) router.push(`/item/${tx.itemId}`);
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: 10,
      backgroundColor: colors.background,
    },
    heading: {
      fontSize: 28,
      fontWeight: '700' as const,
      color: colors.foreground,
      fontFamily: 'Inter_700Bold',
      marginBottom: 2,
    },
    sub: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      marginBottom: 12,
    },
    // Filter chips
    filterScroll: { paddingLeft: 20, paddingRight: 8, paddingBottom: 10 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.background,
      marginRight: 8,
    },
    chipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '15',
    },
    chipText: {
      fontSize: 13,
      fontFamily: 'Inter_500Medium',
      fontWeight: '500' as const,
      color: colors.mutedForeground,
    },
    chipTextActive: {
      color: colors.primary,
      fontWeight: '600' as const,
      fontFamily: 'Inter_600SemiBold',
    },
    // Day header
    dayHeader: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      paddingTop: 16,
    },
    dayLabel: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: colors.mutedForeground,
      fontFamily: 'Inter_600SemiBold',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    // Row
    rowWrap: {
      marginHorizontal: 16,
      marginBottom: 2,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 12,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowCenter: { flex: 1, gap: 2 },
    itemName: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
    },
    rowMeta: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
    },
    rowRight: { alignItems: 'flex-end', gap: 2 },
    delta: {
      fontSize: 15,
      fontWeight: '700' as const,
      fontFamily: 'Inter_700Bold',
    },
    rowTime: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
    },
    navigable: {
      opacity: 1,
    },
    // Empty state
    empty: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 80,
      gap: 10,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
    },
    emptyText: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
    },
    listContent: { paddingBottom: bottomPad + 100, paddingTop: 4 },
  });

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.kind === 'header') {
      return (
        <View style={s.dayHeader}>
          <Text style={s.dayLabel}>{item.label}</Text>
        </View>
      );
    }

    const { tx } = item;
    const color = typeColor[tx.type] ?? colors.mutedForeground;
    const icon = TYPE_ICON[tx.type] ?? 'activity';
    const sign = tx.delta > 0 ? '+' : '';
    const itemExists = items.some(i => i.id === tx.itemId);

    return (
      <View style={s.rowWrap}>
        <Pressable
          style={({ pressed }) => [s.row, { opacity: pressed && itemExists ? 0.75 : 1 }]}
          onPress={() => handleRowPress(tx)}
        >
          <View style={[s.iconWrap, { backgroundColor: color + '18' }]}>
            <Feather name={icon as any} size={18} color={color} />
          </View>

          <View style={s.rowCenter}>
            <Text style={s.itemName} numberOfLines={1}>{tx.itemName}</Text>
            <Text style={s.rowMeta} numberOfLines={1}>
              {TYPE_LABEL[tx.type] ?? tx.type} · {tx.performedBy}
            </Text>
          </View>

          <View style={s.rowRight}>
            <Text style={[s.delta, { color }]}>
              {sign}{tx.delta}
            </Text>
            <Text style={s.rowTime}>{formatTime(tx.timestamp)}</Text>
          </View>

          {itemExists && (
            <Feather name="chevron-right" size={16} color={colors.border} />
          )}
        </Pressable>
      </View>
    );
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.heading}>Activity Log</Text>
        <Text style={s.sub}>{transactions.length} transactions recorded</Text>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterScroll}
      >
        {FILTERS.map(f => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              style={({ pressed }) => [s.chip, active && s.chipActive, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[s.chipText, active && s.chipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* List */}
      <FlatList
        data={listData}
        keyExtractor={item => item.kind === 'header' ? item.key : item.tx.id}
        renderItem={renderItem}
        contentContainerStyle={listData.length === 0 ? { flex: 1 } : s.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Feather name="clock" size={44} color={colors.border} />
            <Text style={s.emptyTitle}>No transactions yet</Text>
            <Text style={s.emptyText}>Activity will appear here as stock moves.</Text>
          </View>
        }
      />
    </View>
  );
}
