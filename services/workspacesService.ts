import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = process.env.EXPO_PUBLIC_TRELLO_API_KEY;
const BASE_URL = 'https://api.trello.com/1';

export interface Workspace {
  id: string;
  name: string;
  displayName: string;
  desc?: string;
}

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

export const workspaceService = {
  // Workspaces (anciennement "organizations")
  getWorkspaces: async () => {
    const api = await getTrelloApiClient();
    const response = await api.get<Workspace[]>('/members/me/organizations');
    return response.data;
  },

  createWorkspace: async (displayName: string, name?: string, desc?: string) => {
    const api = await getTrelloApiClient();
    const response = await api.post<Workspace>('/organizations', {
      displayName,
      name: name || displayName.toLowerCase().replace(/\s/g, '-'),
      desc,
    });
    return response.data;
  },

  updateWorkspace: async (workspaceId: string, updates: Partial<Workspace>) => {
    const api = await getTrelloApiClient();
    const response = await api.put<Workspace>(`/organizations/${workspaceId}`, updates);
    return response.data;
  },

  deleteWorkspace: async (workspaceId: string) => {
    const api = await getTrelloApiClient();
    await api.delete(`/organizations/${workspaceId}`);
  },
};