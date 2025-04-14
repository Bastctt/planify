import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { memberService } from '../../services/memberService';

// Mock d'AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

// Mock d'axios
jest.mock('axios');

describe('memberService', () => {
  let axiosInstance: { get: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    // Simuler la récupération d'un token
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test_token');

    // Création d'une instance axios mockée
    axiosInstance = {
      get: jest.fn(),
    };

    // Lorsqu'axios.create est appelé, retourner l'instance mockée
    (axios.create as jest.Mock).mockReturnValue(axiosInstance);
  });

  describe('getCurrentUser', () => {
    it('devrait récupérer les données de l\'utilisateur courant', async () => {
      const userData = { id: 'user1', name: 'John Doe' };
      axiosInstance.get.mockResolvedValueOnce({ data: userData });

      const result = await memberService.getCurrentUser();

      expect(axiosInstance.get).toHaveBeenCalledWith('/members/me');
      expect(result).toEqual(userData);
    });

    it('devrait lancer une erreur si la récupération de l\'utilisateur échoue', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('User fetch error'));

      await expect(memberService.getCurrentUser()).rejects.toThrow('User fetch error');
    });

    it('devrait appeler AsyncStorage.getItem pour récupérer le token', async () => {
      const userData = { id: 'user1', name: 'John Doe' };
      axiosInstance.get.mockResolvedValueOnce({ data: userData });

      await memberService.getCurrentUser();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('trello_token');
    });

    it('devrait retourner une réponse vide si aucune donnée utilisateur n\'est retournée', async () => {
      axiosInstance.get.mockResolvedValueOnce({ data: {} });

      const result = await memberService.getCurrentUser();

      expect(result).toEqual({});
    });
  });

  describe('getBoardMembers', () => {
    it('devrait récupérer les membres d\'un board pour un boardId donné', async () => {
      const boardId = 'board1';
      const membersData = [
        { id: 'member1', fullName: 'Alice' },
        { id: 'member2', fullName: 'Bob' },
      ];
      axiosInstance.get.mockResolvedValueOnce({ data: membersData });

      const result = await memberService.getBoardMembers(boardId);

      expect(axiosInstance.get).toHaveBeenCalledWith(`/boards/${boardId}/members`);
      expect(result).toEqual(membersData);
    });

    it('devrait retourner un tableau vide si aucun membre n\'est trouvé', async () => {
      const boardId = 'board1';
      axiosInstance.get.mockResolvedValueOnce({ data: [] });

      const result = await memberService.getBoardMembers(boardId);

      expect(axiosInstance.get).toHaveBeenCalledWith(`/boards/${boardId}/members`);
      expect(result).toEqual([]);
    });

    it('devrait lancer une erreur si la récupération des membres échoue', async () => {
      const boardId = 'board1';
      axiosInstance.get.mockRejectedValueOnce(new Error('Board members fetch error'));

      await expect(memberService.getBoardMembers(boardId)).rejects.toThrow('Board members fetch error');
    });

    it('devrait appeler AsyncStorage.getItem pour récupérer le token lors de la récupération des membres', async () => {
      const boardId = 'board1';
      const membersData = [{ id: 'member1', fullName: 'Alice' }];
      axiosInstance.get.mockResolvedValueOnce({ data: membersData });

      await memberService.getBoardMembers(boardId);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('trello_token');
    });
  });
});
