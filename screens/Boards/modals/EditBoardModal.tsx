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
  ScrollView,
} from 'react-native';

// expo
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// utils
import { GRADIENT_OPTIONS } from '@/utils/boardColors';

// context
import { ThemeContext } from '../../../context/themeContext';
interface GradientOption {
  id: string;
  name: string;
  colors: [string, string];
  backgroundColor: string;
}

interface EditBoardModalProps {
  visible: boolean;
  initialName: string;
  initialDescription: string;
  initialBackground?: string;
  onClose: () => void;
  onSubmit: (name: string, description: string, prefs?: any) => void;
}

export default function EditBoardModal({
  visible,
  initialName,
  initialDescription,
  initialBackground,
  onClose,
  onSubmit,
}: EditBoardModalProps) {
  const { theme } = useContext(ThemeContext);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [selectedGradient, setSelectedGradient] = useState<GradientOption | null>(null);

  const gradientOptions: GradientOption[] = Object.keys(GRADIENT_OPTIONS).map((key) => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    colors: GRADIENT_OPTIONS[key].colors,
    backgroundColor: GRADIENT_OPTIONS[key].backgroundColor,
  }));

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setDescription(initialDescription);
      if (initialBackground) {
        const matchingGradient = gradientOptions.find((option) => option.id === initialBackground);
        setSelectedGradient(matchingGradient || null);
      } else {
        setSelectedGradient(null);
      }
    }
  }, [visible, initialName, initialDescription, initialBackground]);

  const handleSubmit = () => {
    if (name.trim()) {
      const prefs = selectedGradient
        ? {
            background: selectedGradient.id,
            backgroundColor: selectedGradient.backgroundColor,
          }
        : undefined;
      onSubmit(name.trim(), description.trim(), prefs);
    }
  };

  // Styles dynamiques en fonction du thème
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

  const dynamicColorTitle = {
    color: theme === 'dark' ? '#e0e0e0' : '#000',
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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.centeredView}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.modalView, dynamicModalView]}>
              <Text style={[styles.title, dynamicTitle]}>Éditer le tableau</Text>
              <TextInput
                style={[styles.input, dynamicInput]}
                placeholder="Nom du tableau"
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
              <Text style={[styles.colorTitle, dynamicColorTitle]}>Couleur du tableau</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.gradientContainer}
              >
                {gradientOptions.map((option) => (
                  <Pressable key={option.id} onPress={() => setSelectedGradient(option)} style={styles.gradientOption}>
                    <View style={[styles.gradientWrapper, selectedGradient?.id === option.id && styles.selectedGradientWrapper]}>
                      <LinearGradient
                        colors={option.colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientSwatch}
                      />
                      {selectedGradient?.id === option.id && (
                        <View style={styles.checkmarkContainer}>
                          <Ionicons name="checkmark-circle" size={22} color="white" />
                        </View>
                      )}
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
              <View style={styles.buttonContainer}>
                <Pressable style={[styles.button, styles.cancelButton, dynamicCancelButton]} onPress={onClose}>
                  <Text style={[styles.cancelButtonText, dynamicCancelButtonText]}>Annuler</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.submitButton, dynamicSubmitButton]} onPress={handleSubmit}>
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
  colorTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
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
  gradientContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 5,
  },
  gradientOption: {
    marginRight: 10,
    alignItems: 'center',
    width: 60,
  },
  gradientWrapper: {
    padding: 2,
    borderRadius: 10,
    marginBottom: 5,
  },
  selectedGradientWrapper: {
    backgroundColor: '#0079BF',
    padding: 3,
  },
  gradientSwatch: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  checkmarkContainer: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: 'transparent',
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
  cancelButtonText: {
    color: '#666',
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
