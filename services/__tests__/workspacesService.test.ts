import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { workspaceService, Workspace } from '../../services/workspacesService';

// Mock d'AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

// Mock d'axios
jest.mock('axios');

describe('workspaceService', () => {
  let axiosInstance: {
    get: jest.Mock;
    post: jest.Mock;
    put: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Simuler la récupération d'un token depuis AsyncStorage
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test_token');

    // Création d'une instance axios mockée
    axiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };

    // Lorsque axios.create est appelé, retourner l'instance mockée
    (axios.create as jest.Mock).mockReturnValue(axiosInstance);
  });

  describe('getWorkspaces', () => {
    it('devrait récupérer les workspaces et retourner les données', async () => {
      const workspaces: Workspace[] = [
        {
          id: 'ws1',
          name: 'workspace-one',
          displayName: 'Workspace One',
          desc: 'Premier workspace',
        },
        {
          id: 'ws2',
          name: 'workspace-two',
          displayName: 'Workspace Two',
        },
      ];
      axiosInstance.get.mockResolvedValueOnce({ data: workspaces });

      const result = await workspaceService.getWorkspaces();

      expect(axiosInstance.get).toHaveBeenCalledWith('/members/me/organizations');
      expect(result).toEqual(workspaces);
    });

    it('devrait retourner un tableau vide si aucun workspace n’est trouvé', async () => {
      axiosInstance.get.mockResolvedValueOnce({ data: [] });

      const result = await workspaceService.getWorkspaces();

      expect(axiosInstance.get).toHaveBeenCalledWith('/members/me/organizations');
      expect(result).toEqual([]);
    });

    it('devrait lancer une erreur si la récupération des workspaces échoue', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('Get workspaces error'));

      await expect(workspaceService.getWorkspaces()).rejects.toThrow('Get workspaces error');
    });

    it('devrait appeler AsyncStorage.getItem pour récupérer le token', async () => {
      axiosInstance.get.mockResolvedValueOnce({ data: [] });
      await workspaceService.getWorkspaces();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('trello_token');
    });
  });

  describe('createWorkspace', () => {
    it('devrait créer un workspace avec les valeurs fournies et retourner ses données', async () => {
      const displayName = 'My Workspace';
      const name = 'my-workspace';
      const desc = 'Description du workspace';
      const createdWorkspace: Workspace = {
        id: 'ws1',
        name,
        displayName,
        desc,
      };

      axiosInstance.post.mockResolvedValueOnce({ data: createdWorkspace });

      const result = await workspaceService.createWorkspace(displayName, name, desc);

      expect(axiosInstance.post).toHaveBeenCalledWith('/organizations', {
        displayName,
        name,
        desc,
      });
      expect(result).toEqual(createdWorkspace);
    });

    it('devrait créer un workspace en générant le nom par défaut si non fourni', async () => {
      const displayName = 'My Workspace';
      const desc = 'Description du workspace';
      const defaultName = displayName.toLowerCase().replace(/\s/g, '-');
      const createdWorkspace: Workspace = {
        id: 'ws2',
        name: defaultName,
        displayName,
        desc,
      };

      axiosInstance.post.mockResolvedValueOnce({ data: createdWorkspace });

      const result = await workspaceService.createWorkspace(displayName, undefined, desc);

      expect(axiosInstance.post).toHaveBeenCalledWith('/organizations', {
        displayName,
        name: defaultName,
        desc,
      });
      expect(result).toEqual(createdWorkspace);
    });

    it('devrait lancer une erreur si la création du workspace échoue', async () => {
      axiosInstance.post.mockRejectedValueOnce(new Error('Create workspace error'));

      await expect(workspaceService.createWorkspace('Workspace', 'name', 'desc')).rejects.toThrow('Create workspace error');
    });
  });

  describe('updateWorkspace', () => {
    it('devrait mettre à jour un workspace et retourner les données mises à jour', async () => {
      const workspaceId = 'ws1';
      const updates: Partial<Workspace> = { displayName: 'Updated Workspace' };
      const updatedWorkspace: Workspace = {
        id: workspaceId,
        name: 'workspace-one',
        displayName: 'Updated Workspace',
        desc: 'Premier workspace',
      };

      axiosInstance.put.mockResolvedValueOnce({ data: updatedWorkspace });

      const result = await workspaceService.updateWorkspace(workspaceId, updates);

      expect(axiosInstance.put).toHaveBeenCalledWith(`/organizations/${workspaceId}`, updates);
      expect(result).toEqual(updatedWorkspace);
    });

    it('devrait lancer une erreur si la mise à jour du workspace échoue', async () => {
      const workspaceId = 'ws1';
      axiosInstance.put.mockRejectedValueOnce(new Error('Update error'));

      await expect(workspaceService.updateWorkspace(workspaceId, { displayName: 'Updated' })).rejects.toThrow('Update error');
    });

    it('devrait gérer un objet de mise à jour vide sans erreur', async () => {
      const workspaceId = 'ws1';
      const existingWorkspace: Workspace = {
        id: workspaceId,
        name: 'workspace-one',
        displayName: 'Workspace One',
        desc: 'Premier workspace',
      };

      axiosInstance.put.mockResolvedValueOnce({ data: existingWorkspace });

      const result = await workspaceService.updateWorkspace(workspaceId, {});
      expect(axiosInstance.put).toHaveBeenCalledWith(`/organizations/${workspaceId}`, {});
      expect(result).toEqual(existingWorkspace);
    });
  });

  describe('deleteWorkspace', () => {
    it('devrait supprimer un workspace', async () => {
      const workspaceId = 'ws1';
      axiosInstance.delete.mockResolvedValueOnce({});
      await workspaceService.deleteWorkspace(workspaceId);
      expect(axiosInstance.delete).toHaveBeenCalledWith(`/organizations/${workspaceId}`);
    });

    it('devrait lancer une erreur si la suppression du workspace échoue', async () => {
      const workspaceId = 'ws1';
      axiosInstance.delete.mockRejectedValueOnce(new Error('Delete error'));

      await expect(workspaceService.deleteWorkspace(workspaceId)).rejects.toThrow('Delete error');
    });
  });
});
