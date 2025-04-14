import React, { useState, useContext } from 'react';

// react-native
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

// stores
import { useCardsStore } from '@/stores/cardsStore';

// context
import { ThemeContext } from '../../../context/themeContext';
interface CreateCardModalProps {
  visible: boolean;
  onClose: () => void;
  boardId: string;
  idList: string;
}

export function CreateCardModal({ visible, onClose, idList, boardId }: CreateCardModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const createCard = useCardsStore((state) => state.createCard);
  const { theme } = useContext(ThemeContext);

  // Styles dynamiques selon le thème
  const dynamicModalView = {
    backgroundColor: theme === 'dark' ? '#2a2a2a' : 'white',
  };

  const dynamicTitle = {
    color: theme === 'dark' ? '#e0e0e0' : '#000',
  };

  const dynamicInput = {
    backgroundColor: theme === 'dark' ? '#3a3a3a' : 'white',
    color: theme === 'dark' ? '#e0e0e0' : '#000',
    borderColor: theme === 'dark' ? '#555' : '#ddd',
  };

  const dynamicCancelButton = {
    backgroundColor: theme === 'dark' ? '#555' : '#f5f5f5',
  };

  const dynamicSubmitButton = {
    backgroundColor: theme === 'dark' ? '#66afe9' : '#0079BF',
  };

  const dynamicCancelButtonText = {
    color: theme === 'dark' ? '#e0e0e0' : '#666',
  };

  const dynamicSubmitButtonText = {
    color: 'white',
  };

  const handleSubmit = async () => {
    if (name.trim()) {
      onClose();
      try {
        await createCard(name.trim(), idList, description.trim());
        setName('');
        setDescription('');
      } catch (error) {
        console.error('[CreateCardModal] Erreur lors de la création de la carte:', error);
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.centeredView}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.modalView, dynamicModalView]}>
              <Text style={[styles.title, dynamicTitle]}>Nouvelle carte</Text>
              <TextInput
                style={[styles.input, dynamicInput]}
                placeholder="Nom de la carte"
                placeholderTextColor={theme === 'dark' ? '#aaa' : '#666'}
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={[styles.input, styles.textArea, dynamicInput]}
                placeholder="Description (optionnel)"
                placeholderTextColor={theme === 'dark' ? '#aaa' : '#666'}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
              <View style={styles.buttonContainer}>
                <Pressable style={[styles.button, styles.cancelButton, dynamicCancelButton]} onPress={onClose}>
                  <Text style={[styles.cancelButtonText, dynamicCancelButtonText]}>Annuler</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.button,
                    styles.submitButton,
                    dynamicSubmitButton,
                    !name.trim() && styles.disabledButton,
                  ]}
                  onPress={handleSubmit}
                >
                  <Text style={[styles.submitButtonText, dynamicSubmitButtonText]}>Créer</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {},
  submitButton: {},
  disabledButton: { backgroundColor: '#cccccc', opacity: 0.7 },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});
