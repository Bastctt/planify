import { create } from 'zustand';
import { Board, boardsService } from '../services/boardsService';

interface BoardPrefs {
  background?: string;
  backgroundColor?: string;
  backgroundImage?: string;
}
interface BoardsState {
  hasFetched: boolean;
  boards: Board[];
  loading: boolean;
  error: string | null;
  currentWorkspaceId: string | null;
  fetchBoards: (workspaceId?: string) => Promise<void>;
  createBoard: (
    name: string, 
    desc?: string, 
    workspaceId?: string, 
    prefs?: BoardPrefs, 
    templateOptions?: { templateId: string, keepCards: boolean }
  ) => Promise<void>;
  updateBoard: (boardId: string, updates: Partial<Board>) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;
  setCurrentWorkspace: (workspaceId: string | null) => void;
  getBoard: (boardId: string) => Promise<Board>;
}

export const useBoardsStore = create<BoardsState>((set, get) => ({
  boards: [],
  loading: false,
  error: null,
  currentWorkspaceId: null,
  hasFetched: false,

  setCurrentWorkspace: (workspaceId: string | null) => {
    const current = get().currentWorkspaceId;
    if (current === workspaceId) return;
  
    set({ currentWorkspaceId: workspaceId, boards: [], hasFetched: false });
  },

  fetchBoards: async (workspaceId?: string) => {
    if (get().hasFetched) return;

    try {
      set({ loading: true, error: null });
      const idToUse = workspaceId || get().currentWorkspaceId;
      if (!idToUse) {
        set({ boards: [], loading: false });
        return;
      }
      const boards = await boardsService.getBoards(idToUse);
      set({ boards, loading: false, hasFetched: true });
    } catch (error) {
      console.error('[boardsStore] fetchBoards error:', error);
      set({ error: 'Failed to fetch boards', loading: false });
    }
  },
  
  createBoard: async (name: string, desc?: string, workspaceId?: string, prefs?: BoardPrefs, templateOptions?: { templateId: string, keepCards: boolean }) => {
    try {
      const idToUse = workspaceId || get().currentWorkspaceId;
      if (!idToUse) {
        set({ error: 'No workspace selected' });
        return;
      }
      const newBoard = await boardsService.createBoard(name, desc, idToUse, prefs, templateOptions);
      set((state) => ({
        boards: [...state.boards, newBoard],
      }));
    } catch (error) {
      console.error('[boardsStore] createBoard error:', error);
      set({ error: 'Failed to create board' });
    }
  },

  updateBoard: async (boardId: string, updates: Partial<Board>) => {
    try {
      await boardsService.updateBoard(boardId, updates);
      set((state) => ({
        boards: state.boards.map(board =>
          board.id === boardId ? { ...board, ...updates } : board
        ),
      }));
    } catch (error) {
      console.error('[boardsStore] updateBoard error:', error);
      set({ error: 'Failed to update board' });
    }
  },
  
  deleteBoard: async (boardId: string) => {
    const prevBoards = get().boards;
    set((state) => ({
      boards: state.boards.filter(board => board.id !== boardId),
    }));
    try {
      await boardsService.deleteBoard(boardId);
    } catch (error) {
      console.error('[boardsStore] deleteBoard error:', error);
      // En cas d'erreur, on rétablit l'état précédent
      set({ boards: prevBoards, error: 'Failed to delete board' });
    }
  },

  // Ajout de la méthode getBoard pour récupérer un board par son id
  getBoard: async (boardId: string) => {
    try {
      const board = await boardsService.getBoard(boardId);
      return board;
    } catch (error) {
      console.error('[boardsStore] getBoard error:', error);
      throw error;
    }
  },
}));
