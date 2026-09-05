import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ItemCard } from '@/components/ItemCard';
import { ItemFormModal } from '@/components/ItemFormModal';
import { ItemCategory, NewItemData, useInventory } from '@/contexts/InventoryContext';
import { useRole } from '@/contexts/RoleContext';
import { Feather } from '@expo/vector-icons';

export default function InventoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, loading, refresh, addItem } = useInventory();
  const { isManager } = useRole();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ItemCategory | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [addVisible, setAddVisible] = useState(false);

  const filtered = useMemo(() => {
    let list = items;
    if (category) list = list.filter(i => i.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(q));
    }
    // Low-stock items first
    return [...list].sort((a, b) => {
      const aLow = a.quantity <= a.minStock ? 0 : 1;
      const bLow = b.quantity <= b.minStock ? 0 : 1;
      return aLow - bLow;
    });
  }, [items, query, category]);

  async function handleRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  async function handleAddItem(data: NewItemData) {
    await addItem(data, 'Manager');
  }

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: 12,
      backgroundColor: colors.background,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    heading: {
      flex: 1,
      fontSize: 28,
      fontWeight: '700' as const,
      color: colors.foreground,
      fontFamily: 'Inter_700Bold',
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      marginTop: 4,
    },
    addBtnText: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.primaryForeground,
      fontFamily: 'Inter_600SemiBold',
    },
    sub: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      marginBottom: 14,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 11,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
    },
    filterBar: { paddingVertical: 10 },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingTop: 60,
    },
    emptyText: {
      fontSize: 15,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
    },
    listContent: { paddingTop: 4, paddingBottom: bottomPad + 100 },
  });

  if (loading) {
    return (
      <View style={[s.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.titleRow}>
          <Text style={s.heading}>Inventory</Text>
          {isManager && (
            <Pressable
              style={({ pressed }) => [s.addBtn, { opacity: pressed ? 0.8 : 1 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAddVisible(true);
              }}
            >
              <Feather name="plus" size={14} color={colors.primaryForeground} />
              <Text style={s.addBtnText}>Add item</Text>
            </Pressable>
          )}
        </View>
        <Text style={s.sub}>{items.length} items · {items.filter(i => i.quantity <= i.minStock).length} low stock</Text>
        <View style={s.searchRow}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={s.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search items…"
            placeholderTextColor={colors.mutedForeground}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      <View style={s.filterBar}>
        <CategoryFilter selected={category} onSelect={setCategory} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ItemCard item={item} onPress={() => router.push(`/item/${item.id}`)} />
        )}
        contentContainerStyle={s.listContent}
        scrollEnabled={filtered.length > 0}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Feather name="inbox" size={40} color={colors.border} />
            <Text style={s.emptyText}>No items found</Text>
          </View>
        }
      />

      {/* Add item modal — manager only */}
      <ItemFormModal
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        onConfirm={handleAddItem}
        mode="add"
      />
    </View>
  );
}
