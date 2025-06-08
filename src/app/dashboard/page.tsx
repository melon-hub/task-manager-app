'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  Calendar,
  Users,
  BarChart3,
  Target,
  CheckSquare
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, LineChart, Line, CartesianGrid } from 'recharts';
import { cn } from '@/lib/utils';
import { startOfDay, startOfWeek, startOfMonth, endOfDay, isAfter, isBefore, format, addDays, subDays } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/lib/db/schema';
import { Board, Card as CardType, Bucket, ChecklistItem } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { InteractiveLineChart } from '@/components/dashboard/InteractiveLineChart';
import { DashboardSettings } from '@/components/dashboard/DashboardSettings';
import { usePreferencesStore } from '@/lib/store/preferencesStore';

export default function DashboardPage() {
  const router = useRouter();
  const { dashboardPreferences } = usePreferencesStore();
  
  const [boards, setBoards] = useState<Board[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [cards, setCards] = useState<CardType[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>(dashboardPreferences.defaultDateRange);
  const [quickFilter, setQuickFilter] = useState<'all' | 'overdue' | 'high-priority' | 'no-due-date' | 'completed'>(dashboardPreferences.defaultQuickFilter);
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load all data from database
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [boardsData, bucketsData, cardsData] = await Promise.all([
          db.boards.toArray(),
          db.buckets.toArray(),
          db.cards.toArray()
        ]);
        
        setBoards(boardsData);
        setBuckets(bucketsData);
        setCards(cardsData);
        
        // Set initial board selection
        if (selectedBoardId === null && boardsData.length > 0) {
          setSelectedBoardId('all');
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [selectedBoardId]);

  // Get date range boundaries
  const getDateRangeBounds = () => {
    const now = new Date();
    const today = startOfDay(now);
    
    switch (dateRange) {
      case 'today':
        return { start: today, end: endOfDay(now) };
      case 'week':
        return { start: subDays(today, 7), end: endOfDay(now) };
      case 'month':
        return { start: subDays(today, 30), end: endOfDay(now) };
      default:
        return { start: null, end: null };
    }
  };

  // Filter cards based on all criteria
  const filteredCards = cards.filter(card => {
    // Board filter
    if (selectedBoardId && selectedBoardId !== 'all') {
      const bucket = buckets.find(b => b.id === card.bucketId);
      if (bucket?.boardId !== selectedBoardId) return false;
    }

    // Date range filter (for created/updated dates)
    const { start, end } = getDateRangeBounds();
    if (start && end) {
      const cardDate = new Date(card.updatedAt || card.createdAt);
      if (cardDate < start || cardDate > end) return false;
    }

    // Quick filters
    switch (quickFilter) {
      case 'overdue':
        return !card.completed && card.dueDate && isBefore(new Date(card.dueDate), startOfDay(new Date()));
      case 'high-priority':
        return card.priority === 'high' && !card.completed;
      case 'no-due-date':
        return !card.dueDate && !card.completed;
      case 'completed':
        return card.completed;
      case 'all':
      default:
        return true;
    }
  });

  // Assignee filter
  const finalFilteredCards = assigneeFilter === 'all' 
    ? filteredCards 
    : filteredCards.filter(card => card.assignees?.includes(assigneeFilter));

  const filteredBuckets = !selectedBoardId || selectedBoardId === 'all'
    ? buckets
    : buckets.filter(bucket => bucket.boardId === selectedBoardId);

  // Get all unique assignees
  const allAssignees = Array.from(new Set(
    cards.flatMap(card => card.assignees || [])
  )).sort();

  // Calculate statistics
  const totalCards = finalFilteredCards.length;
  const completedCards = finalFilteredCards.filter(c => c.completed).length;
  const activeCards = totalCards - completedCards;
  const completionRate = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  // Priority distribution 
  const priorityData = [
    { name: 'High', value: finalFilteredCards.filter(c => c.priority === 'high' && !c.completed).length, color: '#ef4444' },
    { name: 'Medium', value: finalFilteredCards.filter(c => c.priority === 'medium' && !c.completed).length, color: '#f59e0b' },
    { name: 'Low', value: finalFilteredCards.filter(c => c.priority === 'low' && !c.completed).length, color: '#22c55e' },
    { name: 'None', value: finalFilteredCards.filter(c => !c.priority && !c.completed).length, color: '#6b7280' },
  ].filter(item => item.value > 0);

  // Due date analysis
  const today = new Date();
  const overdueTasks = finalFilteredCards.filter(c => 
    !c.completed && c.dueDate && isBefore(new Date(c.dueDate), startOfDay(today))
  ).length;
  
  const dueTodayTasks = finalFilteredCards.filter(c => {
    if (!c.dueDate || c.completed) return false;
    const dueDate = new Date(c.dueDate);
    return dueDate >= startOfDay(today) && dueDate <= endOfDay(today);
  }).length;
  
  const dueThisWeekTasks = finalFilteredCards.filter(c => {
    if (!c.dueDate || c.completed) return false;
    const dueDate = new Date(c.dueDate);
    const weekEnd = addDays(today, 7);
    return isAfter(dueDate, today) && isBefore(dueDate, weekEnd);
  }).length;

  // Tasks by board
  const boardData = !selectedBoardId || selectedBoardId === 'all' 
    ? boards.map(board => {
        const boardCards = cards.filter(c => {
          const bucket = buckets.find(b => b.id === c.bucketId);
          return bucket?.boardId === board.id;
        });
        return {
          name: board.title,
          total: boardCards.length,
          completed: boardCards.filter(c => c.completed).length,
          active: boardCards.filter(c => !c.completed).length,
        };
      }).filter(b => b.total > 0)
    : [{
        name: boards.find(b => b.id === selectedBoardId)?.title || '',
        total: finalFilteredCards.length,
        completed: finalFilteredCards.filter(c => c.completed).length,
        active: finalFilteredCards.filter(c => !c.completed).length,
      }];

  // Recent activity (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    const completed = finalFilteredCards.filter(c => {
      if (!c.updatedAt || !c.completed) return false;
      const updatedDate = new Date(c.updatedAt);
      return updatedDate >= dayStart && updatedDate <= dayEnd;
    }).length;

    return {
      date: format(date, 'EEE'),
      completed,
    };
  });

  // Checklist progress
  const cardsWithChecklists = finalFilteredCards.filter(c => c.checklist && c.checklist.length > 0);
  const totalChecklistItems = cardsWithChecklists.reduce((acc, card) => acc + (card.checklist?.length || 0), 0);
  const completedChecklistItems = cardsWithChecklists.reduce((acc, card) => 
    acc + (card.checklist?.filter((item: ChecklistItem) => item.completed).length || 0), 0
  );
  const checklistProgress = totalChecklistItems > 0 
    ? Math.round((completedChecklistItems / totalChecklistItems) * 100) 
    : 0;

  // Calculate velocity metrics
  const calculateVelocity = () => {
    const now = new Date();
    const weekAgo = subDays(now, 7);
    const twoWeeksAgo = subDays(now, 14);
    
    const thisWeekCompleted = cards.filter(c => {
      if (!c.completed || !c.updatedAt) return false;
      const date = new Date(c.updatedAt);
      return date >= weekAgo && date <= now;
    }).length;
    
    const lastWeekCompleted = cards.filter(c => {
      if (!c.completed || !c.updatedAt) return false;
      const date = new Date(c.updatedAt);
      return date >= twoWeeksAgo && date < weekAgo;
    }).length;
    
    const trend = lastWeekCompleted > 0 
      ? Math.round(((thisWeekCompleted - lastWeekCompleted) / lastWeekCompleted) * 100)
      : 0;
    
    return { week: thisWeekCompleted, lastWeek: lastWeekCompleted, trend };
  };
  const velocityMetrics = calculateVelocity();

  // Calculate average cycle time
  const calculateCycleTime = () => {
    const completedWithDates = cards.filter(c => c.completed && c.createdAt && c.updatedAt);
    if (completedWithDates.length === 0) return 0;
    
    const cycleTimes = completedWithDates.map(c => {
      const created = new Date(c.createdAt);
      const completed = new Date(c.updatedAt);
      return (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // days
    });
    
    const avg = cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length;
    return Math.round(avg * 10) / 10; // 1 decimal place
  };
  const avgCycleTime = calculateCycleTime();

  // Calculate WIP and warnings
  const calculateWIP = () => {
    const activeCards = cards.filter(c => !c.completed);
    const wipByBucket = new Map<string, number>();
    
    activeCards.forEach(card => {
      const count = wipByBucket.get(card.bucketId) || 0;
      wipByBucket.set(card.bucketId, count + 1);
    });
    
    const warnings = Array.from(wipByBucket.entries())
      .filter(([bucketId, count]) => count > 10) // WIP limit of 10
      .map(([bucketId]) => buckets.find(b => b.id === bucketId)?.title || 'Unknown');
    
    return { count: activeCards.length, warnings };
  };
  const { count: wipCount, warnings: wipWarnings } = calculateWIP();

  // Calculate throughput
  const calculateThroughput = () => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const completedLast30 = cards.filter(c => {
      if (!c.completed || !c.updatedAt) return false;
      return new Date(c.updatedAt) >= thirtyDaysAgo;
    }).length;
    
    const daily = Math.round((completedLast30 / 30) * 10) / 10;
    const weekly = Math.round(daily * 7);
    
    return { daily, weekly };
  };
  const throughput = calculateThroughput();

  // Generate burndown data
  const generateBurndownData = () => {
    const days = 30;
    const data = [];
    const now = new Date();
    const startDate = subDays(now, days);
    
    // Get total tasks at start
    const totalTasksAtStart = cards.filter(c => new Date(c.createdAt) <= startDate).length;
    const idealDecrement = totalTasksAtStart / days;
    
    for (let i = 0; i <= days; i++) {
      const date = addDays(startDate, i);
      const dateStr = format(date, 'MMM d');
      
      // Count remaining tasks on this date
      const remaining = cards.filter(c => {
        const created = new Date(c.createdAt);
        const completed = c.completed && c.updatedAt ? new Date(c.updatedAt) : null;
        
        return created <= date && (!completed || completed > date);
      }).length;
      
      data.push({
        date: dateStr,
        remaining,
        ideal: Math.max(0, Math.round(totalTasksAtStart - (idealDecrement * i)))
      });
    }
    
    return data;
  };
  const burndownData = generateBurndownData();

  // Calculate workload distribution
  const calculateWorkload = () => {
    const workloadMap = new Map<string, { active: number; completed: number }>();
    
    cards.forEach(card => {
      if (card.assignees) {
        card.assignees.forEach(assignee => {
          const current = workloadMap.get(assignee) || { active: 0, completed: 0 };
          if (card.completed) {
            current.completed++;
          } else {
            current.active++;
          }
          workloadMap.set(assignee, current);
        });
      }
    });
    
    return Array.from(workloadMap.entries()).map(([name, stats]) => ({
      name,
      active: stats.active,
      completed: stats.completed,
      capacity: 8, // Default capacity of 8 tasks per person
      total: stats.active + stats.completed
    })).sort((a, b) => b.active - a.active);
  };
  const workloadData = calculateWorkload();

  // Calculate team velocity
  const calculateTeamVelocity = () => {
    const now = new Date();
    const weekAgo = subDays(now, 7);
    const twoWeeksAgo = subDays(now, 14);
    
    const velocityMap = new Map<string, { thisWeek: number; lastWeek: number }>();
    
    cards.forEach(card => {
      if (card.completed && card.updatedAt && card.assignees) {
        const completedDate = new Date(card.updatedAt);
        card.assignees.forEach(assignee => {
          const current = velocityMap.get(assignee) || { thisWeek: 0, lastWeek: 0 };
          
          if (completedDate >= weekAgo) {
            current.thisWeek++;
          } else if (completedDate >= twoWeeksAgo && completedDate < weekAgo) {
            current.lastWeek++;
          }
          
          velocityMap.set(assignee, current);
        });
      }
    });
    
    return Array.from(velocityMap.entries())
      .map(([name, velocity]) => ({ name, ...velocity }))
      .sort((a, b) => b.thisWeek - a.thisWeek)
      .slice(0, 10); // Top 10 performers
  };
  const teamVelocityData = calculateTeamVelocity();

  // Calculate collaboration stats
  const calculateCollaboration = () => {
    const multiAssigneeCards = cards.filter(c => c.assignees && c.assignees.length > 1);
    const totalAssignees = cards.reduce((sum, card) => sum + (card.assignees?.length || 0), 0);
    const cardsWithAssignees = cards.filter(c => c.assignees && c.assignees.length > 0).length;
    
    // Find most collaborative pair
    const pairMap = new Map<string, number>();
    multiAssigneeCards.forEach(card => {
      if (card.assignees && card.assignees.length >= 2) {
        for (let i = 0; i < card.assignees.length - 1; i++) {
          for (let j = i + 1; j < card.assignees.length; j++) {
            const pair = [card.assignees[i], card.assignees[j]].sort().join(' & ');
            pairMap.set(pair, (pairMap.get(pair) || 0) + 1);
          }
        }
      }
    });
    
    const mostCollaborativePair = Array.from(pairMap.entries())
      .sort((a, b) => b[1] - a[1])[0];
    
    return {
      multiAssignee: multiAssigneeCards.length,
      avgTeamSize: cardsWithAssignees > 0 
        ? Math.round((totalAssignees / cardsWithAssignees) * 10) / 10 
        : 0,
      mostCollaborative: mostCollaborativePair?.[0],
      mostCollaborativeCount: mostCollaborativePair?.[1] || 0
    };
  };
  const collaborationStats = calculateCollaboration();

  // Calculate stale cards
  const calculateStaleCards = () => {
    const fourteenDaysAgo = subDays(new Date(), 14);
    return cards.filter(card => {
      if (card.completed) return false;
      const lastUpdate = new Date(card.updatedAt || card.createdAt);
      return lastUpdate < fourteenDaysAgo;
    }).sort((a, b) => {
      const aDate = new Date(a.updatedAt || a.createdAt);
      const bDate = new Date(b.updatedAt || b.createdAt);
      return aDate.getTime() - bDate.getTime();
    });
  };
  const staleCards = calculateStaleCards();

  // Calculate bottlenecks
  const calculateBottlenecks = () => {
    const bucketStats = new Map<string, { bucket: any; stuckCards: number; avgAge: number }>();
    
    buckets.forEach(bucket => {
      const bucketCards = cards.filter(c => c.bucketId === bucket.id && !c.completed);
      if (bucketCards.length === 0) return;
      
      const avgAge = bucketCards.reduce((sum, card) => {
        const age = (new Date().getTime() - new Date(card.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        return sum + age;
      }, 0) / bucketCards.length;
      
      const stuckCards = bucketCards.filter(card => {
        const age = (new Date().getTime() - new Date(card.updatedAt || card.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        return age > 7; // Cards not updated for 7+ days
      }).length;
      
      if (avgAge > 10 || stuckCards > 3) {
        bucketStats.set(bucket.id, { bucket, stuckCards, avgAge });
      }
    });
    
    return Array.from(bucketStats.values())
      .map(({ bucket, stuckCards }) => ({ title: bucket.title, stuckCards }))
      .sort((a, b) => b.stuckCards - a.stuckCards);
  };
  const bottlenecks = calculateBottlenecks();

  // Calculate risk indicators
  const calculateRiskIndicators = () => {
    const velocity = velocityMetrics.week / 7; // Daily velocity
    const cardsWithDueDates = cards.filter(c => !c.completed && c.dueDate);
    
    const atRisk = cardsWithDueDates.filter(card => {
      if (!card.dueDate) return false;
      const dueDate = new Date(card.dueDate);
      const today = new Date();
      const daysRemaining = (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      
      // If velocity is too low to complete by due date
      return daysRemaining > 0 && daysRemaining < 7 && velocity < 1;
    }).length;
    
    return { atRisk };
  };
  const riskIndicators = calculateRiskIndicators();

  // Calculate predictions
  const calculatePredictions = () => {
    const activeCount = activeCards;
    const dailyVelocity = throughput.daily || 0.5;
    
    const daysToComplete = Math.ceil(activeCount / dailyVelocity);
    const estimatedCompletion = format(addDays(new Date(), daysToComplete), 'MMM d, yyyy');
    
    // Tasks per day needed to complete in 30 days
    const tasksPerDay = Math.round((activeCount / 30) * 10) / 10;
    
    return { estimatedCompletion, tasksPerDay, daysToComplete };
  };
  const predictions = calculatePredictions();

  // Calculate age distribution
  const calculateAgeDistribution = () => {
    const now = new Date();
    const groups = [
      { label: '< 3 days', max: 3, count: 0 },
      { label: '3-7 days', max: 7, count: 0 },
      { label: '1-2 weeks', max: 14, count: 0 },
      { label: '2-4 weeks', max: 28, count: 0 },
      { label: '> 4 weeks', max: Infinity, count: 0 }
    ];
    
    cards.filter(c => !c.completed).forEach(card => {
      const age = (now.getTime() - new Date(card.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const group = groups.find(g => age <= g.max);
      if (group) group.count++;
    });
    
    return groups;
  };
  const ageDistribution = calculateAgeDistribution();

  // Generate recommendations
  const generateRecommendations = () => {
    const recs = [];
    
    if (staleCards.length > 5) {
      recs.push({
        priority: 'high',
        title: 'Review stale cards',
        description: `${staleCards.length} cards haven't been updated in 2+ weeks`
      });
    }
    
    if (overdueTasks > 0) {
      recs.push({
        priority: 'high',
        title: 'Address overdue tasks',
        description: `${overdueTasks} tasks are past their due date`
      });
    }
    
    if (wipWarnings.length > 0) {
      recs.push({
        priority: 'medium',
        title: 'Reduce WIP in overloaded lists',
        description: `${wipWarnings.length} lists have too many active tasks`
      });
    }
    
    if (velocityMetrics.trend < -20) {
      recs.push({
        priority: 'medium',
        title: 'Velocity declining',
        description: 'Task completion rate down by ' + Math.abs(velocityMetrics.trend) + '% this week'
      });
    }
    
    if (checklistProgress < 50 && cardsWithChecklists.length > 5) {
      recs.push({
        priority: 'low',
        title: 'Focus on checklist completion',
        description: `Only ${checklistProgress}% of checklist items are complete`
      });
    }
    
    return recs.slice(0, 4); // Top 4 recommendations
  };
  const recommendations = generateRecommendations();

  // Calculate personal stats (when assignee filter is selected)
  const calculatePersonalStats = () => {
    if (assigneeFilter === 'all') {
      return {
        activeTasks: 0,
        highPriority: 0,
        completionRate: 0,
        vsTeamAvg: 0,
        weeklyVelocity: 0,
        dueSoon: 0
      };
    }

    const myCards = cards.filter(c => c.assignees?.includes(assigneeFilter));
    const myActiveCards = myCards.filter(c => !c.completed);
    const myCompletedCards = myCards.filter(c => c.completed);
    
    const completionRate = myCards.length > 0 
      ? Math.round((myCompletedCards.length / myCards.length) * 100)
      : 0;
    
    // Team average completion rate
    const teamAvgCompletion = cards.length > 0
      ? Math.round((cards.filter(c => c.completed).length / cards.length) * 100)
      : 0;
    
    // Weekly velocity
    const weekAgo = subDays(new Date(), 7);
    const weeklyCompleted = myCards.filter(c => 
      c.completed && c.updatedAt && new Date(c.updatedAt) >= weekAgo
    ).length;
    
    // Due soon
    const nextWeek = addDays(new Date(), 7);
    const dueSoon = myActiveCards.filter(c => 
      c.dueDate && new Date(c.dueDate) <= nextWeek
    ).length;
    
    return {
      activeTasks: myActiveCards.length,
      highPriority: myActiveCards.filter(c => c.priority === 'high').length,
      completionRate,
      vsTeamAvg: completionRate - teamAvgCompletion,
      weeklyVelocity: weeklyCompleted,
      dueSoon
    };
  };
  const myStats = calculatePersonalStats();

  // Get focus tasks for current user
  const getMyFocusTasks = () => {
    if (assigneeFilter === 'all') return [];
    
    return cards
      .filter(c => !c.completed && c.assignees?.includes(assigneeFilter))
      .sort((a, b) => {
        // Priority: high priority first
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (b.priority === 'high' && a.priority !== 'high') return 1;
        
        // Then by due date
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        
        // Then by creation date
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 5); // Top 5 focus tasks
  };
  const myFocusTasks = getMyFocusTasks();

  // Calculate personal performance trend
  const calculateMyPerformanceTrend = () => {
    if (assigneeFilter === 'all') return [];
    
    const weeks = 4; // Last 4 weeks
    const data = [];
    
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(new Date(), i * 7));
      const weekEnd = endOfDay(addDays(weekStart, 6));
      
      const completed = cards.filter(c => {
        if (!c.completed || !c.updatedAt || !c.assignees?.includes(assigneeFilter)) return false;
        const date = new Date(c.updatedAt);
        return date >= weekStart && date <= weekEnd;
      }).length;
      
      data.push({
        week: `Week ${weeks - i}`,
        completed,
        target: Math.round(dashboardPreferences.personalTargets.weeklyTasks / 4) // Weekly target divided by 4 weeks
      });
    }
    
    return data;
  };
  const myPerformanceTrend = calculateMyPerformanceTrend();

  // Export dashboard data
  const exportDashboardData = () => {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        board: selectedBoardId === 'all' ? 'All Boards' : boards.find(b => b.id === selectedBoardId)?.title,
        filters: { dateRange, quickFilter, assigneeFilter }
      },
      summary: {
        totalTasks: totalCards,
        completedTasks: completedCards,
        activeTasks: activeCards,
        completionRate: completionRate + '%',
        overdueTasks,
        dueSoon: dueTodayTasks + dueThisWeekTasks
      },
      velocity: {
        thisWeek: velocityMetrics.week,
        lastWeek: velocityMetrics.lastWeek,
        trend: velocityMetrics.trend + '%',
        dailyAverage: throughput.daily,
        cycleTime: avgCycleTime + ' days'
      },
      insights: {
        staleCards: staleCards.length,
        bottlenecks: bottlenecks.length,
        atRisk: riskIndicators.atRisk,
        wipCount,
        checklistProgress: checklistProgress + '%'
      },
      teamPerformance: workloadData.map(member => ({
        name: member.name,
        activeTasks: member.active,
        completedTasks: member.completed,
        utilization: Math.round((member.active / member.capacity) * 100) + '%'
      })),
      recommendations: recommendations.map(r => `${r.title}: ${r.description}`)
    };

    // Create and download JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `dashboard-export-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Show skeleton while loading
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Empty state when no data
  if (boards.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No boards yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first board to start tracking tasks and viewing analytics
          </p>
          <Button onClick={() => router.push('/boards')}>
            Go to Boards
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <DashboardSettings />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportDashboardData()}
                >
                  Export Data
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download dashboard data as JSON</p>
              </TooltipContent>
            </Tooltip>
            <p className="text-sm text-muted-foreground">
              Last updated: {format(new Date(), 'PPp')}
            </p>
          </div>
        </div>
        
        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Board Selector */}
          <Select value={selectedBoardId || 'all'} onValueChange={setSelectedBoardId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a board" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Boards</SelectItem>
              {boards.map(board => (
                <SelectItem key={board.id} value={board.id}>
                  {board.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="h-6 w-px bg-border" /> {/* Separator */}
          
          {/* Date Range Filter */}
          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Quick Filters */}
          <Select value={quickFilter} onValueChange={(value: any) => setQuickFilter(value)}>
            <SelectTrigger className="w-[160px]">
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
          
          {/* Assignee Filter */}
          {allAssignees.length > 0 && (
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All assignees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assignees</SelectItem>
                {allAssignees.map(assignee => (
                  <SelectItem key={assignee} value={assignee}>
                    {assignee}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {/* Active Filters Summary */}
          {(dateRange !== 'week' || quickFilter !== 'all' || assigneeFilter !== 'all' || (selectedBoardId && selectedBoardId !== 'all')) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDateRange('week');
                setQuickFilter('all');
                setAssigneeFilter('all');
                setSelectedBoardId('all');
              }}
              className="text-xs ml-auto"
            >
              Reset to defaults
            </Button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold">{totalCards}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {activeCards} active, {completedCards} completed
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-muted-foreground/40" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold">{completionRate}%</p>
              <Progress value={completionRate} className="mt-2 h-2" />
            </div>
            <Target className="h-8 w-8 text-muted-foreground/40" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Due Soon</p>
              <p className="text-2xl font-bold">{dueTodayTasks + dueThisWeekTasks}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {dueTodayTasks} today, {dueThisWeekTasks} this week
              </p>
            </div>
            <Calendar className="h-8 w-8 text-muted-foreground/40" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className={cn("text-2xl font-bold", overdueTasks > 0 && "text-red-600")}>
                {overdueTasks}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Requires attention
              </p>
            </div>
            <AlertCircle className={cn("h-8 w-8", overdueTasks > 0 ? "text-red-600/40" : "text-muted-foreground/40")} />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Priority Distribution */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Priority Distribution</h3>
          {priorityData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={(data) => {
                      // Filter to show only cards with this priority
                      setQuickFilter(data.name.toLowerCase() === 'none' ? 'all' : (`${data.name.toLowerCase()}-priority` as any));
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        return (
                          <div className="bg-popover/95 backdrop-blur-sm rounded-md border shadow-md p-2">
                            <p className="text-sm font-medium">{payload[0].name}</p>
                            <p className="text-xs text-muted-foreground">
                              {payload[0].value} tasks • Click to filter
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
              <div className="rounded-full bg-muted p-3 mb-3">
                <BarChart3 className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">No active tasks</p>
              <p className="text-xs mt-1">Complete some tasks to see priority distribution</p>
            </div>
          )}
        </Card>

        {/* Tasks by Board */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Tasks by Board</h3>
          {boardData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={boardData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-popover/95 backdrop-blur-sm rounded-md border shadow-md p-2">
                            <p className="text-sm font-medium">{data.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Active: {data.active} • Completed: {data.completed}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Click to view board
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="active" 
                    stackId="a" 
                    fill="#3b82f6" 
                    name="Active"
                    onClick={(data) => {
                      const board = boards.find(b => b.title === data.name);
                      if (board) {
                        router.push(`/boards/${board.id}`);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  <Bar 
                    dataKey="completed" 
                    stackId="a" 
                    fill="#f59e0b" 
                    name="Completed"
                    onClick={(data) => {
                      const board = boards.find(b => b.title === data.name);
                      if (board) {
                        router.push(`/boards/${board.id}`);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Target className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">No task data</p>
              <p className="text-xs mt-1">Create tasks to see board distribution</p>
            </div>
          )}
        </Card>

        {/* Activity Trend */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Completed Tasks (7 Days)</h3>
          <InteractiveLineChart
            data={last7Days}
            lines={[
              { dataKey: 'completed', color: '#f59e0b', name: 'Completed Tasks' }
            ]}
            xDataKey="date"
            height={250}
            showBrush={false}
            showZoomControls={false}
            onDataPointClick={(data) => {
              console.log('View completed tasks for:', data);
            }}
          />
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Checklist Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Overall Progress</span>
                <span className="text-sm font-medium">{checklistProgress}%</span>
              </div>
              <Progress value={checklistProgress} className="h-2" />
            </div>
            <div className="text-sm text-muted-foreground">
              {completedChecklistItems} of {totalChecklistItems} items completed across {cardsWithChecklists.length} cards
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Active Boards</p>
              <p className="text-xl font-semibold">{boards.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Lists</p>
              <p className="text-xl font-semibold">{filteredBuckets.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Tasks/Board</p>
              <p className="text-xl font-semibold">
                {boards.length > 0 ? Math.round(totalCards / boards.length) : 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cards w/ Checklists</p>
              <p className="text-xl font-semibold">{cardsWithChecklists.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Time-based Insights */}
      {dashboardPreferences.dashboardLayout.showTimeInsights && (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Time-based Insights</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Velocity Metric */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Velocity</h3>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-2xl font-bold">{velocityMetrics.week}</p>
                <p className="text-xs text-muted-foreground">Tasks completed this week</p>
              </div>
              <div className="text-xs">
                <span className={cn(
                  "font-medium",
                  velocityMetrics.trend > 0 ? "text-green-600" : velocityMetrics.trend < 0 ? "text-red-600" : "text-muted-foreground"
                )}>
                  {velocityMetrics.trend > 0 ? '+' : ''}{velocityMetrics.trend}%
                </span>
                <span className="text-muted-foreground ml-1">vs last week</span>
              </div>
            </div>
          </Card>

          {/* Cycle Time */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Avg Cycle Time</h3>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-2xl font-bold">{avgCycleTime}</p>
                <p className="text-xs text-muted-foreground">days to complete</p>
              </div>
              <div className="text-xs text-muted-foreground">
                Based on last 30 days
              </div>
            </div>
          </Card>

          {/* WIP Limits */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Work in Progress</h3>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-2xl font-bold">{wipCount}</p>
                <p className="text-xs text-muted-foreground">active tasks</p>
              </div>
              {wipWarnings.length > 0 && (
                <div className="text-xs text-orange-600 font-medium">
                  {wipWarnings.length} lists over capacity
                </div>
              )}
            </div>
          </Card>

          {/* Throughput */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Throughput</h3>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-2xl font-bold">{throughput.daily}</p>
                <p className="text-xs text-muted-foreground">tasks/day average</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {throughput.weekly} per week
              </div>
            </div>
          </Card>
        </div>

        {/* Burndown Chart */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Burndown Chart (30 Days)</h3>
          <InteractiveLineChart
            data={burndownData}
            lines={[
              { dataKey: 'remaining', color: '#3b82f6', name: 'Remaining Tasks' },
              { dataKey: 'ideal', color: '#6b7280', name: 'Ideal Progress', strokeDasharray: '5 5' }
            ]}
            xDataKey="date"
            height={300}
            onDataPointClick={(data) => {
              console.log('Clicked burndown data:', data);
            }}
          />
        </Card>
      </div>
      )}

      {/* Team Performance */}
      {allAssignees.length > 0 && dashboardPreferences.dashboardLayout.showTeamPerformance && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Team Performance</h2>
          
          {/* Workload Distribution */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Workload Distribution</h3>
              <div className="space-y-3">
                {workloadData.map((member) => (
                  <div key={member.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{member.name}</span>
                      <span className="text-muted-foreground">
                        {member.active} active, {member.completed} completed
                      </span>
                    </div>
                    <Progress 
                      value={(member.active / member.capacity) * 100} 
                      className="h-2"
                    />
                    {member.active > member.capacity && (
                      <p className="text-xs text-orange-600 font-medium">
                        Over capacity by {member.active - member.capacity} tasks
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Team Velocity</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamVelocityData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="thisWeek" fill="#f59e0b" name="This Week" />
                    <Bar dataKey="lastWeek" fill="#6b7280" name="Last Week" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Collaboration Patterns */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Collaboration Patterns</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Collaborative Tasks</p>
                <p className="text-2xl font-bold">{collaborationStats.multiAssignee}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((collaborationStats.multiAssignee / totalCards) * 100)}% of all tasks
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Team Size</p>
                <p className="text-2xl font-bold">{collaborationStats.avgTeamSize}</p>
                <p className="text-xs text-muted-foreground mt-1">people per task</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Most Collaborative</p>
                <p className="text-lg font-bold">{collaborationStats.mostCollaborative || 'N/A'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {collaborationStats.mostCollaborativeCount} shared tasks
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Personal Dashboard */}
      {assigneeFilter !== 'all' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">My Personal Dashboard</h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* My Active Tasks */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">My Active Tasks</h3>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{myStats.activeTasks}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {myStats.highPriority} high priority
              </p>
            </Card>

            {/* My Completion Rate */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">My Completion Rate</h3>
                <Target className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{myStats.completionRate}%</p>
              <div className="text-xs text-muted-foreground mt-1">
                <span className={cn(
                  myStats.vsTeamAvg > 0 ? "text-green-600" : "text-red-600"
                )}>
                  {myStats.vsTeamAvg > 0 ? '+' : ''}{myStats.vsTeamAvg}%
                </span>
                <span className="text-muted-foreground ml-1">vs team avg</span>
              </div>
            </Card>

            {/* My Velocity */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">My Velocity</h3>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{myStats.weeklyVelocity}</p>
              <p className="text-xs text-muted-foreground mt-1">
                tasks completed this week
              </p>
            </Card>

            {/* My Due Soon */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Due Soon</h3>
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-600">{myStats.dueSoon}</p>
              <p className="text-xs text-muted-foreground mt-1">
                in next 7 days
              </p>
            </Card>
          </div>

          {/* My Focus Area */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">My Focus Tasks</h3>
            <div className="space-y-3">
              {myFocusTasks.length > 0 ? (
                myFocusTasks.map((card) => (
                  <div 
                    key={card.id} 
                    className="flex items-start justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => {
                      const bucket = buckets.find(b => b.id === card.bucketId);
                      if (bucket) {
                        router.push(`/boards/${bucket.boardId}`);
                      }
                    }}
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">{card.title}</h4>
                      {card.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{card.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs">
                        {card.priority && (
                          <Badge 
                            variant={
                              card.priority === 'high' ? 'destructive' :
                              card.priority === 'medium' ? 'default' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {card.priority}
                          </Badge>
                        )}
                        {card.dueDate && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(card.dueDate), 'MMM d')}
                          </div>
                        )}
                        {card.checklist && card.checklist.length > 0 && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <CheckSquare className="h-3 w-3" />
                            {card.checklist.filter(item => item.completed).length}/{card.checklist.length}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {buckets.find(b => b.id === card.bucketId)?.title}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tasks assigned to you
                </p>
              )}
            </div>
          </Card>

          {/* Personal Performance Trend */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">My Performance Trend (30 Days)</h3>
            <InteractiveLineChart
              data={myPerformanceTrend}
              lines={[
                { dataKey: 'completed', color: '#f59e0b', name: 'Tasks Completed' },
                { dataKey: 'target', color: '#6b7280', name: 'Target', strokeDasharray: '5 5' }
              ]}
              xDataKey="week"
              height={250}
              showBrush={false}
              onDataPointClick={(data) => {
                console.log('Clicked performance data:', data);
              }}
            />
          </Card>
        </div>
      )}

      {/* Actionable Insights */}
      {dashboardPreferences.dashboardLayout.showActionableInsights && (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Actionable Insights</h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Stale Cards */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Stale Cards</h3>
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-orange-600">{staleCards.length}</p>
              <p className="text-xs text-muted-foreground">
                Not updated for 14+ days
              </p>
              {staleCards.length > 0 && (
                <div className="text-xs space-y-1 mt-2">
                  {staleCards.slice(0, 3).map((card, i) => (
                    <Popover key={i}>
                      <PopoverTrigger asChild>
                        <p className="truncate cursor-pointer hover:text-foreground transition-colors" title={card.title}>
                          • {card.title}
                        </p>
                      </PopoverTrigger>
                      <PopoverContent className="w-80" side="left">
                        <div className="space-y-2">
                          <h4 className="font-medium">{card.title}</h4>
                          {card.description && (
                            <p className="text-sm text-muted-foreground">{card.description}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Last updated:</span>
                            <span>{format(new Date(card.updatedAt || card.createdAt), 'MMM d, yyyy')}</span>
                          </div>
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => {
                              const bucket = buckets.find(b => b.id === card.bucketId);
                              if (bucket) {
                                router.push(`/boards/${bucket.boardId}`);
                              }
                            }}
                          >
                            Go to Card
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  ))}
                  {staleCards.length > 3 && (
                    <p className="text-muted-foreground">
                      +{staleCards.length - 3} more
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Bottlenecks */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Bottlenecks</h3>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-red-600">{bottlenecks.length}</p>
              <p className="text-xs text-muted-foreground">
                Lists with slow throughput
              </p>
              {bottlenecks.length > 0 && (
                <div className="text-xs space-y-1 mt-2">
                  {bottlenecks.slice(0, 3).map((bucket, i) => (
                    <p key={i} className="truncate">
                      • {bucket.title} ({bucket.stuckCards} stuck)
                    </p>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* At Risk */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">At Risk</h3>
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-yellow-600">{riskIndicators.atRisk}</p>
              <p className="text-xs text-muted-foreground">
                Likely to miss deadline
              </p>
              <div className="text-xs mt-2">
                <p>Based on current velocity</p>
              </div>
            </div>
          </Card>

          {/* Due Date Predictions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Completion Forecast</h3>
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-bold">{predictions.estimatedCompletion}</p>
              <p className="text-xs text-muted-foreground">
                For all active tasks
              </p>
              <div className="text-xs mt-2">
                <p>{predictions.tasksPerDay} tasks/day needed</p>
                <p className="text-muted-foreground">Target: {dashboardPreferences.personalTargets.dailyTasks}/day</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Insights */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Task Age Distribution</h3>
            <div className="space-y-2">
              {ageDistribution.map((group) => (
                <div key={group.label} className="flex items-center justify-between">
                  <span className="text-sm">{group.label}</span>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(group.count / activeCards) * 100} 
                      className="w-24 h-2"
                    />
                    <span className="text-sm font-medium w-10 text-right">
                      {group.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Recommendations</h3>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex gap-2">
                  <div className={cn(
                    "mt-1 h-2 w-2 rounded-full flex-shrink-0",
                    rec.priority === 'high' ? 'bg-red-500' :
                    rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  )} />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{rec.title}</p>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      )}
    </div>
    </TooltipProvider>
  );
}