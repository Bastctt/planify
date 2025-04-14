import React, { useState, useEffect, useContext } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { ThemeContext } from '../../../context/themeContext';

export const UpdateListModal = ({
  visible,
  initialName,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  initialName: string;
  onClose: () => void;
  onSubmit: (newName: string) => void;
}) => {
  const [newName, setNewName] = useState(initialName);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    setNewName(initialName);
  }, [initialName]);

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

  const dynamicCancelText = {
    color: theme === 'dark' ? '#e0e0e0' : '#666',
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.centeredView}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.modalView, dynamicModalView]}>
              <Text style={[styles.title, dynamicTitle]}>Renommer la liste</Text>
              <TextInput
                placeholder="Nouveau nom"
                placeholderTextColor={theme === 'dark' ? '#aaa' : '#666'}
                style={[styles.input, dynamicInput]}
                value={newName}
                onChangeText={setNewName}
              />
              <View style={styles.buttonContainer}>
                <Pressable style={[styles.button, dynamicCancelButton]} onPress={onClose}>
                  <Text style={[styles.buttonText, dynamicCancelText]}>Annuler</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.button,
                    dynamicSubmitButton,
                    !newName.trim() && styles.disabledButton,
                  ]}
                  onPress={() => {
                    if (newName.trim()) {
                      onSubmit(newName.trim());
                      onClose();
                    }
                  }}
                >
                  <Text style={[styles.buttonText, { color: 'white' }]}>Valider</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

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
  buttonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
});
