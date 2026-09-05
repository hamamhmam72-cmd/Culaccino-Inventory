import React, { useRef, useState } from 'react';
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
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useRole } from '@/contexts/RoleContext';
import { useInventory } from '@/contexts/InventoryContext';
import { Feather } from '@expo/vector-icons';

const MANAGER_PASSWORD = 'A2004rwa';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { role, setRole, isManager } = useRole();
  const { items } = useInventory();

  const lowCount = items.filter(i => i.quantity <= i.minStock).length;
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  // Password modal state
  const [pwdVisible, setPwdVisible] = useState(false);
  const [pwdValue, setPwdValue] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdFocused, setPwdFocused] = useState(false);
  const slideAnim = useRef(new Animated.Value(400)).current;

  function openPasswordModal() {
    setPwdValue('');
    setPwdError('');
    setPwdVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }

  function closePasswordModal() {
    Animated.timing(slideAnim, {
      toValue: 400,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setPwdVisible(false));
  }

  function handlePasswordConfirm() {
    if (pwdValue === MANAGER_PASSWORD) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setRole('manager');
      closePasswordModal();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPwdError('Incorrect password. Please try again.');
      setPwdValue('');
    }
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingBottom: bottomPad + 80 },
    header: {
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: 24,
      backgroundColor: colors.background,
      alignItems: 'center',
    },
    avatarRing: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    avatarText: {
      fontSize: 32,
      color: colors.primaryForeground,
      fontFamily: 'Inter_700Bold',
      fontWeight: '700' as const,
    },
    roleBadge: {
      paddingHorizontal: 14,
      paddingVertical: 5,
      borderRadius: 20,
      backgroundColor: isManager ? colors.primary + '22' : colors.secondary,
      marginBottom: 4,
    },
    roleText: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: isManager ? colors.primary : colors.mutedForeground,
      fontFamily: 'Inter_600SemiBold',
    },
    section: { marginHorizontal: 16, marginBottom: 16 },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: colors.mutedForeground,
      fontFamily: 'Inter_600SemiBold',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
    rowIcon: {
      width: 34,
      height: 34,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowLabel: {
      flex: 1,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
    },
    rowValue: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
    },
    // Role selector
    roleSelector: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    roleOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 12,
    },
    roleOptionBorder: { borderTopWidth: 1, borderTopColor: colors.border },
    roleOptionActive: { backgroundColor: colors.primary + '10' },
    roleOptionIcon: {
      width: 38,
      height: 38,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    roleOptionLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500' as const,
      fontFamily: 'Inter_500Medium',
    },
    roleOptionDesc: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      marginTop: 2,
    },
    check: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
    },
    lockBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.secondary,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    lockBadgeText: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: 'Inter_500Medium',
    },
    // Password modal
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
      paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 16,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginBottom: 20,
    },
    sheetTitle: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: colors.foreground,
      fontFamily: 'Inter_700Bold',
      marginBottom: 4,
    },
    sheetSub: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      marginBottom: 20,
    },
    inputLabel: {
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
      fontSize: 16,
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
      backgroundColor: colors.background,
      marginBottom: 10,
      letterSpacing: 2,
    },
    inputFocused: { borderColor: colors.primary },
    errorText: {
      fontSize: 13,
      color: colors.destructive,
      fontFamily: 'Inter_400Regular',
      marginBottom: 14,
    },
    btnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
    cancelBtn: {
      flex: 1,
      paddingVertical: 13,
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
      paddingVertical: 13,
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

  const roles: { value: 'manager' | 'employee'; label: string; desc: string; icon: string; locked: boolean }[] = [
    {
      value: 'manager',
      label: 'Manager',
      desc: 'View stock, restock items, see all alerts',
      icon: 'briefcase',
      locked: true,
    },
    {
      value: 'employee',
      label: 'Employee',
      desc: 'Browse inventory and record withdrawals',
      icon: 'user',
      locked: false,
    },
  ];

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        {/* Avatar */}
        <View style={s.header}>
          <View style={s.avatarRing}>
            <Text style={s.avatarText}>{isManager ? 'M' : 'E'}</Text>
          </View>
          <View style={s.roleBadge}>
            <Text style={s.roleText}>{isManager ? 'Manager Mode' : 'Employee Mode'}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Overview</Text>
          <View style={s.card}>
            <View style={s.row}>
              <View style={[s.rowIcon, { backgroundColor: colors.secondary }]}>
                <Feather name="package" size={18} color={colors.foreground} />
              </View>
              <Text style={s.rowLabel}>Total items</Text>
              <Text style={s.rowValue}>{items.length}</Text>
            </View>
            <View style={[s.row, s.rowBorder]}>
              <View style={[s.rowIcon, { backgroundColor: colors.lowStockSurface }]}>
                <Feather name="alert-triangle" size={18} color={colors.lowStock} />
              </View>
              <Text style={s.rowLabel}>Low stock</Text>
              <Text style={[s.rowValue, { color: lowCount > 0 ? colors.lowStock : colors.success }]}>
                {lowCount}
              </Text>
            </View>
          </View>
        </View>

        {/* Role switcher */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Switch Role</Text>
          <View style={s.roleSelector}>
            {roles.map((r, idx) => {
              const active = role === r.value;
              return (
                <Pressable
                  key={r.value}
                  style={({ pressed }) => [
                    s.roleOption,
                    idx > 0 && s.roleOptionBorder,
                    active && s.roleOptionActive,
                    { opacity: pressed ? 0.75 : 1 },
                  ]}
                  onPress={() => {
                    if (active) return;
                    if (r.locked) {
                      openPasswordModal();
                    } else {
                      setRole(r.value);
                    }
                  }}
                >
                  <View
                    style={[
                      s.roleOptionIcon,
                      { backgroundColor: active ? colors.primary : colors.secondary },
                    ]}
                  >
                    <Feather
                      name={r.icon as any}
                      size={18}
                      color={active ? colors.primaryForeground : colors.mutedForeground}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.roleOptionLabel, { color: active ? colors.primary : colors.foreground }]}>
                      {r.label}
                    </Text>
                    <Text style={[s.roleOptionDesc, { color: colors.mutedForeground }]}>
                      {r.desc}
                    </Text>
                  </View>
                  {r.locked && !active && (
                    <View style={s.lockBadge}>
                      <Feather name="lock" size={11} color={colors.mutedForeground} />
                      <Text style={s.lockBadgeText}>Password</Text>
                    </View>
                  )}
                  {active && (
                    <View
                      style={[
                        s.check,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Feather name="check" size={13} color="#fff" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* App info */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>App</Text>
          <View style={s.card}>
            <View style={s.row}>
              <View style={[s.rowIcon, { backgroundColor: colors.secondary }]}>
                <Feather name="coffee" size={18} color={colors.primary} />
              </View>
              <Text style={s.rowLabel}>Culaccino Mobile</Text>
              <Text style={s.rowValue}>v1.0</Text>
            </View>
            <View style={[s.row, s.rowBorder]}>
              <View style={[s.rowIcon, { backgroundColor: colors.secondary }]}>
                <Feather name="database" size={18} color={colors.mutedForeground} />
              </View>
              <Text style={s.rowLabel}>Storage</Text>
              <Text style={s.rowValue}>Local device</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Password modal */}
      <Modal visible={pwdVisible} transparent animationType="none" onRequestClose={closePasswordModal}>
        <TouchableWithoutFeedback onPress={closePasswordModal}>
          <View style={s.overlay}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
                  <View style={s.handle} />

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <View style={[s.rowIcon, { backgroundColor: colors.secondary }]}>
                      <Feather name="lock" size={18} color={colors.primary} />
                    </View>
                    <Text style={s.sheetTitle}>Manager Access</Text>
                  </View>
                  <Text style={s.sheetSub}>Enter the manager password to continue.</Text>

                  <Text style={s.inputLabel}>Password</Text>
                  <TextInput
                    style={[s.input, pwdFocused && s.inputFocused]}
                    value={pwdValue}
                    onChangeText={v => { setPwdValue(v); setPwdError(''); }}
                    secureTextEntry
                    placeholder="••••••••"
                    placeholderTextColor={colors.mutedForeground}
                    autoFocus
                    onFocus={() => setPwdFocused(true)}
                    onBlur={() => setPwdFocused(false)}
                    onSubmitEditing={handlePasswordConfirm}
                    returnKeyType="done"
                  />

                  {pwdError ? <Text style={s.errorText}>{pwdError}</Text> : null}

                  <View style={s.btnRow}>
                    <Pressable
                      style={({ pressed }) => [s.cancelBtn, { opacity: pressed ? 0.7 : 1 }]}
                      onPress={closePasswordModal}
                    >
                      <Text style={s.cancelText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [s.confirmBtn, { opacity: pressed ? 0.8 : 1 }]}
                      onPress={handlePasswordConfirm}
                    >
                      <Text style={s.confirmText}>Unlock</Text>
                    </Pressable>
                  </View>
                </Animated.View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
