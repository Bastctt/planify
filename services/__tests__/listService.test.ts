import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { listsService, List } from '../../services/listsService';

// Mock d'AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

// Mock d'axios
jest.mock('axios');

describe('listsService', () => {
  let axiosInstance: { get: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    // Simuler la récupération d'un token dans AsyncStorage
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test_token');

    // Création d'une instance axios mockée
    axiosInstance = {
      get: jest.fn(),
    };

    // Quand axios.create est appelé, on retourne notre instance mockée
    (axios.create as jest.Mock).mockReturnValue(axiosInstance);
  });

  describe('getLists', () => {
    it('devrait récupérer les listes d\'un board et les retourner', async () => {
      const boardId = 'board1';
      const lists: List[] = [
        { id: 'list1', name: 'Liste 1', closed: false, idBoard: boardId },
        { id: 'list2', name: 'Liste 2', closed: false, idBoard: boardId },
      ];

      axiosInstance.get.mockResolvedValueOnce({ data: lists });

      const result = await listsService.getLists(boardId);

      expect(axiosInstance.get).toHaveBeenCalledWith(`/boards/${boardId}/lists`, {
        params: { filter: 'open' },
      });
      expect(result).toEqual(lists);
    });
  });
});
