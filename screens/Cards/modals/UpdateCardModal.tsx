import React, { useState, useEffect, useContext } from 'react';

// react-native
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

// components
import { Dropdown } from '../components/Dropdown';

// store & services
import { List } from '@/services/listsService';
import { useCardsStore } from '@/stores/cardsStore';
import { useMembersStore } from '@/stores/membersStore';
import { Card, Member, Label } from '@/services/cardsService';

// context
import { ThemeContext } from '../../../context/themeContext';

interface UpdateCardModalProps {
  visible: boolean;
  onClose: () => void;
  card: Card;
  boardId: string;
  boardLabels: Label[];
  availableLists: List[];
}

export function UpdateCardModal({
  visible,
  onClose,
  card,
  boardId,
  boardLabels,
  availableLists,
}: UpdateCardModalProps) {
  const [name, setName] = useState(card.name);
  const [description, setDescription] = useState(card.desc);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(card.idMembers || []);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(card.labels ? card.labels.map(l => l.id) : []);
  const [selectedListId, setSelectedListId] = useState<string>(card.idList);

  const { boardMembers, fetchBoardMembers } = useMembersStore();
  const updateCard = useCardsStore((state) => state.updateCard);

  const labelColorMap: Record<string, string> = {
    green: "#61BD4F",
    yellow: "#F2D600",
    orange: "#FF9F1A",
    red: "#EB5A46",
    purple: "#C377E0",
    blue: "#0079BF",
    sky: "#00C2E0",
    lime: "#51E898",
    pink: "#FF78CB",
    black: "#4D4D4D",
    pink_dark: "#E6007E",
  };

  useEffect(() => {
    setName(card.name);
    setDescription(card.desc);
    setSelectedMemberIds(card.idMembers || []);
    setSelectedLabels(card.labels ? card.labels.map(l => l.id) : []);
    setSelectedListId(card.idList);
  }, [card]);

  useEffect(() => {
    fetchBoardMembers(boardId);
  }, [boardId, fetchBoardMembers]);

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const toggleLabelSelection = (labelId: string) => {
    setSelectedLabels(prev =>
      prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId]
    );
  };

  const handleSubmit = async () => {
    onClose();
    try {
      await updateCard(card.id, {
        name: name.trim(),
        desc: description.trim(),
        idMembers: selectedMemberIds,
        idLabels: selectedLabels,
        idList: selectedListId,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la carte :', error);
    }
  };

  const { theme } = useContext(ThemeContext);

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

  const dynamicSectionTitle = {
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

  const dynamicSubmitButtonText = {
    color: 'white',
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
              <Text style={[styles.title, dynamicTitle]}>Modifier la carte</Text>
              <TextInput
                style={[styles.input, dynamicInput]}
                placeholder="Titre de la carte"
                placeholderTextColor={theme === 'dark' ? '#aaa' : '#666'}
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={[styles.input, styles.textArea, dynamicInput]}
                placeholder="Description"
                placeholderTextColor={theme === 'dark' ? '#aaa' : '#666'}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
              <Text style={[styles.sectionTitle, dynamicSectionTitle]}>Changer de liste</Text>
              <Dropdown
                selectedValue={selectedListId}
                onValueChange={setSelectedListId}
                options={availableLists.map(list => ({
                  label: list.name,
                  value: list.id,
                }))}
              />
              <Text style={[styles.sectionTitle, dynamicSectionTitle]}>Labels</Text>
              <ScrollView horizontal contentContainerStyle={styles.labelsContainer}>
                {boardLabels.map((label: Label) => {
                  const isSelected = selectedLabels.includes(label.id);
                  return (
                    <Pressable
                      key={label.id}
                      style={[
                        styles.labelBadge,
                        { backgroundColor: labelColorMap[label.color] || '#ccc' },
                        isSelected && styles.labelBadgeSelected,
                      ]}
                      onPress={() => toggleLabelSelection(label.id)}>
                      <Text style={styles.labelText}>{label.name}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <Text style={[styles.sectionTitle, dynamicSectionTitle]}>Membres assignés</Text>
              <ScrollView horizontal contentContainerStyle={styles.membersContainer}>
                {boardMembers.map((member: Member) => {
                  const initials = member.fullName
                    .split(' ')
                    .map(n => n.charAt(0).toUpperCase())
                    .join('');
                  const isSelected = selectedMemberIds.includes(member.id);
                  return (
                    <Pressable
                      key={member.id}
                      style={[
                        styles.memberBubble,
                        isSelected && styles.memberBubbleSelected,
                      ]}
                      onPress={() => toggleMemberSelection(member.id)}>
                      <Text style={styles.memberInitial}>{initials}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <View style={styles.buttonContainer}>
                <Pressable style={[styles.button, styles.cancelButton, dynamicCancelButton]} onPress={onClose}>
                  <Text style={[styles.cancelButtonText, dynamicCancelButtonText]}>Annuler</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.submitButton, dynamicSubmitButton, !name.trim() && !description.trim() && styles.disabledButton]} onPress={handleSubmit}>
                  <Text style={[styles.submitButtonText, dynamicSubmitButtonText]}>Mettre à jour</Text>
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
    backgroundColor: 'white',
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
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
  labelsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  membersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  labelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
    minWidth: 40,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelBadgeSelected: {
    borderWidth: 0.8,
    borderColor: '#0079BF',
  },
  labelText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  memberBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  memberBubbleSelected: {
    backgroundColor: '#0079BF',
  },
  memberInitial: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
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
