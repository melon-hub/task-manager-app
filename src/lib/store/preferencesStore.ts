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

interface PreferencesStore {
  dashboardPreferences: DashboardPreferences;
  updateDashboardPreferences: (preferences: Partial<DashboardPreferences>) => void;
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

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      dashboardPreferences: defaultPreferences,
      
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
        
      resetPreferences: () =>
        set({
          dashboardPreferences: defaultPreferences,
        }),
    }),
    {
      name: 'task-manager-preferences',
    }
  )
);