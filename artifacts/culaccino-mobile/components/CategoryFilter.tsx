import React from 'react';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { ItemCategory, CATEGORIES } from '@/contexts/InventoryContext';

interface CategoryFilterProps {
  selected: ItemCategory | null;
  onSelect: (cat: ItemCategory | null) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const colors = useColors();

  const allItems = [null, ...CATEGORIES] as (ItemCategory | null)[];

  const styles = StyleSheet.create({
    list: {
      paddingHorizontal: 12,
      paddingBottom: 4,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      marginHorizontal: 4,
      borderWidth: 1,
    },
    chipText: {
      fontSize: 13,
      fontFamily: 'Inter_500Medium',
    },
  });

  return (
    <FlatList
      horizontal
      data={allItems}
      keyExtractor={item => item ?? 'all'}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const active = selected === item;
        return (
          <Pressable
            style={[
              styles.chip,
              {
                backgroundColor: active ? colors.primary : colors.card,
                borderColor: active ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onSelect(item)}
          >
            <Text
              style={[
                styles.chipText,
                { color: active ? colors.primaryForeground : colors.foreground },
              ]}
            >
              {item ?? 'All'}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}
