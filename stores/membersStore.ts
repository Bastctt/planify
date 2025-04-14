import { create } from 'zustand';
import { memberService } from '../services/memberService';
import { Member } from '../services/cardsService';

interface MembersState {
  currentUser: Member | null;
  boardMembers: Member[];
  loading: boolean;
  error: string | null;
  fetchCurrentUser: () => Promise<void>;
  fetchBoardMembers: (boardId: string) => Promise<void>;
}

export const useMembersStore = create<MembersState>((set) => ({
  currentUser: null,
  boardMembers: [],
  loading: false,
  error: null,

  fetchCurrentUser: async () => {
    try {
      set({ loading: true, error: null });
      const user = (await memberService.getCurrentUser()) as Member;
      set({ currentUser: user, loading: false });
    } catch (error) {
      console.error('[membersStore] fetchCurrentUser error:', error);
      set({ error: 'Failed to fetch current user', loading: false });
    }
  },

  fetchBoardMembers: async (boardId: string) => {
    try {
      set({ loading: true, error: null });
      const members = (await memberService.getBoardMembers(boardId)) as Member[];
      set({ boardMembers: members, loading: false });
    } catch (error) {
      console.error('[membersStore] fetchBoardMembers error:', error);
      set({ error: 'Failed to fetch board members', loading: false });
    }
  },
}));
