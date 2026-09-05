/**
 * ActionModal — shared bottom-sheet style modal used for both
 * Withdraw and Restock actions.
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
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

interface ActionModalProps {
  visible: boolean;
  onClose: () => void;
  /** Called with (quantity, performedBy, note) */
  onConfirm: (quantity: number, performedBy: string, note: string) => void;
  title: string;
  subtitle?: string;
  confirmLabel: string;
  /** 'primary' = amber fill, 'destructive' = red fill */
  confirmVariant?: 'primary' | 'destructive';
  /** When true, "Your name" is a required field */
  requireName?: boolean;
  /** Max allowed quantity (for withdraw) */
  maxQuantity?: number;
}

export function ActionModal({
  visible,
  onClose,
  onConfirm,
  title,
  subtitle,
  confirmLabel,
  confirmVariant = 'primary',
  requireName = false,
  maxQuantity,
}: ActionModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(400)).current;

  const [quantity, setQuantity] = useState('1');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setQuantity('1');
      setName('');
      setNote('');
      setError('');
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const confirmColor =
    confirmVariant === 'destructive' ? colors.destructive : colors.primary;

  function handleConfirm() {
    const qty = parseInt(quantity, 10);
    if (!quantity || isNaN(qty) || qty <= 0) {
      setError('Enter a valid quantity greater than 0.');
      return;
    }
    if (maxQuantity !== undefined && qty > maxQuantity) {
      setError(`Cannot exceed current stock of ${maxQuantity}.`);
      return;
    }
    if (requireName && !name.trim()) {
      setError('Your name is required.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm(qty, name.trim() || 'Staff', note.trim());
    onClose();
  }

  const s = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: insets.bottom + 16,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: colors.foreground,
      fontFamily: 'Inter_700Bold',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      marginBottom: 20,
    },
    label: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
      backgroundColor: colors.background,
      marginBottom: 14,
    },
    inputFocused: {
      borderColor: colors.primary,
    },
    error: {
      fontSize: 13,
      color: colors.destructive,
      fontFamily: 'Inter_400Regular',
      marginBottom: 14,
    },
    row: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 4,
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: 15,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: colors.secondary,
    },
    cancelText: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
    },
    confirmBtn: {
      flex: 2,
      paddingVertical: 15,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: confirmColor,
    },
    confirmText: {
      fontSize: 16,
      fontWeight: '700' as const,
      color: '#FFFFFF',
      fontFamily: 'Inter_700Bold',
    },
  });

  const [qFocused, setQFocused] = useState(false);
  const [nFocused, setNFocused] = useState(false);
  const [noteFocused, setNoteFocused] = useState(false);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <Animated.View
                style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}
              >
                <View style={s.handle} />
                <Text style={s.title}>{title}</Text>
                {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}

                <Text style={s.label}>Quantity</Text>
                <TextInput
                  style={[s.input, qFocused && s.inputFocused]}
                  value={quantity}
                  onChangeText={v => { setQuantity(v); setError(''); }}
                  keyboardType="number-pad"
                  placeholder="Enter quantity"
                  placeholderTextColor={colors.mutedForeground}
                  onFocus={() => setQFocused(true)}
                  onBlur={() => setQFocused(false)}
                  returnKeyType="next"
                />

                {requireName && (
                  <>
                    <Text style={s.label}>Your name *</Text>
                    <TextInput
                      style={[s.input, nFocused && s.inputFocused]}
                      value={name}
                      onChangeText={v => { setName(v); setError(''); }}
                      placeholder="e.g. Ahmed"
                      placeholderTextColor={colors.mutedForeground}
                      autoCapitalize="words"
                      onFocus={() => setNFocused(true)}
                      onBlur={() => setNFocused(false)}
                      returnKeyType="next"
                    />
                  </>
                )}

                <Text style={s.label}>Note (optional)</Text>
                <TextInput
                  style={[s.input, noteFocused && s.inputFocused]}
                  value={note}
                  onChangeText={setNote}
                  placeholder="Add a note…"
                  placeholderTextColor={colors.mutedForeground}
                  onFocus={() => setNoteFocused(true)}
                  onBlur={() => setNoteFocused(false)}
                  returnKeyType="done"
                  onSubmitEditing={handleConfirm}
                />

                {error ? <Text style={s.error}>{error}</Text> : null}

                <View style={s.row}>
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
                    <Text style={s.confirmText}>{confirmLabel}</Text>
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
