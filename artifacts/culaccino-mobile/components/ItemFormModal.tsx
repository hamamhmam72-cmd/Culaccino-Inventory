/**
 * ItemFormModal — bottom-sheet form for adding or editing an inventory item.
 * Used by managers from the Inventory list (add) and Item Detail screen (edit).
 */
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { CATEGORIES, ItemCategory, NewItemData } from '@/contexts/InventoryContext';

interface ItemFormModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (data: NewItemData) => void;
  /** When provided, form is in "edit" mode pre-filled with these values */
  initialValues?: Partial<NewItemData>;
  mode?: 'add' | 'edit';
}

const UNIT_SUGGESTIONS = ['kg', 'g', 'L', 'ml', 'pcs', 'bottles', 'tubs', 'boxes', 'bags'];

export function ItemFormModal({
  visible,
  onClose,
  onConfirm,
  initialValues,
  mode = 'add',
}: ItemFormModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(600)).current;

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Coffee Beans');
  const [quantity, setQuantity] = useState('0');
  const [unit, setUnit] = useState('');
  const [minStock, setMinStock] = useState('0');
  const [cost, setCost] = useState('');
  const [error, setError] = useState('');

  // Field focus state
  const [nameFocused, setNameFocused] = useState(false);
  const [qtyFocused, setQtyFocused] = useState(false);
  const [unitFocused, setUnitFocused] = useState(false);
  const [minFocused, setMinFocused] = useState(false);
  const [costFocused, setCostFocused] = useState(false);

  // Reset form when opening
  useEffect(() => {
    if (visible) {
      setName(initialValues?.name ?? '');
      setCategory(initialValues?.category ?? 'Coffee Beans');
      setQuantity(String(initialValues?.quantity ?? 0));
      setUnit(initialValues?.unit ?? '');
      setMinStock(String(initialValues?.minStock ?? 0));
      setCost(initialValues?.cost !== undefined ? String(initialValues.cost) : '');
      setError('');

      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 70,
        friction: 13,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  function validate(): NewItemData | null {
    if (!name.trim()) { setError('Item name is required.'); return null; }
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty < 0) { setError('Quantity must be 0 or more.'); return null; }
    if (!unit.trim()) { setError('Unit is required (e.g. kg, L, pcs).'); return null; }
    const min = parseFloat(minStock);
    if (isNaN(min) || min < 0) { setError('Min stock must be 0 or more.'); return null; }
    const costVal = cost.trim() ? parseFloat(cost) : undefined;
    if (cost.trim() && (isNaN(costVal!) || costVal! < 0)) {
      setError('Cost must be a valid positive number.');
      return null;
    }
    return {
      name: name.trim(),
      category,
      quantity: Math.round(qty),
      unit: unit.trim(),
      minStock: Math.round(min),
      cost: costVal,
    };
  }

  function handleConfirm() {
    const data = validate();
    if (!data) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm(data);
    onClose();
  }

  const s = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 12,
      paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 12,
      maxHeight: '90%',
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginBottom: 16,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      marginBottom: 4,
    },
    title: {
      flex: 1,
      fontSize: 20,
      fontWeight: '700' as const,
      color: colors.foreground,
      fontFamily: 'Inter_700Bold',
    },
    closeBtn: {
      padding: 4,
    },
    scroll: {
      paddingHorizontal: 24,
      paddingBottom: 8,
    },
    label: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
      marginBottom: 6,
      marginTop: 14,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 11,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
      backgroundColor: colors.background,
    },
    inputFocused: { borderColor: colors.primary },
    // Category chips
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 2,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    chipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '15',
    },
    chipText: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: 'Inter_500Medium',
      fontWeight: '500' as const,
    },
    chipTextActive: {
      color: colors.primary,
      fontWeight: '600' as const,
      fontFamily: 'Inter_600SemiBold',
    },
    // Unit suggestions row
    unitSuggRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 8,
    },
    unitSugg: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: colors.secondary,
    },
    unitSuggText: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
    },
    // Two-column row for numeric fields
    twoCol: {
      flexDirection: 'row',
      gap: 10,
    },
    colWrap: { flex: 1 },
    error: {
      fontSize: 13,
      color: colors.destructive,
      fontFamily: 'Inter_400Regular',
      marginTop: 10,
    },
    btnRow: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 24,
      paddingTop: 16,
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: colors.secondary,
    },
    cancelText: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
    },
    confirmBtn: {
      flex: 2,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
    confirmText: {
      fontSize: 15,
      fontWeight: '700' as const,
      color: '#FFFFFF',
      fontFamily: 'Inter_700Bold',
    },
  });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
              <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
                <View style={s.handle} />
                <View style={s.headerRow}>
                  <Text style={s.title}>{mode === 'edit' ? 'Edit item' : 'Add item'}</Text>
                </View>

                <ScrollView style={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                  {/* Name */}
                  <Text style={s.label}>Item name *</Text>
                  <TextInput
                    style={[s.input, nameFocused && s.inputFocused]}
                    value={name}
                    onChangeText={v => { setName(v); setError(''); }}
                    placeholder="e.g. Oat Milk"
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="words"
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                    returnKeyType="next"
                  />

                  {/* Category */}
                  <Text style={s.label}>Category *</Text>
                  <View style={s.chipRow}>
                    {CATEGORIES.map(cat => {
                      const active = category === cat;
                      return (
                        <Pressable
                          key={cat}
                          style={({ pressed }) => [s.chip, active && s.chipActive, { opacity: pressed ? 0.7 : 1 }]}
                          onPress={() => setCategory(cat)}
                        >
                          <Text style={[s.chipText, active && s.chipTextActive]}>{cat}</Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* Quantity & Min Stock */}
                  <View style={s.twoCol}>
                    <View style={s.colWrap}>
                      <Text style={s.label}>Quantity *</Text>
                      <TextInput
                        style={[s.input, qtyFocused && s.inputFocused]}
                        value={quantity}
                        onChangeText={v => { setQuantity(v); setError(''); }}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.mutedForeground}
                        onFocus={() => setQtyFocused(true)}
                        onBlur={() => setQtyFocused(false)}
                        returnKeyType="next"
                      />
                    </View>
                    <View style={s.colWrap}>
                      <Text style={s.label}>Min stock *</Text>
                      <TextInput
                        style={[s.input, minFocused && s.inputFocused]}
                        value={minStock}
                        onChangeText={v => { setMinStock(v); setError(''); }}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.mutedForeground}
                        onFocus={() => setMinFocused(true)}
                        onBlur={() => setMinFocused(false)}
                        returnKeyType="next"
                      />
                    </View>
                  </View>

                  {/* Unit */}
                  <Text style={s.label}>Unit *</Text>
                  <TextInput
                    style={[s.input, unitFocused && s.inputFocused]}
                    value={unit}
                    onChangeText={v => { setUnit(v); setError(''); }}
                    placeholder="kg, L, pcs, bottles…"
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="none"
                    onFocus={() => setUnitFocused(true)}
                    onBlur={() => setUnitFocused(false)}
                    returnKeyType="next"
                  />
                  <View style={s.unitSuggRow}>
                    {UNIT_SUGGESTIONS.map(u => (
                      <Pressable
                        key={u}
                        style={({ pressed }) => [s.unitSugg, { opacity: pressed ? 0.6 : 1 }]}
                        onPress={() => { setUnit(u); setError(''); }}
                      >
                        <Text style={s.unitSuggText}>{u}</Text>
                      </Pressable>
                    ))}
                  </View>

                  {/* Cost */}
                  <Text style={s.label}>Unit cost (optional)</Text>
                  <TextInput
                    style={[s.input, costFocused && s.inputFocused]}
                    value={cost}
                    onChangeText={v => { setCost(v); setError(''); }}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={colors.mutedForeground}
                    onFocus={() => setCostFocused(true)}
                    onBlur={() => setCostFocused(false)}
                    returnKeyType="done"
                    onSubmitEditing={handleConfirm}
                  />

                  {error ? <Text style={s.error}>{error}</Text> : null}
                </ScrollView>

                <View style={s.btnRow}>
                  <Pressable
                    style={({ pressed }) => [s.cancelBtn, { opacity: pressed ? 0.7 : 1 }]}
                    onPress={onClose}
                  >
                    <Text style={s.cancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [s.confirmBtn, { opacity: pressed ? 0.8 : 1 }]}
                    onPress={handleConfirm}
                  >
                    <Text style={s.confirmText}>{mode === 'edit' ? 'Save changes' : 'Add item'}</Text>
                  </Pressable>
                </View>
              </Animated.View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
