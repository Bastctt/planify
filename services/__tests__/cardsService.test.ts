import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cardsService, Card, Label, Member } from '../../services/cardsService';

// On simule AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

// On simule axios
jest.mock('axios');

describe('cardsService', () => {
  let axiosInstance: {
    get: jest.Mock;
    post: jest.Mock;
    put: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Simuler la récupération du token dans AsyncStorage
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

  describe('getCards', () => {
    it('devrait récupérer les cartes et enrichir celles avec des membres', async () => {
      const boardId = 'board1';

      // Préparation des données de test
      const cardSansMembres: Card = {
        id: 'card1',
        pos: 1,
        name: 'Carte 1',
        desc: 'Description 1',
        closed: false,
        idBoard: boardId,
        idList: 'list1',
        idMembers: [],
      };
      const cardAvecMembres: Card = {
        id: 'card2',
        pos: 2,
        name: 'Carte 2',
        desc: 'Description 2',
        closed: false,
        idBoard: boardId,
        idList: 'list1',
        idMembers: ['member1'],
      };
      const memberData: Member = {
        id: 'member1',
        fullName: 'John Doe',
      };

      // La première requête GET renvoie les cartes du board
      axiosInstance.get.mockResolvedValueOnce({ data: [cardSansMembres, cardAvecMembres] });
      // La requête GET pour récupérer les infos du membre
      axiosInstance.get.mockResolvedValueOnce({ data: memberData });

      const cards = await cardsService.getCards(boardId);

      // Vérification de l'appel pour récupérer les cartes
      expect(axiosInstance.get).toHaveBeenCalledWith(`/boards/${boardId}/cards`, {
        params: {
          filter: 'open',
          fields: 'name,desc,labels,idList,idBoard,closed,due,dueComplete,idMembers,pos',
          label_fields: 'all',
        },
      });

      // Vérification que la récupération des détails du membre a été effectuée
      expect(axiosInstance.get).toHaveBeenCalledWith(`/members/member1`);

      // Vérification du résultat final
      expect(cards).toHaveLength(2);
      expect(cards[0].id).toBe('card1');
      expect(cards[0].members).toBeUndefined();
      expect(cards[1].id).toBe('card2');
      expect(cards[1].members).toEqual([memberData]);
    });

    it('devrait retourner un tableau vide si aucune carte n\'est retournée', async () => {
      const boardId = 'board1';
      axiosInstance.get.mockResolvedValueOnce({ data: [] });

      const result = await cardsService.getCards(boardId);

      expect(result).toEqual([]);
      expect(axiosInstance.get).toHaveBeenCalledWith(`/boards/${boardId}/cards`, {
        params: {
          filter: 'open',
          fields: 'name,desc,labels,idList,idBoard,closed,due,dueComplete,idMembers,pos',
          label_fields: 'all',
        },
      });
    });

    it('devrait lancer une erreur si la récupération des cartes échoue', async () => {
      const boardId = 'board1';
      axiosInstance.get.mockRejectedValueOnce(new Error('API error'));

      await expect(cardsService.getCards(boardId)).rejects.toThrow('API error');
    });

    it('devrait lancer une erreur si la récupération d\'un membre échoue', async () => {
      const boardId = 'board1';
      const cardAvecMembres: Card = {
        id: 'card1',
        pos: 1,
        name: 'Carte avec membre',
        desc: 'Description',
        closed: false,
        idBoard: boardId,
        idList: 'list1',
        idMembers: ['member1'],
      };

      axiosInstance.get.mockResolvedValueOnce({ data: [cardAvecMembres] });
      // Simuler une erreur lors de la récupération du membre
      axiosInstance.get.mockRejectedValueOnce(new Error('Member fetch error'));

      await expect(cardsService.getCards(boardId)).rejects.toThrow('Member fetch error');
    });

    it('devrait enrichir une carte comportant plusieurs membres', async () => {
      const boardId = 'board1';
      const cardAvecPlusieursMembres: Card = {
        id: 'card2',
        pos: 2,
        name: 'Carte Multi-membres',
        desc: 'Description multi',
        closed: false,
        idBoard: boardId,
        idList: 'list1',
        idMembers: ['member1', 'member2'],
      };
      const member1: Member = { id: 'member1', fullName: 'Alice' };
      const member2: Member = { id: 'member2', fullName: 'Bob' };

      axiosInstance.get.mockResolvedValueOnce({ data: [cardAvecPlusieursMembres] });
      // Les deux appels pour récupérer les membres
      axiosInstance.get.mockResolvedValueOnce({ data: member1 });
      axiosInstance.get.mockResolvedValueOnce({ data: member2 });

      const result = await cardsService.getCards(boardId);

      expect(result).toHaveLength(1);
      expect(result[0].members).toEqual([member1, member2]);
      // Vérifier que get a été appelé 1 (pour les cartes) + 2 (pour les membres) fois
      expect(axiosInstance.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('createCard', () => {
    it('devrait créer une carte et retourner les données de la carte créée', async () => {
      const newCard: Card = {
        id: 'card3',
        pos: 3,
        name: 'Nouvelle Carte',
        desc: 'Description nouvelle',
        closed: false,
        idBoard: 'board1',
        idList: 'list1',
      };

      axiosInstance.post.mockResolvedValueOnce({ data: newCard });

      const result = await cardsService.createCard(newCard.name, newCard.idList, newCard.desc, undefined);

      expect(axiosInstance.post).toHaveBeenCalledWith('/cards', {
        name: newCard.name,
        idList: newCard.idList,
        desc: newCard.desc,
        due: undefined,
      });
      expect(result).toEqual(newCard);
    });

    it('devrait lancer une erreur si la création de la carte échoue', async () => {
      axiosInstance.post.mockRejectedValueOnce(new Error('Create card error'));
      await expect(cardsService.createCard('Card Name', 'list1', 'desc', undefined)).rejects.toThrow('Create card error');
    });
  });

  describe('updateCard', () => {
    it('devrait mettre à jour une carte et retourner les données mises à jour', async () => {
      const cardId = 'card1';
      const updates = { name: 'Carte Mise à Jour' };
      const updatedCard: Card = {
        id: cardId,
        pos: 1,
        name: 'Carte Mise à Jour',
        desc: 'Description 1',
        closed: false,
        idBoard: 'board1',
        idList: 'list1',
      };

      axiosInstance.put.mockResolvedValueOnce({ data: updatedCard });

      const result = await cardsService.updateCard(cardId, updates);
      expect(axiosInstance.put).toHaveBeenCalledWith(`/cards/${cardId}`, updates);
      expect(result).toEqual(updatedCard);
    });

    it('devrait lancer une erreur si la mise à jour de la carte échoue', async () => {
      const cardId = 'card1';
      axiosInstance.put.mockRejectedValueOnce(new Error('Update error'));
      await expect(cardsService.updateCard(cardId, { name: 'Updated Card' })).rejects.toThrow('Update error');
    });
  });

  describe('deleteCard', () => {
    it('devrait supprimer une carte', async () => {
      const cardId = 'card1';
      axiosInstance.delete.mockResolvedValueOnce({});
      await cardsService.deleteCard(cardId);
      expect(axiosInstance.delete).toHaveBeenCalledWith(`/cards/${cardId}`);
    });

    it('devrait lancer une erreur si la suppression de la carte échoue', async () => {
      const cardId = 'card1';
      axiosInstance.delete.mockRejectedValueOnce(new Error('Delete error'));
      await expect(cardsService.deleteCard(cardId)).rejects.toThrow('Delete error');
    });
  });

  describe('getBoardLabels', () => {
    it('devrait récupérer les labels d\'un board', async () => {
      const boardId = 'board1';
      const labels: Label[] = [
        { id: 'label1', name: 'Label 1', color: 'green' },
        { id: 'label2', name: 'Label 2', color: 'blue' },
      ];
      axiosInstance.get.mockResolvedValueOnce({ data: labels });
      const result = await cardsService.getBoardLabels(boardId);
      expect(axiosInstance.get).toHaveBeenCalledWith(`/boards/${boardId}/labels`, { params: { limit: 100 } });
      expect(result).toEqual(labels);
    });

    it('devrait lancer une erreur si la récupération des labels échoue', async () => {
      const boardId = 'board1';
      axiosInstance.get.mockRejectedValueOnce(new Error('Labels fetch error'));
      await expect(cardsService.getBoardLabels(boardId)).rejects.toThrow('Labels fetch error');
    });
  });
});
