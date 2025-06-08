'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings, RotateCcw } from 'lucide-react';
import { usePreferencesStore } from '@/lib/store/preferencesStore';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export function DashboardSettings() {
  const { dashboardPreferences, updateDashboardPreferences, resetPreferences } = usePreferencesStore();
  const [open, setOpen] = useState(false);
  
  const [localPrefs, setLocalPrefs] = useState(dashboardPreferences);

  const handleSave = () => {
    updateDashboardPreferences(localPrefs);
    setOpen(false);
  };

  const handleReset = () => {
    resetPreferences();
    // Get default preferences directly instead of using dashboardPreferences which might not have updated yet
    setLocalPrefs({
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
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Dashboard Settings</DialogTitle>
          <DialogDescription>
            Customize your dashboard preferences and personal targets
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Default Filters */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Default Filters</h3>
            
            <div className="space-y-2">
              <Label htmlFor="date-range">Default Date Range</Label>
              <Select
                value={localPrefs.defaultDateRange}
                onValueChange={(value: any) =>
                  setLocalPrefs({ ...localPrefs, defaultDateRange: value })
                }
              >
                <SelectTrigger id="date-range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last 30 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-filter">Default Quick Filter</Label>
              <Select
                value={localPrefs.defaultQuickFilter}
                onValueChange={(value: any) =>
                  setLocalPrefs({ ...localPrefs, defaultQuickFilter: value })
                }
              >
                <SelectTrigger id="quick-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tasks</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="high-priority">High Priority</SelectItem>
                  <SelectItem value="no-due-date">No Due Date</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Personal Targets */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Personal Targets</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="daily-target">Daily Task Target</Label>
                <Input
                  id="daily-target"
                  type="number"
                  min="1"
                  max="50"
                  value={localPrefs.personalTargets.dailyTasks}
                  onChange={(e) =>
                    setLocalPrefs({
                      ...localPrefs,
                      personalTargets: {
                        ...localPrefs.personalTargets,
                        dailyTasks: parseInt(e.target.value) || 5,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weekly-target">Weekly Task Target</Label>
                <Input
                  id="weekly-target"
                  type="number"
                  min="1"
                  max="200"
                  value={localPrefs.personalTargets.weeklyTasks}
                  onChange={(e) =>
                    setLocalPrefs({
                      ...localPrefs,
                      personalTargets: {
                        ...localPrefs.personalTargets,
                        weeklyTasks: parseInt(e.target.value) || 25,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Dashboard Layout */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Dashboard Sections</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-team">Team Performance</Label>
                <Switch
                  id="show-team"
                  checked={localPrefs.dashboardLayout.showTeamPerformance}
                  onCheckedChange={(checked) =>
                    setLocalPrefs({
                      ...localPrefs,
                      dashboardLayout: {
                        ...localPrefs.dashboardLayout,
                        showTeamPerformance: checked,
                      },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-time">Time-based Insights</Label>
                <Switch
                  id="show-time"
                  checked={localPrefs.dashboardLayout.showTimeInsights}
                  onCheckedChange={(checked) =>
                    setLocalPrefs({
                      ...localPrefs,
                      dashboardLayout: {
                        ...localPrefs.dashboardLayout,
                        showTimeInsights: checked,
                      },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-insights">Actionable Insights</Label>
                <Switch
                  id="show-insights"
                  checked={localPrefs.dashboardLayout.showActionableInsights}
                  onCheckedChange={(checked) =>
                    setLocalPrefs({
                      ...localPrefs,
                      dashboardLayout: {
                        ...localPrefs.dashboardLayout,
                        showActionableInsights: checked,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Preferences</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}