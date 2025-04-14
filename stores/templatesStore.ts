import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Template {
  id: string;         // ID du board Trello
  name: string;       // Nom affichable
  description?: string; // Description optionnelle
  createdAt: number;  // Date d'enregistrement comme template
}

interface TemplatesState {
  templates: Template[];
  loading: boolean;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  addTemplate: (boardId: string, name: string, description?: string) => Promise<{ success: boolean; message: string; }>;
  removeTemplate: (templateId: string) => Promise<void>;
}

export const useTemplatesStore = create<TemplatesState>((set, get) => ({
  templates: [],
  loading: false,
  error: null,

  fetchTemplates: async () => {
    try {
      set({ loading: true, error: null });
      const templatesJson = await AsyncStorage.getItem('board_templates');
      const templates = templatesJson ? JSON.parse(templatesJson) : [];
      set({ templates, loading: false });
    } catch (error) {
      console.error('[templatesStore] fetchTemplates error:', error);
      set({ error: 'Failed to fetch templates', loading: false });
    }
  },

  addTemplate: async (boardId: string, name: string, description?: string) => {
    try {
      set({ loading: true, error: null });
      
      // Vérifier si ce board est déjà un template
      const existingTemplate = get().templates.find(t => t.id === boardId);
      
      if (existingTemplate) {
        // Si le template existe déjà, on ne fait rien et on retourne un message
        set({ loading: false });
        return { success: false, message: 'Ce tableau est déjà enregistré comme modèle' };
      }
      
      const newTemplate: Template = {
        id: boardId,
        name,
        description,
        createdAt: Date.now(),
      };
      
      const templates = [...get().templates, newTemplate];
      await AsyncStorage.setItem('board_templates', JSON.stringify(templates));
      
      set({ templates, loading: false });
      return { success: true, message: 'Modèle enregistré avec succès' };
    } catch (error) {
      console.error('[templatesStore] addTemplate error:', error);
      set({ error: 'Failed to add template', loading: false });
      return { success: false, message: 'Erreur lors de l\'enregistrement du modèle' };
    }
  },

  removeTemplate: async (templateId: string) => {
    try {
      set({ loading: true, error: null });
      
      const templates = get().templates.filter(t => t.id !== templateId);
      await AsyncStorage.setItem('board_templates', JSON.stringify(templates));
      
      set({ templates, loading: false });
    } catch (error) {
      console.error('[templatesStore] removeTemplate error:', error);
      set({ error: 'Failed to remove template', loading: false });
    }
  },
}));