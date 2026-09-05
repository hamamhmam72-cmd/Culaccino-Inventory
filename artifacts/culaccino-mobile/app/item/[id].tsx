import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { ActionModal } from '@/components/ActionModal';
import { ItemFormModal } from '@/components/ItemFormModal';
import { NewItemData, useInventory } from '@/contexts/InventoryContext';
import { useRole } from '@/contexts/RoleContext';
import { Feather } from '@expo/vector-icons';

function formatDate(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { items, transactions, withdrawItem, restockItem, updateItem, deleteItem } = useInventory();
  const { isManager } = useRole();

  const item = useMemo(() => items.find(i => i.id === id), [items, id]);
  const itemTxs = useMemo(
    () => transactions.filter(t => t.itemId === id).slice(0, 10),
    [transactions, id],
  );

  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [restockVisible, setRestockVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      navigation.setOptions({ title: item.name });
    }
  }, [item, navigation]);

  if (!item) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const isLow = item.quantity <= item.minStock;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  async function handleWithdraw(qty: number, by: string, note: string) {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await withdrawItem(item!.id, qty, by, note);
    setLoading(false);
  }

  async function handleRestock(qty: number, by: string, note: string) {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await restockItem(item!.id, qty, by || 'Manager', note);
    setLoading(false);
  }

  async function handleEdit(data: NewItemData) {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateItem(item!.id, data, 'Manager');
    setLoading(false);
  }

  function confirmDelete() {
    Alert.alert(
      'Delete item',
      `Remove "${item!.name}" from inventory? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deleteItem(item!.id, 'Manager');
            router.back();
          },
        },
      ],
    );
  }

  const txTypeLabel: Record<string, string> = {
    withdrawal: 'Withdrawn',
    restock: 'Restocked',
    addition: 'Added',
    deletion: 'Deleted',
    adjustment: 'Adjusted',
  };
  const txTypeIcon: Record<string, string> = {
    withdrawal: 'minus-circle',
    restock: 'plus-circle',
    addition: 'plus-square',
    deletion: 'trash-2',
    adjustment: 'edit-2',
  };
  const txTypeColor: Record<string, string> = {
    withdrawal: colors.destructive,
    restock: colors.success,
    addition: colors.success,
    deletion: colors.destructive,
    adjustment: colors.mutedForeground,
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingBottom: bottomPad + 16 },

    // Hero card
    hero: {
      margin: 16,
      padding: 20,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isLow ? colors.lowStock + '55' : colors.border,
    },
    heroCat: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: colors.primary,
      fontFamily: 'Inter_600SemiBold',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    heroQtyRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
      marginBottom: 4,
    },
    heroQty: {
      fontSize: 56,
      fontWeight: '700' as const,
      color: isLow ? colors.lowStock : colors.foreground,
      fontFamily: 'Inter_700Bold',
      lineHeight: 60,
    },
    heroUnit: {
      fontSize: 18,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      paddingBottom: 6,
    },
    lowWarn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.lowStockSurface,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      marginTop: 10,
      alignSelf: 'flex-start',
    },
    lowWarnText: {
      fontSize: 13,
      color: colors.lowStock,
      fontFamily: 'Inter_500Medium',
      fontWeight: '500' as const,
    },

    // Stats row
    statsRow: {
      flexDirection: 'row',
      marginHorizontal: 16,
      gap: 10,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      gap: 4,
    },
    statLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    statValue: {
      fontSize: 17,
      fontWeight: '600' as const,
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
    },

    // Action buttons
    actions: {
      paddingHorizontal: 16,
      gap: 8,
      marginBottom: 8,
      flexDirection: 'row' as const,
    },
    managerActions: {
      paddingHorizontal: 16,
      gap: 8,
      marginBottom: 20,
      flexDirection: 'row' as const,
    },
    btnPrimary: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 11,
      alignItems: 'center' as const,
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      gap: 6,
    },
    btnPrimaryText: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.primaryForeground,
      fontFamily: 'Inter_600SemiBold',
    },
    btnOutline: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingVertical: 11,
      alignItems: 'center' as const,
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      gap: 6,
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    btnOutlineText: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.primary,
      fontFamily: 'Inter_600SemiBold',
    },
    btnDanger: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingVertical: 11,
      alignItems: 'center' as const,
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      gap: 6,
      borderWidth: 1.5,
      borderColor: colors.destructive,
    },
    btnDangerText: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.destructive,
      fontFamily: 'Inter_600SemiBold',
    },

    // History
    section: {
      marginHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: colors.mutedForeground,
      fontFamily: 'Inter_600SemiBold',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    txCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    txRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 12,
    },
    txRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
    txIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    txInfo: { flex: 1 },
    txType: {
      fontSize: 13,
      fontWeight: '600' as const,
      fontFamily: 'Inter_600SemiBold',
    },
    txMeta: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
    },
    txDelta: {
      fontSize: 15,
      fontWeight: '700' as const,
      fontFamily: 'Inter_700Bold',
    },
    emptyTx: {
      paddingVertical: 24,
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyTxText: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      marginTop: 8,
    },
  });

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroCat}>{item.category}</Text>
          <View style={s.heroQtyRow}>
            <Text style={s.heroQty}>{item.quantity}</Text>
            <Text style={s.heroUnit}>{item.unit}</Text>
          </View>
          {isLow && (
            <View style={s.lowWarn}>
              <Feather name="alert-triangle" size={14} color={colors.lowStock} />
              <Text style={s.lowWarnText}>Below minimum ({item.minStock} {item.unit})</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statLabel}>Min stock</Text>
            <Text style={s.statValue}>{item.minStock} {item.unit}</Text>
          </View>
          {item.cost !== undefined && (
            <View style={s.statCard}>
              <Text style={s.statLabel}>Unit cost</Text>
              <Text style={s.statValue}>${item.cost.toFixed(2)}</Text>
            </View>
          )}
          <View style={s.statCard}>
            <Text style={s.statLabel}>Added by</Text>
            <Text style={s.statValue} numberOfLines={1}>{item.addedBy}</Text>
          </View>
        </View>

        {/* Primary actions: Withdraw + Restock */}
        <View style={s.actions}>
          <Pressable
            style={({ pressed }) => [s.btnPrimary, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => setWithdrawVisible(true)}
            testID="withdraw-btn"
          >
            <Feather name="minus" size={16} color={colors.primaryForeground} />
            <Text style={s.btnPrimaryText}>Withdraw</Text>
          </Pressable>

          {isManager && (
            <Pressable
              style={({ pressed }) => [s.btnOutline, { opacity: pressed ? 0.8 : 1 }]}
              onPress={() => setRestockVisible(true)}
              testID="restock-btn"
            >
              <Feather name="plus" size={16} color={colors.primary} />
              <Text style={s.btnOutlineText}>Restock</Text>
            </Pressable>
          )}
        </View>

        {/* Manager-only: Edit + Delete */}
        {isManager && (
          <View style={s.managerActions}>
            <Pressable
              style={({ pressed }) => [s.btnOutline, { opacity: pressed ? 0.8 : 1 }]}
              onPress={() => setEditVisible(true)}
              testID="edit-btn"
            >
              <Feather name="edit-2" size={16} color={colors.primary} />
              <Text style={s.btnOutlineText}>Edit</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [s.btnDanger, { opacity: pressed ? 0.8 : 1 }]}
              onPress={confirmDelete}
              testID="delete-btn"
            >
              <Feather name="trash-2" size={16} color={colors.destructive} />
              <Text style={s.btnDangerText}>Delete</Text>
            </Pressable>
          </View>
        )}

        {/* Transaction history */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Recent activity</Text>
          {itemTxs.length === 0 ? (
            <View style={s.emptyTx}>
              <Feather name="clock" size={28} color={colors.border} />
              <Text style={s.emptyTxText}>No transactions yet</Text>
            </View>
          ) : (
            <View style={s.txCard}>
              {itemTxs.map((tx, idx) => {
                const color = txTypeColor[tx.type] ?? colors.mutedForeground;
                const icon = txTypeIcon[tx.type] ?? 'activity';
                const sign = tx.delta > 0 ? '+' : '';
                return (
                  <View key={tx.id} style={[s.txRow, idx > 0 && s.txRowBorder]}>
                    <View style={[s.txIconWrap, { backgroundColor: color + '18' }]}>
                      <Feather name={icon as any} size={16} color={color} />
                    </View>
                    <View style={s.txInfo}>
                      <Text style={[s.txType, { color }]}>{txTypeLabel[tx.type] ?? tx.type}</Text>
                      <Text style={s.txMeta}>
                        {tx.performedBy} · {formatDate(tx.timestamp)} {formatTime(tx.timestamp)}
                      </Text>
                    </View>
                    <Text style={[s.txDelta, { color }]}>
                      {sign}{tx.delta} {item.unit}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Withdraw modal */}
      <ActionModal
        visible={withdrawVisible}
        onClose={() => setWithdrawVisible(false)}
        onConfirm={handleWithdraw}
        title="Withdraw stock"
        subtitle={`Current: ${item.quantity} ${item.unit}`}
        confirmLabel="Withdraw"
        confirmVariant="primary"
        requireName
        maxQuantity={item.quantity}
      />

      {/* Restock modal */}
      <ActionModal
        visible={restockVisible}
        onClose={() => setRestockVisible(false)}
        onConfirm={handleRestock}
        title="Restock item"
        subtitle={`Current: ${item.quantity} ${item.unit}`}
        confirmLabel="Restock"
        confirmVariant="primary"
      />

      {/* Edit modal — manager only */}
      <ItemFormModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        onConfirm={handleEdit}
        mode="edit"
        initialValues={{
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          minStock: item.minStock,
          cost: item.cost,
        }}
      />
    </View>
  );
}
