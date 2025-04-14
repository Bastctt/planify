import React, { useState, useEffect, useContext } from 'react';

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
import Toast from 'react-native-toast-message';

// context
import { ThemeContext } from '../../../context/themeContext';

interface EditWorkspaceModalProps {
  visible: boolean;
  initialName: string;
  initialDescription: string;
  onClose: () => void;
  onSubmit: (name: string, description: string) => void;
}

export default function EditWorkspaceModal({
  visible,
  initialName,
  initialDescription,
  onClose,
  onSubmit,
}: EditWorkspaceModalProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setDescription(initialDescription);
    }
  }, [visible, initialName, initialDescription]);

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim(), description.trim());
      Toast.show({
        type: 'success',
        text1: 'Espace de travail modifié',
        text2: `"${name}" a été mis à jour avec succès`,
        position: 'bottom',
        visibilityTime: 3000,
      });
      onClose();
    } else {
      Toast.show({
        type: 'error',
        text1: 'Erreur de validation',
        text2: "Le nom de l'espace de travail est requis",
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
  };

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

  const dynamicCancelButtonText = {
    color: theme === 'dark' ? '#e0e0e0' : '#666',
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.centeredView}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.modalView, dynamicModalView]}>
              <Text style={[styles.title, dynamicTitle]}>
                Éditer l'espace de travail
              </Text>
              <TextInput
                style={[styles.input, dynamicInput]}
                placeholder="Nom de l'espace de travail"
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
                <Pressable
                  style={[
                    styles.button,
                    styles.cancelButton,
                    dynamicCancelButton,
                  ]}
                  onPress={onClose}>
                  <Text style={[styles.cancelButtonText, dynamicCancelButtonText]}>
                    Annuler
                  </Text>
                </Pressable>
                <Pressable style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
                  <Text style={styles.submitButtonText}>Mettre à jour</Text>
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
  cancelButton: {
    // Le fond sera défini dynamiquement
  },
  submitButton: {
    backgroundColor: '#0079BF',
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});
