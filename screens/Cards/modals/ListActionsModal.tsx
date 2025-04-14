import React, { useContext } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Portal, Modal, useTheme } from 'react-native-paper';
import { ThemeContext } from '@/context/themeContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export default function ListActionsModalPaper({
  visible,
  onClose,
  onRename,
  onDelete,
}: Props) {
  const { theme } = useContext(ThemeContext);
  const paperTheme = useTheme();

  const textColor = theme === 'dark' ? '#e0e0e0' : '#1F2937';

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose} contentContainerStyle={[styles.container, { backgroundColor: paperTheme.colors.background }]}>        
        <Pressable onPress={onRename} style={styles.optionPressable}>
          <Text style={[styles.option, { color: textColor }]}>Renommer</Text>
        </Pressable>
        <Pressable onPress={onDelete} style={styles.optionPressable}>
          <Text style={[styles.option, { color: '#ff4d4d' }]}>Supprimer</Text>
        </Pressable>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    width: 200,
    alignSelf: 'center',
    alignItems: 'center',
  },
  optionPressable: {
    paddingVertical: 10,
  },
  option: {
    fontSize: 16,
    fontWeight: '600',
  },
});