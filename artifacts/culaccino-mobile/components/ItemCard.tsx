import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { InventoryItem } from '@/contexts/InventoryContext';
import { Feather } from '@expo/vector-icons';

interface ItemCardProps {
  item: InventoryItem;
  onPress: () => void;
}

export function ItemCard({ item, onPress }: ItemCardProps) {
  const colors = useColors();
  const isLow = item.quantity <= item.minStock;

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isLow ? colors.lowStock + '44' : colors.border,
      marginHorizontal: 16,
      marginBottom: 10,
      overflow: 'hidden',
    },
    inner: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isLow ? colors.lowStockSurface : colors.secondary,
    },
    info: {
      flex: 1,
      gap: 3,
    },
    name: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
    },
    category: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
    },
    right: {
      alignItems: 'flex-end',
      gap: 3,
    },
    qty: {
      fontSize: 22,
      fontWeight: '700' as const,
      color: isLow ? colors.lowStock : colors.foreground,
      fontFamily: 'Inter_700Bold',
    },
    unit: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
    },
    lowBadge: {
      backgroundColor: colors.lowStockSurface,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      alignSelf: 'flex-end',
    },
    lowBadgeText: {
      fontSize: 10,
      fontWeight: '600' as const,
      color: colors.lowStock,
      fontFamily: 'Inter_600SemiBold',
    },
  });

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.75 : 1 }]}
      onPress={onPress}
      testID={`item-card-${item.id}`}
    >
      <View style={styles.inner}>
        <View style={styles.iconWrap}>
          <Feather
            name="package"
            size={18}
            color={isLow ? colors.lowStock : colors.mutedForeground}
          />
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.category}>{item.category}</Text>
        </View>

        <View style={styles.right}>
          <Text style={styles.qty}>{item.quantity}</Text>
          <Text style={styles.unit}>{item.unit}</Text>
          {isLow && (
            <View style={styles.lowBadge}>
              <Text style={styles.lowBadgeText}>LOW</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
