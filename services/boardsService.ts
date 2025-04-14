import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = process.env.EXPO_PUBLIC_TRELLO_API_KEY;
const BASE_URL = 'https://api.trello.com/1';

export interface Board {
  id: string;
  name: string;
  desc: string;
  closed: boolean;
  idOrganization: string; // ID du workspace
  prefs: {
    background: any;
    backgroundColor: string;
    backgroundImage: string | null;
  };
}

interface BoardPrefs {
  background?: string;
  backgroundColor?: string;
  backgroundImage?: string;
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

export const boardsService = {
  // Récupérer les tableaux d'un workspace
  getBoards: async (workspaceId: string) => {
    const api = await getTrelloApiClient();
    const response = await api.get<Board[]>(`/organizations/${workspaceId}/boards`, {
      params: { filter: 'open' },
    });
    return response.data;
  },

  // Dans boardsService
  getBoard: async (boardId: string) => {
    const api = await getTrelloApiClient();
    const response = await api.get<Board>(`/boards/${boardId}`);
    return response.data;
  },

  // Créer un tableau dans un workspace
  createBoard: async (name: string, desc?: string, workspaceId?: string, prefs?: BoardPrefs, templateOptions?: { templateId: string, keepCards: boolean }) => {
    const api = await getTrelloApiClient();
    
    const params: any = {
      name,
      desc,
      idOrganization: workspaceId,
      defaultLists: !templateOptions, // Si on utilise un template, on ne veut pas les listes par défaut
    };
    
    // Ajouter les paramètres de template si fournis
    if (templateOptions?.templateId) {
      params.idBoardSource = templateOptions.templateId;
      params.keepFromSource = templateOptions.keepCards ? 'cards' : 'none';
    }
    
    if (prefs) {
      if (prefs.background) params.prefs_background = prefs.background;
      if (prefs.backgroundColor) params.prefs_backgroundColor = prefs.backgroundColor;
      if (prefs.backgroundImage) params.prefs_backgroundImage = prefs.backgroundImage;
    }
        
    const searchParams = new URLSearchParams();
    for (const key in params) {
      if (params[key] !== undefined) {
        searchParams.append(key, String(params[key]));
      }
    }
    
    const response = await api.post<Board>('/boards', searchParams.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    return response.data;
  },

  // Mettre à jour un tableau
  updateBoard: async (boardId: string, updates: Partial<Board>) => {
    const api = await getTrelloApiClient();
    
    const searchParams = new URLSearchParams();
    
    if (updates.name) searchParams.append('name', updates.name);
    if (updates.desc !== undefined) searchParams.append('desc', updates.desc);
    if (updates.closed !== undefined) searchParams.append('closed', updates.closed.toString());
    if (updates.idOrganization) searchParams.append('idOrganization', updates.idOrganization);
    
    if (updates.prefs) {
      if (updates.prefs.background) {
        searchParams.append('prefs/background', updates.prefs.background);
      }
      if (updates.prefs.backgroundColor) {
        searchParams.append('prefs/backgroundColor', updates.prefs.backgroundColor);
      }
      if (updates.prefs.backgroundImage !== undefined) {
        searchParams.append('prefs/backgroundImage', updates.prefs.backgroundImage || '');
      }
    }
    
    const response = await api.put<Board>(`/boards/${boardId}`, searchParams.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    return response.data;
  },

  // Supprimer un tableau
  deleteBoard: async (boardId: string) => {
    const api = await getTrelloApiClient();
    await api.delete(`/boards/${boardId}`, {
      params: { closed: true }
    });
  },
};