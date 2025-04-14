import { create } from 'zustand';
import { Card, cardsService } from '../services/cardsService';

interface CardsState {
  hasFetched: boolean;
  cards: Card[];
  loading: boolean;
  error: string | null;
  currentBoardId: string | null;
  setCurrentBoard: (boardId: string | null) => void;
  fetchCards: (boardId?: string) => Promise<void>;
  createCard: (name: string, idList: string, desc?: string, due?: string) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
}

export const useCardsStore = create<CardsState>((set, get) => ({
  cards: [],
  loading: false,
  error: null,
  currentBoardId: null,
  hasFetched: false,

  setCurrentBoard: (boardId: string | null) => {
    const current = get().currentBoardId;
    if (current === boardId) return;
    set({ currentBoardId: boardId, cards: [], hasFetched: false });
  },

  // Récupérer les cartes d'un tableau donné (les cartes seront enrichies avec les infos membres)
  fetchCards: async (boardId?: string) => {
    if (get().hasFetched) return;
    try {
      set({ loading: true, error: null });
      const idToUse = boardId || get().currentBoardId;
      if (!idToUse) return;
      const cards = await cardsService.getCards(idToUse);
      set({ cards, hasFetched: true, loading: false });
    } catch (e) {
      console.error(e);
      set({ error: 'Erreur fetchCards', loading: false });
    }
  },
  
  // Créer une nouvelle carte
  createCard: async (name: string, idList: string, desc?: string, due?: string) => {
    try {
      const newCard = await cardsService.createCard(name, idList, desc, due);
      set((state) => ({ cards: [...state.cards, newCard] }));
    } catch (error) {
      console.error('[cardsStore] createCard error:', error);
      set({ error: 'Failed to create card' });
    }
  },

  // Mettre à jour une carte existante
  updateCard: async (cardId: string, updates: Partial<Card>) => {
    try {
      const updatedCard = await cardsService.updateCard(cardId, updates);
      set((state) => ({
        cards: state.cards.map((card) => card.id === cardId ? updatedCard : card),
      }));
    } catch (error) {
      console.error('[cardsStore] updateCard error:', error);
      set({ error: 'Failed to update card' });
    }
  },
  
  // Supprimer une carte
  deleteCard: async (cardId: string) => {
    try {
      await cardsService.deleteCard(cardId);
      set((state) => ({
        cards: state.cards.filter((card) => card.id !== cardId),
      }));
    } catch (error) {
      console.error('[cardsStore] deleteCard error:', error);
      set({ error: 'Failed to delete card' });
    }
  },
  
}));