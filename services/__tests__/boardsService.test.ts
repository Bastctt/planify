import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { boardsService, Board } from '../../services/boardsService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

// Mock axios
jest.mock('axios');

// Récupération d'axios en tant que module mocké
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('boardsService', () => {
  let axiosInstance: {
    get: jest.Mock,
    post: jest.Mock,
    put: jest.Mock,
    delete: jest.Mock,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Simuler la récupération d'un token dans AsyncStorage
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test_token');

    // Création d'une instance axios mockée utilisée par le service
    axiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };

    // Quand axios.create est appelé, on retourne l'instance mockée
    (axios.create as jest.Mock).mockReturnValue(axiosInstance);
  });

  describe('getBoards', () => {
    it('devrait récupérer les tableaux d’un workspace', async () => {
      const workspaceId = 'workspace1';
      const boards: Board[] = [
        {
          id: 'board1',
          name: 'Board 1',
          desc: 'Description 1',
          closed: false,
          idOrganization: workspaceId,
          prefs: { background: {}, backgroundColor: 'blue', backgroundImage: null },
        },
        {
          id: 'board2',
          name: 'Board 2',
          desc: 'Description 2',
          closed: false,
          idOrganization: workspaceId,
          prefs: { background: {}, backgroundColor: 'red', backgroundImage: null },
        },
      ];

      axiosInstance.get.mockResolvedValueOnce({ data: boards });

      const result = await boardsService.getBoards(workspaceId);

      expect(axiosInstance.get).toHaveBeenCalledWith(`/organizations/${workspaceId}/boards`, { params: { filter: 'open' } });
      expect(result).toEqual(boards);
    });
  });

  describe('getBoard', () => {
    it('devrait récupérer un tableau spécifique', async () => {
      const boardId = 'board1';
      const board: Board = {
        id: boardId,
        name: 'Test Board',
        desc: 'Test Description',
        closed: false,
        idOrganization: 'workspace1',
        prefs: { background: {}, backgroundColor: 'green', backgroundImage: null },
      };

      axiosInstance.get.mockResolvedValueOnce({ data: board });

      const result = await boardsService.getBoard(boardId);

      expect(axiosInstance.get).toHaveBeenCalledWith(`/boards/${boardId}`);
      expect(result).toEqual(board);
    });
  });

  describe('createBoard', () => {
    it('devrait créer un tableau et retourner ses données', async () => {
      const board: Board = {
        id: 'board1',
        name: 'Board 1',
        desc: 'Description 1',
        closed: false,
        idOrganization: 'workspace1',
        prefs: { background: {}, backgroundColor: 'green', backgroundImage: null },
      };

      axiosInstance.post.mockResolvedValueOnce({ data: board });

      const result = await boardsService.createBoard(board.name, board.desc, board.idOrganization);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/boards',
        expect.any(String), // Vérifie que les données sont bien encodées en `application/x-www-form-urlencoded`
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      expect(result).toEqual(board);
    });
  });

  describe('updateBoard', () => {
    it('devrait mettre à jour un tableau et retourner les données mises à jour', async () => {
      const boardId = 'board1';
      const updates: Partial<Board> = { name: 'Updated Board' };
      const updatedBoard: Board = {
        id: boardId,
        name: 'Updated Board',
        desc: 'Description 1',
        closed: false,
        idOrganization: 'workspace1',
        prefs: { background: {}, backgroundColor: 'yellow', backgroundImage: null },
      };

      axiosInstance.put.mockResolvedValueOnce({ data: updatedBoard });

      const result = await boardsService.updateBoard(boardId, updates);

      expect(axiosInstance.put).toHaveBeenCalledWith(
        `/boards/${boardId}`,
        expect.any(String), // Vérifie que les données sont bien encodées en `application/x-www-form-urlencoded`
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      expect(result).toEqual(updatedBoard);
    });
  });

  describe('deleteBoard', () => {
    it('devrait supprimer un tableau', async () => {
      const boardId = 'board1';
      axiosInstance.delete.mockResolvedValueOnce({});
      await boardsService.deleteBoard(boardId);
      expect(axiosInstance.delete).toHaveBeenCalledWith(`/boards/${boardId}`, { params: { closed: true } });
    });
  });
});
