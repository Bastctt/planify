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

export const memberService = {
  getCurrentUser: async () => {
    const api = await getTrelloApiClient();
    const response = await api.get('/members/me');
    return response.data;
  },
  getBoardMembers: async (boardId: string) => {
    const api = await getTrelloApiClient();
    const response = await api.get(`/boards/${boardId}/members`);
    return response.data;
  },
};
