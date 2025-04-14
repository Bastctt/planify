import React, { useEffect, useState, useRef, useMemo, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Modal, TextInput, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';

import { useCardsStore } from '@/stores/cardsStore';
import { useBoardsStore } from '@/stores/boardsStore';
import { memberService } from '@/services/memberService';
import { listsService, List } from '@/services/listsService';
import { Label, Card, cardsService } from '@/services/cardsService';

import { getBoardGradientColors } from '@/utils/boardColors';

import ConfirmModal from '@/hooks/ConfirmModal';
import { CreateCardModal } from './modals/CreateCardModal';
import { UpdateCardModal } from './modals/UpdateCardModal';
import { CreateListModal } from './modals/CreateListModal';

import { ThemeContext } from '../../context/themeContext';
import { UpdateListModal } from './modals/UpdateListModal';
import ListActionsModal from './modals/ListActionsModal';

const getInitials = (fullName: string): string => {
  const parts = fullName.trim().split(' ');
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0].toUpperCase()}${parts[parts.length - 1][0].toUpperCase()}`;
};

export default function CardsScreen() {
  const { boardId } = useLocalSearchParams<{ boardId: string }>();
  const { cards, loading: cardsLoading, error: cardsError, setCurrentBoard, fetchCards, deleteCard, hasFetched } = useCardsStore();
  const avatarColors = ['#2563EB', '#66afe9', '#0079BF', '#FF4D4D', '#FFC107'];

  const { getBoard, boards } = useBoardsStore();
  const [boardPrefs, setBoardPrefs] = useState<any>(null);
  const currentBoard = boards.find(bd => bd.id === boardId);

  const userFetched = useRef(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [lists, setLists] = useState<List[]>([]);
  const [listsLoading, setListsLoading] = useState(false);
  const [listsError, setListsError] = useState<string | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [boardLabels, setBoardLabels] = useState<Label[]>([]);
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const [updateListModalVisible, setUpdateListModalVisible] = useState(false);
  const [listToRename, setListToRename] = useState<List | null>(null);
  const [listToDelete, setListToDelete] = useState<List | null>(null);

  const [createListModalVisible, setCreateListModalVisible] = useState(false);

  const [actionsModalVisible, setActionsModalVisible] = useState(false);
  const [listActionsTarget, setListActionsTarget] = useState<List | null>(null);

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

  // Récupération de l'utilisateur courant (une seule fois)
  useEffect(() => {
    if (userFetched.current) return;
    userFetched.current = true;
    (async () => {
      try {
        const userData = await memberService.getCurrentUser();
        if (userData && typeof userData === 'object' && 'id' in userData) {
          setCurrentUserId((userData as { id: string }).id);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l’utilisateur courant :", error);
      }
    })();
  }, []);

  // Chargement des données du board : labels, listes et cartes
  useEffect(() => {
    if (!boardId) return;
    setCurrentBoard(boardId);
    if (!hasFetched) {
      fetchCards(boardId);
    }
    setListsLoading(true);
    Promise.all([
      cardsService.getBoardLabels(boardId),
      listsService.getLists(boardId)
    ])
      .then(([labels, listsData]) => {
        setBoardLabels(labels);
        setLists(listsData);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des données du board :", error);
        setListsError('Erreur lors de la récupération des listes');
      })
      .finally(() => setListsLoading(false));
  }, [boardId, hasFetched]);

  // Récupération des préférences du board via le store
  useEffect(() => {
    if (!boardId) return;
    getBoard(boardId)
      .then((boardData) => setBoardPrefs(boardData.prefs))
      .catch((err) => console.error("Erreur lors de la récupération du board :", err));
  }, [boardId, getBoard]);

  const boardColors: [string, string, ...string[]] = boardPrefs ? getBoardGradientColors(boardPrefs) : ['#E3E8F0', '#E3E8F0'];

  // Gestion de la suppression d'une carte
  const handleDeleteConfirm = async () => {
    setConfirmModalVisible(false);
    if (cardToDelete) {
      try {
        await deleteCard(cardToDelete.id);
      } catch (error) {
        console.error("Erreur lors de la suppression de la carte :", error);
      }
      setCardToDelete(null);
    }
  };

  // Regroupement des cartes par liste
  const cardsByList = useMemo(() => {
    return lists.reduce((acc, list) => {
      acc[list.id] = cards.filter(card => card.idList === list.id);
      return acc;
    }, {} as Record<string, Card[]>);
  }, [lists, cards]);

  const handleCardPress = (card: Card) => {
    setSelectedCard(card);
    setUpdateModalVisible(true);
  };

  // Fonction de réessai pour recharger les données
  const handleRetry = useCallback(() => {
    fetchCards();
    if (boardId) {
      setListsLoading(true);
      listsService.getLists(boardId)
        .then(data => setLists(data))
        .catch(err => {
          console.error(err);
          setListsError('Erreur lors de la récupération des listes');
        })
        .finally(() => setListsLoading(false));
    }
  }, [boardId, fetchCards]);

  // Callback pour rafraîchir les listes après la création d'une nouvelle liste
  const handleListCreated = async (listName: string) => {
    try {
      await listsService.createList(boardId, listName);
      const updatedLists = await listsService.getLists(boardId);
      setLists(updatedLists);
    } catch (error) {
      console.error("Erreur lors de la création de la liste :", error);
    }
  };
  
  const handleRenameList = async (listId: string, newName: string) => {
    try {
      await listsService.updateList(listId, newName);
      const updatedLists = await listsService.getLists(boardId);
      setLists(updatedLists);
    } catch (err) {
      console.error("Erreur lors du renommage :", err);
    }
  };
  
  const handleConfirmDeleteList = async () => {
    if (!listToDelete) return;
    try {
      // Supprimer toutes les cartes liées
      const cardsToDelete = cards.filter(c => c.idList === listToDelete.id);
      for (const card of cardsToDelete) {
        await deleteCard(card.id);
      }
  
      // Supprimer la liste
      await listsService.deleteList(listToDelete.id);
      const updatedLists = await listsService.getLists(boardId);
      setLists(updatedLists);
    } catch (err) {
      console.error("Erreur suppression liste + cartes :", err);
    } finally {
      setListToDelete(null);
    }
  };
  
  // Utilisation du ThemeContext pour adapter certains styles
  const { theme } = useContext(ThemeContext);

  const dynamicHeaderStyle = {
    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
    borderBottomColor: theme === 'dark' ? '#444' : '#D1D5DB',
  };

  const dynamicHeaderTitle = {
    color: theme === 'dark' ? '#e0e0e0' : '#1a1a1a',
  };

  const dynamicHeaderIcon = theme === 'dark' ? '#66afe9' : '#0079BF';

  const dynamicListTitle = {
    color: theme === 'dark' ? '#e0e0e0' : '#1F2937',
  };

  const dynamicAddCardButton = {
    backgroundColor: theme === 'dark' ? '#333' : '#F9FAFB',
    borderColor: theme === 'dark' ? '#555' : '#D1D5DB',
  };
  
  const dynamicAddText = {
    color: theme === 'dark' ? '#e0e0e0' : '#374151',
  };
  
  const dynamicAddIcon = {
    color: theme === 'dark' ? '#e0e0e0' : '#44546f',
  };
  
  const dynamicCardTitle = {
    color: theme === 'dark' ? '#e0e0e0' : '#1F2937',
  };

  const dynamicListColumn = {
    backgroundColor: theme === 'dark' ? '#3a3a3a' : '#F3F4F6',
  };

  const dynamicCardStyle = {
    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#FFFFFF',
  };

  const openCreateListModal = () => {
    setUpdateListModalVisible(false);
    setCreateListModalVisible(true);
  };
  
  const openUpdateListModal = (list: List) => {
    setCreateListModalVisible(false);
    setListToRename(list);
    setUpdateListModalVisible(true);
  };
  
  if (cardsLoading || listsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0079BF" />
      </View>
    );
  }

  if (cardsError || listsError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{cardsError || listsError}</Text>
        <Pressable style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <LinearGradient colors={boardColors} style={styles.container}>
      <View style={[styles.header, dynamicHeaderStyle]}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={dynamicHeaderIcon} />
        </Pressable>
        <Text style={[styles.headerTitle, dynamicHeaderTitle]}>
          {currentBoard ? currentBoard.name : 'Tableau'}
        </Text>
        <Pressable onPress={() => openCreateListModal()}>
          <Ionicons name="add-circle-outline" size={24} color={dynamicHeaderIcon} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listsContainer}
      >
        {lists.map(list => (
          <View key={list.id} style={[styles.listColumn, dynamicListColumn]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[styles.listTitle, dynamicListTitle]}>{list.name}</Text>
              <Pressable onPress={() => {
                setListActionsTarget(list);
                setActionsModalVisible(true);
              }}>
                <Ionicons name="ellipsis-horizontal" size={18} color="#6B7280" />
              </Pressable>
            </View>

            <View style={styles.cardsWrapper}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {cardsByList[list.id]?.map(card => (
                  <Pressable key={card.id} onPress={() => handleCardPress(card)}>
                    <View style={[styles.card, dynamicCardStyle]}>
                      <View style={styles.labelsContainer}>
                        <View style={styles.labelsWrapper}>
                          {card.labels?.map(label => (
                            <View
                              key={label.id}
                              style={[
                                styles.labelBadge,
                                { backgroundColor: labelColorMap[label.color] || '#ccc' },
                              ]}
                            >
                              <Text style={styles.labelText}>{label.name}</Text>
                            </View>
                          ))}
                        </View>
                        <Pressable
                          style={styles.trashButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            setCardToDelete(card);
                            setConfirmModalVisible(true);
                          }}
                        >
                          <Ionicons name="trash-outline" size={18} color="#ff4d4d" />
                        </Pressable>
                      </View>
                      <Text style={[styles.cardTitle, dynamicCardTitle]}>{card.name}</Text>
                      <View style={styles.membersContainer}>
                        <View style={styles.iconsGroup}>
                          {card.idMembers?.includes(currentUserId) && (
                            <Ionicons name="eye-outline" size={18} color={dynamicHeaderIcon} />
                          )}
                          {card.desc?.trim() && (
                            <Ionicons
                              name="reorder-three-outline"
                              size={18}
                              color={dynamicHeaderIcon}
                              style={{ marginLeft: 8 }}
                            />
                          )}
                        </View>
                        <View style={styles.badgeGroup}>
                          {card.members?.length ? (
                            card.members.map((member, index) => (
                              <View
                                key={member.id}
                                style={[
                                  styles.memberAvatar,
                                  { backgroundColor: avatarColors[index % avatarColors.length] },
                                ]}
                              >
                                <Text style={styles.memberInitial}>
                                  {getInitials(member.fullName)}
                                </Text>
                              </View>
                            ))
                          ) : (
                            <Text style={styles.memberInitial}>-</Text>
                          )}
                        </View>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
            <Pressable
              style={[styles.addCardButton, dynamicAddCardButton]}
              onPress={() => {
                setSelectedListId(list.id);
                setCreateModalVisible(true);
              }}
            >
              <Ionicons name="add" size={20} color={dynamicAddIcon.color} />
              <Text style={[styles.addText, dynamicAddText]}>Ajouter une carte</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>

      {createModalVisible && (
        <CreateCardModal
          boardId={boardId}
          idList={selectedListId}
          visible={createModalVisible}
          onClose={() => setCreateModalVisible(false)}
        />
      )}
      {selectedCard && (
        <UpdateCardModal
          boardId={boardId}
          card={selectedCard}
          availableLists={lists}
          boardLabels={boardLabels}
          visible={updateModalVisible}
          onClose={() => setUpdateModalVisible(false)}
        />
      )}
      <ConfirmModal
        visible={confirmModalVisible}
        title="Confirmation"
        message="Êtes-vous sûr de vouloir supprimer cette carte ?"
        onCancel={() => setConfirmModalVisible(false)}
        onConfirm={handleDeleteConfirm}
      />

      <ListActionsModal
        visible={actionsModalVisible}
        onClose={() => setActionsModalVisible(false)}
        onRename={() => {
          if (listActionsTarget) openUpdateListModal(listActionsTarget);
          setActionsModalVisible(false);
        }}
        onDelete={() => {
          if (listActionsTarget) setListToDelete(listActionsTarget);
          setActionsModalVisible(false);
        }}
      />

      {createListModalVisible ? (
        <CreateListModal
          visible
          onClose={() => setCreateListModalVisible(false)}
          onCreate={handleListCreated}
        />
      ) : updateListModalVisible && (
        <UpdateListModal
          visible
          initialName={listToRename?.name || ''}
          onClose={() => setUpdateListModalVisible(false)}
          onSubmit={(newName) => {
            if (listToRename) handleRenameList(listToRename.id, newName);
          }}
        />
      )}
      <ConfirmModal
        visible={!!listToDelete}
        title="Supprimer la liste"
        message="Toutes les cartes associées seront également supprimées. Confirmer ?"
        onCancel={() => setListToDelete(null)}
        onConfirm={handleConfirmDeleteList}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  headerButton: { padding: 8 },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  rightSpace: {
    width: 30,
    height: 30,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginTop: 8,
  },
  addText: { fontSize: 14, marginLeft: 8, fontWeight: '600' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  errorText: { color: '#DC2626', fontSize: 16, marginBottom: 12 },
  retryButton: { backgroundColor: '#2563EB', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  listsContainer: { paddingVertical: 16, paddingHorizontal: 12, alignItems: 'flex-start' },
  listColumn: {
    width: 300,
    marginRight: 16,
    borderRadius: 10,
    padding: 12,
    elevation: 3,
  },
  addListColumn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addListButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addListText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  listTitle: { fontSize: 16, fontWeight: '700', padding: 5, marginBottom: 12, marginLeft: 12 },
  cardsWrapper: { maxHeight: 550, marginBottom: 8 },
  card: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 8, marginBottom: 12, elevation: 2 },
  labelsContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  labelsWrapper: { flexDirection: 'row', flexWrap: 'wrap' },
  trashButton: { marginLeft: 'auto' },
  labelBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 6, height: 20, alignItems: 'center', justifyContent: 'center' },
  labelText: { fontSize: 10, color: '#fff', fontWeight: '600' },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  membersContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  iconsGroup: { flexDirection: 'row' },
  badgeGroup: { flexDirection: 'row' },
  memberAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  memberInitial: { fontSize: 12, color: '#fff', fontWeight: '600' },
});
