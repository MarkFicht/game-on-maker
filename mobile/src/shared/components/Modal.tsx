import React from 'react';
import {
  Modal as RNModal,
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, spacing, borderRadius } from '../theme';
import { Typography } from './Typography';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export function Modal({ visible, onClose, title, children, style, testID }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      testID={testID}
    >
      <TouchableOpacity
        style={styles.overlay}
        onPress={onClose}
        activeOpacity={1}
        testID="modal-overlay"
      >
        <TouchableOpacity
          style={[styles.container, style]}
          activeOpacity={1}
          onPress={() => {}}
        >
          {title ? (
            <View style={styles.header}>
              <Typography variant="h3">{title}</Typography>
            </View>
          ) : null}
          <View style={styles.body}>{children}</View>
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceElevated,
  },
  body: {
    padding: spacing.lg,
  },
});
