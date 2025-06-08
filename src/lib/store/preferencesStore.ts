import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DashboardPreferences {
  defaultDateRange: 'today' | 'week' | 'month' | 'all';
  defaultQuickFilter: 'all' | 'overdue' | 'high-priority' | 'no-due-date' | 'completed';
  personalTargets: {
    dailyTasks: number;
    weeklyTasks: number;
  };
  dashboardLayout: {
    showTeamPerformance: boolean;
    showTimeInsights: boolean;
    showActionableInsights: boolean;
  };
}

interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

interface PreferencesStore {
  dashboardPreferences: DashboardPreferences;
  activeUser: string | null;
  favoriteBoards: string[];
  users: User[];
  updateDashboardPreferences: (preferences: Partial<DashboardPreferences>) => void;
  setActiveUser: (userId: string | null) => void;
  toggleFavoriteBoard: (boardId: string) => void;
  addUser: (user: User) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  resetPreferences: () => void;
}

const defaultPreferences: DashboardPreferences = {
  defaultDateRange: 'week',
  defaultQuickFilter: 'all',
  personalTargets: {
    dailyTasks: 5,
    weeklyTasks: 25,
  },
  dashboardLayout: {
    showTeamPerformance: true,
    showTimeInsights: true,
    showActionableInsights: true,
  },
};

// Default user for initial setup
const defaultUser: User = {
  id: 'default-user',
  name: 'Michael',
  email: 'michael@example.com',
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      dashboardPreferences: defaultPreferences,
      activeUser: null,
      favoriteBoards: [],
      users: [defaultUser],
      
      updateDashboardPreferences: (preferences) =>
        set((state) => ({
          dashboardPreferences: {
            ...state.dashboardPreferences,
            ...preferences,
            personalTargets: preferences.personalTargets
              ? { ...state.dashboardPreferences.personalTargets, ...preferences.personalTargets }
              : state.dashboardPreferences.personalTargets,
            dashboardLayout: preferences.dashboardLayout
              ? { ...state.dashboardPreferences.dashboardLayout, ...preferences.dashboardLayout }
              : state.dashboardPreferences.dashboardLayout,
          },
        })),
        
      setActiveUser: (userId) => set({ activeUser: userId }),
      
      toggleFavoriteBoard: (boardId) =>
        set((state) => ({
          favoriteBoards: state.favoriteBoards.includes(boardId)
            ? state.favoriteBoards.filter(id => id !== boardId)
            : [...state.favoriteBoards, boardId],
        })),
      
      addUser: (user) =>
        set((state) => ({
          users: [...state.users, user],
        })),
      
      updateUser: (userId, updates) =>
        set((state) => ({
          users: state.users.map(u => u.id === userId ? { ...u, ...updates } : u),
        })),
      
      deleteUser: (userId) =>
        set((state) => ({
          users: state.users.filter(u => u.id !== userId),
          activeUser: state.activeUser === userId ? null : state.activeUser,
        })),

      resetPreferences: () =>
        set({
          dashboardPreferences: defaultPreferences,
          activeUser: null,
          favoriteBoards: [],
          users: [defaultUser],
        }),
    }),
    {
      name: 'task-manager-preferences',
    }
  )
);