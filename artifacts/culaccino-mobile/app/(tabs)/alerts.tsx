import React from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { ItemCard } from '@/components/ItemCard';
import { useInventory } from '@/contexts/InventoryContext';
import { Feather } from '@expo/vector-icons';

export default function AlertsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, loading } = useInventory();

  const lowStock = items
    .filter(i => i.quantity <= i.minStock)
    .sort((a, b) => (a.quantity / a.minStock) - (b.quantity / b.minStock)); // most critical first

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: colors.background,
    },
    heading: {
      fontSize: 28,
      fontWeight: '700' as const,
      color: colors.foreground,
      fontFamily: 'Inter_700Bold',
      marginBottom: 4,
    },
    sub: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
    },
    bannerOk: {
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.successSurface,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    bannerOkText: {
      fontSize: 14,
      color: colors.success,
      fontFamily: 'Inter_500Medium',
      flex: 1,
    },
    bannerWarn: {
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.lowStockSurface,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    bannerWarnText: {
      fontSize: 14,
      color: colors.lowStock,
      fontFamily: 'Inter_500Medium',
      flex: 1,
    },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingTop: 40,
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '600' as const,
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
    },
    emptyText: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      textAlign: 'center',
    },
    listContent: { paddingBottom: Platform.OS === 'web' ? 34 : 100 },
  });

  if (loading) return <View style={s.container} />;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.heading}>Alerts</Text>
        <Text style={s.sub}>
          {lowStock.length === 0
            ? 'All items are stocked'
            : `${lowStock.length} item${lowStock.length > 1 ? 's' : ''} need attention`}
        </Text>
      </View>

      {lowStock.length === 0 ? (
        <>
          <View style={s.bannerOk}>
            <Feather name="check-circle" size={20} color={colors.success} />
            <Text style={s.bannerOkText}>All stock levels are healthy.</Text>
          </View>
          <View style={s.empty}>
            <Feather name="check-circle" size={52} color={colors.border} />
            <Text style={s.emptyTitle}>All good!</Text>
            <Text style={s.emptyText}>No items are below their minimum stock level right now.</Text>
          </View>
        </>
      ) : (
        <>
          <View style={s.bannerWarn}>
            <Feather name="alert-triangle" size={20} color={colors.lowStock} />
            <Text style={s.bannerWarnText}>
              {lowStock.length} item{lowStock.length > 1 ? 's are' : ' is'} at or below minimum stock. Tap to restock.
            </Text>
          </View>
          <FlatList
            data={lowStock}
            keyExtractor={i => i.id}
            renderItem={({ item }) => (
              <ItemCard item={item} onPress={() => router.push(`/item/${item.id}`)} />
            )}
            contentContainerStyle={s.listContent}
            scrollEnabled={!!lowStock.length}
          />
        </>
      )}
    </View>
  );
}
