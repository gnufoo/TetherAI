import React, { forwardRef, useCallback, useMemo } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { colors } from '@/constants/colors';
import { addressBook, type Contact } from '@/services/mock-address-book';

const chainInfo: Record<string, { bg: string; text: string; name: string }> = {
  polygon: { bg: 'rgba(168, 85, 247, 0.2)', text: '#c084fc', name: 'Polygon' },
  ethereum: { bg: 'rgba(59, 130, 246, 0.2)', text: '#93c5fd', name: 'ETH' },
  tron: { bg: 'rgba(239, 68, 68, 0.2)', text: '#fca5a5', name: 'TRON' },
  lightning: { bg: 'rgba(245, 158, 11, 0.2)', text: '#fcd34d', name: 'Lightning' },
  btc: { bg: 'rgba(249, 115, 22, 0.2)', text: '#fdba74', name: 'BTC' },
  ton: { bg: 'rgba(14, 165, 233, 0.2)', text: '#7dd3fc', name: 'TON' },
};

type Props = {
  onPick?: (contact: Contact) => void;
};

const ContactsSheet = forwardRef<BottomSheet, Props>(({ onPick }, ref) => {
  const snapPoints = useMemo(() => ['80%'], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    [],
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
      backdropComponent={renderBackdrop}
    >
      <View style={styles.header}>
        <Text style={styles.headerLabel}>ADDRESS BOOK</Text>
        <Text style={styles.headerTitle}>Contacts</Text>
      </View>
      <BottomSheetScrollView contentContainerStyle={styles.list}>
        {addressBook.map((contact) => {
          const chain = chainInfo[contact.chain] ?? {
            bg: colors.border,
            text: colors.textSecondary,
            name: contact.chain,
          };
          return (
            <TouchableOpacity
              key={contact.id}
              style={styles.row}
              onPress={() => onPick?.(contact)}
              activeOpacity={0.7}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>{contact.avatar ?? '👤'}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{contact.name}</Text>
                <Text style={styles.address}>
                  {contact.address.slice(0, 14)}…{contact.address.slice(-6)}
                </Text>
              </View>
              <View style={[styles.chainPill, { backgroundColor: chain.bg }]}>
                <Text style={[styles.chainText, { color: chain.text }]}>{chain.name}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </BottomSheetScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.7}>
          <Text style={styles.addBtnText}>+ Add contact</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
});

ContactsSheet.displayName = 'ContactsSheet';
export default ContactsSheet;

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: colors.card },
  handle: { backgroundColor: colors.textSecondary },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  list: { paddingHorizontal: 12, paddingVertical: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: { fontSize: 18 },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 14, fontWeight: '600', color: colors.text },
  address: {
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
  },
  chainPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  chainText: { fontSize: 10, fontWeight: '500' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  addBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  addBtnText: { fontSize: 14, fontWeight: '500', color: colors.text },
});
