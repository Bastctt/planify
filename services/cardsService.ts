import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = process.env.EXPO_PUBLIC_TRELLO_API_KEY;
const BASE_URL = 'https://api.trello.com/1';

const getTrelloApiClient = async () => {
  const token = await AsyncStorage.getItem('trello_token');
  return axios.create({
    baseURL: BASE_URL,
    params: {
      key: API_KEY,
      token: token,
    },
  });
};

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Member {
  id: string;
  fullName: string;
  avatarUrl?: string;
}

export interface Card {
  pos: number;
  id: string;
  name: string;
  desc: string;
  closed: boolean;
  idBoard: string;
  idList: string;
  labels?: Label[];
  idLabels?: string[];
  idMembers?: string[];
  due?: string;
  dueComplete?: boolean;
  members?: Member[];
}

export const cardsService = {
  getCards: async (boardId: string) => {
    const api = await getTrelloApiClient();
    const response = await api.get<Card[]>(`/boards/${boardId}/cards`, {
      params: { 
        filter: 'open',
        fields: 'name,desc,labels,idList,idBoard,closed,due,dueComplete,idMembers,pos',
        label_fields: 'all'
      }
    });
    const cards: Card[] = response.data;

    const enrichedCards = await Promise.all(
      cards.map(async (card) => {
        if (card.idMembers && card.idMembers.length > 0) {
          const members = await Promise.all(
            card.idMembers.map(async (memberId: string) => {
              const memberResponse = await api.get<Member>(`/members/${memberId}`);
              return memberResponse.data;
            })
          );
          card.members = members;
        }
        return card;
      })
    );
    return enrichedCards;
  },
  
  createCard: async (name: string, idList: string, desc?: string, due?: string) => {
    const api = await getTrelloApiClient();
    const response = await api.post<Card>('/cards', {
      name,
      idList,
      desc,
      due,
    });
    return response.data;
  },

  updateCard: async (cardId: string, updates: Partial<Card>) => {
    const api = await getTrelloApiClient();
    const response = await api.put<Card>(`/cards/${cardId}`, updates);
    const updatedCard = response.data;
  
    // Enrichir les membres
    if (updatedCard.idMembers && updatedCard.idMembers.length > 0) {
      const members = await Promise.all(
        updatedCard.idMembers.map(async (memberId: string) => {
          const memberResponse = await api.get<Member>(`/members/${memberId}`);
          return memberResponse.data;
        })
      );
      updatedCard.members = members;
    }
  
    return updatedCard;
  },  

  deleteCard: async (cardId: string) => {
    const api = await getTrelloApiClient();
    await api.delete(`/cards/${cardId}`);
  },

  getBoardLabels: async (boardId: string) => {
    const api = await getTrelloApiClient();
    const response = await api.get<Label[]>(`/boards/${boardId}/labels`, { params: { limit: 100 } });
    return response.data;
  },
};
