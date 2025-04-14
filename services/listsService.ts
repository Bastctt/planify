import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = process.env.EXPO_PUBLIC_TRELLO_API_KEY;
const BASE_URL = 'https://api.trello.com/1';

const getTrelloApiClient = async () => {
  const token = await AsyncStorage.getItem('trello_token');
  return axios.create({
    baseURL: BASE_URL,
    params: { key: API_KEY, token },
  });
};

export interface List {
  id: string;
  name: string;
  closed: boolean;
  idBoard: string;
}

export const listsService = {
  getLists: async (boardId: string) => {
    const api = await getTrelloApiClient();
    const response = await api.get<List[]>(`/boards/${boardId}/lists`, {
      params: { filter: 'open' },
    });
    return response.data;
  },

  createList: async (boardId: string, name: string) => {
    const api = await getTrelloApiClient();
    const response = await api.post(`/boards/${boardId}/lists`, { name });
    return response.data;
  },

  updateList: async (listId: string, newName: string) => {
    const api = await getTrelloApiClient();
    const response = await api.put(`/lists/${listId}/name`, { value: newName });
    return response.data;
  },
  
  deleteList: async (listId: string) => {
    const api = await getTrelloApiClient();
    const response = await api.put(`/lists/${listId}/closed`, { value: true });
    return response.data;
  }
};

