import { create } from 'zustand';
import { Workspace } from '../services/workspacesService';
import { workspaceService } from '../services/workspacesService';

interface WorkspacesState {
  workspaces: Workspace[];
  loading: boolean;
  error: string | null;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, desc?: string) => Promise<void>;
  updateWorkspace: (workspaceId: string, updates: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
}

export const useWorkspacesStore = create<WorkspacesState>((set) => ({
  workspaces: [],
  loading: false,
  error: null,

  fetchWorkspaces: async () => {
    try {
      set({ loading: true, error: null });
      const workspaces = await workspaceService.getWorkspaces();
      set({ workspaces, loading: false });
    } catch (error) {
      console.error('[workspacesStore] fetchWorkspaces error:', error);
      set({ error: 'Failed to fetch workspaces', loading: false });
    }
  },

  createWorkspace: async (name: string, desc?: string) => {
    try {
      set({ loading: true, error: null });
      const newWorkspace = await workspaceService.createWorkspace(name, undefined, desc);
      set((state) => ({
        workspaces: [...state.workspaces, newWorkspace],
        loading: false,
      }));
    } catch (error) {
      console.error('[workspacesStore] createWorkspace error:', error);
      set({ error: 'Failed to create workspace', loading: false });
    }
  },

  updateWorkspace: async (workspaceId: string, updates: Partial<Workspace>) => {
    try {
      set({ loading: true, error: null });
      const updatedWorkspace = await workspaceService.updateWorkspace(workspaceId, updates);
      set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId ? updatedWorkspace : ws
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('[workspacesStore] updateWorkspace error:', error);
      set({ error: 'Failed to update workspace', loading: false });
    }
  },

  deleteWorkspace: async (workspaceId: string) => {
    try {
      set({ loading: true, error: null });
      await workspaceService.deleteWorkspace(workspaceId);
      set((state) => ({
        workspaces: state.workspaces.filter(ws => ws.id !== workspaceId),
        loading: false,
      }));
    } catch (error) {
      console.error('[workspacesStore] deleteWorkspace error:', error);
      set({ error: 'Failed to delete workspace', loading: false });
    }
  },
}));
