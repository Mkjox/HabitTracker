import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { fonts } from '../assets/fonts/fonts';

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmButtonColor?: string;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  loading?: boolean;
};

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onCancel,
  onConfirm,
  confirmButtonColor,
  iconName = 'warning-outline',
  loading = false,
}: ConfirmModalProps) {
  const { theme } = useTheme();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay}>
        <View style={styles.backdrop} />
        <View style={styles.centeredContent}>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
            <View style={[styles.iconWrap, { backgroundColor: `${theme.colors.error}14` }]}> 
              <Ionicons name={iconName} size={22} color={theme.colors.error} />
            </View>

            <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
            <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.colors.border }]}
                onPress={onCancel}
                activeOpacity={0.85}
              >
                <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>{cancelText}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: confirmButtonColor || theme.colors.error }]}
                onPress={onConfirm}
                activeOpacity={0.9}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmText}>{confirmText}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 9999,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(10, 14, 24, 0.45)',
  },
  centeredContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 24,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  confirmButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
});
