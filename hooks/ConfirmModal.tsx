import React, { useContext } from 'react';
import Toast from 'react-native-toast-message';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/themeContext';

interface ConfirmModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export default function ConfirmModal({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const { theme } = useContext(ThemeContext);

  const handleConfirm = async () => {
    try {
      await onConfirm();
      Toast.show({
        type: 'success',
        text1: 'Action confirmée',
        text2: "L'opération a été réalisée avec succès",
        position: 'bottom',
        visibilityTime: 3000,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: "Une erreur est survenue lors de l'opération",
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
  };

  // Styles dynamiques en fonction du thème
  const dynamicModalView = {
    backgroundColor: theme === 'dark' ? '#2a2a2a' : 'white',
  };

  const dynamicTitle = {
    color: theme === 'dark' ? '#e0e0e0' : '#000',
  };

  const dynamicMessage = {
    color: theme === 'dark' ? '#e0e0e0' : '#000',
  };

  const dynamicCancelButton = {
    backgroundColor: theme === 'dark' ? '#555' : '#f5f5f5',
  };

  const dynamicConfirmButton = {
    backgroundColor: theme === 'dark' ? '#66afe9' : '#0079BF',
  };

  const dynamicCancelButtonText = {
    color: theme === 'dark' ? '#e0e0e0' : '#666',
  };

  // La couleur du texte du bouton confirmer reste blanche
  const dynamicConfirmButtonText = {
    color: 'white',
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.centeredView}>
        <View style={[styles.modalView, dynamicModalView]}>
          {title && <Text style={[styles.title, dynamicTitle]}>{title}</Text>}
          <Text style={[styles.message, dynamicMessage]}>{message}</Text>
          <View style={styles.buttonContainer}>
            <Pressable style={[styles.button, styles.cancelButton, dynamicCancelButton]} onPress={onCancel}>
              <Text style={[styles.cancelButtonText, dynamicCancelButtonText]}>Annuler</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.confirmButton, dynamicConfirmButton]} onPress={handleConfirm}>
              <Text style={[styles.confirmButtonText, dynamicConfirmButtonText]}>Confirmer</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {},
  confirmButton: {},
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});
