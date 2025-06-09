'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/db/schema';
import { usePreferencesStore } from '@/lib/store/preferencesStore';
import { Board, Card as CardType, Bucket } from '@/types';
import { startOfDay, isBefore, isToday, isAfter, addDays, isThisWeek } from 'date-fns';
import { getRelativeDateString } from '@/lib/utils/date';
import { TaskListItem } from './TaskListItem';
import { UnassignedTasksColumn } from './UnassignedTasksColumn';
import { Loader2, CalendarX, CalendarCheck, CalendarClock, Calendar, Inbox, User, Users, CheckSquare, AlertCircle, TrendingUp, Clock, Layers, Search, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// Use the active user from preferences store

type GroupByOption = 'date' | 'priority' | 'board';

export function MyTasksView() {
  const { activeUser, setActiveUser, users } = usePreferencesStore();
  const [allCards, setAllCards] = useState<CardType[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState<GroupByOption>('date');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [allAssignees, setAllAssignees] = useState<string[]>([]);
  const [recentlyCompletedCards, setRecentlyCompletedCards] = useState<CardType[]>([]);

  // Function to remove a card from local state
  const removeCardFromState = (cardId: string) => {
    setAllCards(prev => prev.filter(c => c.id !== cardId));
  };
  
  // Function to update a card in local state
  const updateCardInState = (cardId: string, updates: Partial<CardType>) => {
    setAllCards(prev => prev.map(c => c.id === cardId ? { ...c, ...updates } : c));
  };

  useEffect(() => {
    // Set the default user on first load
    if (activeUser === null && users.length > 0) {
      setActiveUser(users[0].id);
    }
  }, [activeUser, users, setActiveUser]);

  const loadData = async () => {
      setIsLoading(true);
      try {
        const [boardsData, bucketsData, cardsData] = await Promise.all([
          db.boards.toArray(),
          db.buckets.toArray(),
          db.cards.toArray(),
        ]);
        setBoards(boardsData);
        setBuckets(bucketsData);
        
        const activeCards = cardsData.filter(c => !c.completed)
        setAllCards(activeCards);
        
        // Get recently completed cards (completed in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const completedCards = cardsData
          .filter(c => c.completed && c.updatedAt && new Date(c.updatedAt) >= sevenDaysAgo)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 10); // Show max 10 recent completed
        
        setRecentlyCompletedCards(completedCards);

        // Get unique assignee IDs from cards
        const assigneeIds = new Set<string>();
        activeCards.forEach(card => card.assignees?.forEach(a => assigneeIds.add(a)));
        
        // Get all user IDs from the preferences store
        const userIds = users.map(u => u.id);
        
        // Combine and deduplicate
        const allUniqueAssignees = Array.from(new Set([...userIds, ...Array.from(assigneeIds)]));
        setAllAssignees(allUniqueAssignees);

      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    loadData();
  }, []);

  const tasks = useMemo(() => {
    let filteredCards = allCards.filter(card => {
        if (activeUser === 'unassigned') {
            return !card.assignees || card.assignees.length === 0;
        }
        return card.assignees?.includes(activeUser || '');
    });

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredCards = filteredCards.filter(card => 
        card.title.toLowerCase().includes(query) ||
        card.description?.toLowerCase().includes(query) ||
        card.labels?.some(label => label.name.toLowerCase().includes(query))
      );
    }

    return filteredCards.map(card => {
      const bucket = buckets.find(b => b.id === card.bucketId);
      const board = bucket ? boards.find(b => b.id === bucket.boardId) : undefined;
      return {
        ...card,
        board: { id: board?.id || '', title: board?.title || 'Unknown Board' },
        list: { title: bucket?.title || 'Unknown List' },
      };
    });
  }, [allCards, buckets, boards, activeUser, searchQuery]);

  const today = startOfDay(new Date());
  
  const overdueTasks = tasks.filter(t => t.dueDate && isBefore(new Date(t.dueDate), today));
  const dueTodayTasks = tasks.filter(t => t.dueDate && isToday(new Date(t.dueDate)));
  const upcomingTasks = tasks.filter(t => t.dueDate && isAfter(new Date(t.dueDate), today));
  const noDateTasks = tasks.filter(t => !t.dueDate);
  
  // Calculate stats
  const dueThisWeek = tasks.filter(t => t.dueDate && isThisWeek(new Date(t.dueDate)));
  const highPriorityTasks = tasks.filter(t => t.priority === 'high');
  const recentlyAdded = tasks.slice(-5).reverse(); // Last 5 tasks added
  
  // Group by priority
  const tasksByPriority = {
    high: tasks.filter(t => t.priority === 'high'),
    medium: tasks.filter(t => t.priority === 'medium'),
    low: tasks.filter(t => t.priority === 'low'),
    none: tasks.filter(t => !t.priority),
  };
  
  // Group by board
  const tasksByBoard = boards.reduce((acc, board) => {
    acc[board.id] = {
      board,
      tasks: tasks.filter(t => t.board.id === board.id),
    };
    return acc;
  }, {} as Record<string, { board: Board; tasks: typeof tasks }>);

  const handleTaskSelection = (taskId: string, selected: boolean) => {
    const newSelection = new Set(selectedTasks);
    if (selected) {
      newSelection.add(taskId);
    } else {
      newSelection.delete(taskId);
    }
    setSelectedTasks(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  const handleBulkComplete = async () => {
    try {
      const tasksToComplete = Array.from(selectedTasks);
      await Promise.all(
        tasksToComplete.map(taskId =>
          db.cards.update(taskId, { completed: true, updatedAt: new Date() })
        )
      );
      // Update local state instead of reloading
      setAllCards(prev => prev.filter(c => !tasksToComplete.includes(c.id)));
      setSelectedTasks(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to complete tasks:', error);
    }
  };

  const handleBulkDateChange = async (days: number) => {
    const newDate = addDays(new Date(), days);
    try {
      const tasksToUpdate = Array.from(selectedTasks);
      await Promise.all(
        tasksToUpdate.map(taskId =>
          db.cards.update(taskId, { dueDate: newDate, updatedAt: new Date() })
        )
      );
      // Update local state instead of reloading
      setAllCards(prev => prev.map(c => 
        tasksToUpdate.includes(c.id) ? { ...c, dueDate: newDate, updatedAt: new Date() } : c
      ));
      setSelectedTasks(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to update due dates:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const renderTaskList = (tasks: typeof overdueTasks, isOverdue = false, showSelection = false) => {
    // Limit no-date tasks to 10 with "show more"
    const isNoDateSection = !isOverdue && tasks.every(t => !t.dueDate);
    const displayTasks = isNoDateSection && tasks.length > 10 ? tasks.slice(0, 10) : tasks;
    const remainingCount = isNoDateSection ? tasks.length - 10 : 0;

    return (
      <div className="space-y-2">
        {displayTasks.map(task => (
          <TaskListItem 
            key={task.id} 
            task={task} 
            isOverdue={isOverdue}
            isSelected={selectedTasks.has(task.id)}
            onTaskUpdate={updateCardInState}
            onTaskDelete={removeCardFromState}
            onSelectionChange={showSelection ? (selected) => handleTaskSelection(task.id, selected) : undefined}
          />
        ))}
        {remainingCount > 0 && (
          <div className="text-center pt-2">
            <Button variant="outline" size="sm" onClick={() => {/* TODO: Implement show more */}}>
              Show {remainingCount} more tasks
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderEmptyState = (icon: React.ReactNode, text: string) => (
    <div className="flex flex-col items-center justify-center p-6 text-center bg-muted/30 rounded-lg border-2 border-dashed">
      {icon}
      <p className="text-sm text-muted-foreground mt-2">{text}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 max-w-full">
      {/* Main content - My Tasks */}
      <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <Select value={activeUser || ''} onValueChange={setActiveUser}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select user..." />
            </SelectTrigger>
            <SelectContent>
              {allAssignees.map(assigneeId => {
                const user = users.find(u => u.id === assigneeId);
                const displayName = user ? user.name : assigneeId;
                return (
                  <SelectItem key={assigneeId} value={assigneeId}>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-medium">{displayName.charAt(0).toUpperCase()}</span>
                      </div>
                      <span>{displayName}</span>
                    </div>
                  </SelectItem>
                );
              })}
              <SelectItem value="unassigned">
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Unassigned
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search and Group By */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <ToggleGroup type="single" value={groupBy} onValueChange={(value) => value && setGroupBy(value as GroupByOption)}>
            <ToggleGroupItem value="date" aria-label="Group by date">
              <Calendar className="h-4 w-4 mr-2" />
              Date
            </ToggleGroupItem>
            <ToggleGroupItem value="priority" aria-label="Group by priority">
              <AlertCircle className="h-4 w-4 mr-2" />
              Priority
            </ToggleGroupItem>
            <ToggleGroupItem value="board" aria-label="Group by board">
              <Layers className="h-4 w-4 mr-2" />
              Board
            </ToggleGroupItem>
          </ToggleGroup>
          {showBulkActions && (
            <div className="flex items-center gap-2 ml-auto">
              <Badge variant="secondary">{selectedTasks.size} selected</Badge>
              <Button size="sm" variant="outline" onClick={handleBulkComplete}>
                <CheckSquare className="h-4 w-4 mr-1" />
                Complete
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkDateChange(0)}>
                <Calendar className="h-4 w-4 mr-1" />
                Today
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkDateChange(7)}>
                <Calendar className="h-4 w-4 mr-1" />
                Next Week
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold">{tasks.length}</p>
            </div>
            <CheckSquare className="h-8 w-8 text-muted-foreground/20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-red-500">{overdueTasks.length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500/20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Due This Week</p>
              <p className="text-2xl font-bold text-blue-500">{dueThisWeek.length}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500/20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">High Priority</p>
              <p className="text-2xl font-bold text-orange-500">{highPriorityTasks.length}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500/20" />
          </div>
        </Card>
      </div>

      {/* Task Lists */}
      <div className="space-y-8">
        {groupBy === 'date' && (
          <>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                <CalendarX className="mr-2 h-5 w-5 text-red-500"/> 
                Overdue
              </h2>
              {overdueTasks.length > 0
                ? renderTaskList(overdueTasks, true, true)
                : renderEmptyState(<CalendarX className="h-8 w-8 text-muted-foreground/50"/>, "No overdue tasks. Great job!")}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                <CalendarCheck className="mr-2 h-5 w-5 text-blue-500"/>
                Due Today
              </h2>
              {dueTodayTasks.length > 0
                ? renderTaskList(dueTodayTasks, false, true)
                : renderEmptyState(<CalendarCheck className="h-8 w-8 text-muted-foreground/50"/>, "Nothing due today. Time for a coffee!")}
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                <CalendarClock className="mr-2 h-5 w-5 text-muted-foreground"/>
                Upcoming
              </h2>
              {upcomingTasks.length > 0
                ? renderTaskList(upcomingTasks, false, true)
                : renderEmptyState(<CalendarClock className="h-8 w-8 text-muted-foreground/50"/>, "No upcoming tasks on the horizon.")}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                <Inbox className="mr-2 h-5 w-5 text-muted-foreground"/>
                No Due Date
              </h2>
              {noDateTasks.length > 0
                ? renderTaskList(noDateTasks, false, true)
                : renderEmptyState(<Inbox className="h-8 w-8 text-muted-foreground/50"/>, "All tasks have a due date.")}
            </div>
          </>
        )}

        {groupBy === 'priority' && (
          <>
            {(['high', 'medium', 'low', 'none'] as const).map(priority => {
              const priorityTasks = tasksByPriority[priority];
              const priorityConfig = {
                high: { icon: AlertCircle, color: 'text-red-500', label: 'High Priority' },
                medium: { icon: Clock, color: 'text-yellow-500', label: 'Medium Priority' },
                low: { icon: TrendingUp, color: 'text-blue-500', label: 'Low Priority' },
                none: { icon: Inbox, color: 'text-muted-foreground', label: 'No Priority' },
              }[priority];

              return (
                <div key={priority}>
                  <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                    <priorityConfig.icon className={`mr-2 h-5 w-5 ${priorityConfig.color}`} />
                    {priorityConfig.label}
                  </h2>
                  {priorityTasks.length > 0
                    ? renderTaskList(priorityTasks, false, true)
                    : renderEmptyState(
                        <priorityConfig.icon className="h-8 w-8 text-muted-foreground/50" />,
                        `No ${priority === 'none' ? 'unprioritized' : priority + ' priority'} tasks.`
                      )}
                </div>
              );
            })}
          </>
        )}

        {groupBy === 'board' && (
          <>
            {Object.values(tasksByBoard)
              .filter(({ tasks }) => tasks.length > 0)
              .map(({ board, tasks }) => (
                <div key={board.id}>
                  <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                    <Layers className="mr-2 h-5 w-5 text-muted-foreground" />
                    {board.title}
                  </h2>
                  {renderTaskList(tasks, false, true)}
                </div>
              ))}
          </>
        )}
      </div>

      {/* Recently Completed Section */}
      {recentlyCompletedCards.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center">
            <CheckSquare className="mr-2 h-5 w-5 text-green-500" />
            Recently Completed
          </h2>
          <Card className="p-4">
            <div className="space-y-2">
              {recentlyCompletedCards
                .filter(card => {
                  // Apply user filter to completed cards too
                  if (activeUser === 'unassigned') {
                    return !card.assignees || card.assignees.length === 0;
                  }
                  return card.assignees?.includes(activeUser || '');
                })
                .map(card => {
                  const bucket = buckets.find(b => b.id === card.bucketId);
                  const board = bucket ? boards.find(b => b.id === bucket.boardId) : undefined;
                  const task = {
                    ...card,
                    board: { id: board?.id || '', title: board?.title || 'Unknown Board' },
                    list: { title: bucket?.title || 'Unknown List' },
                  };
                  
                  return (
                    <div key={task.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm line-through text-muted-foreground">
                          {task.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • {task.board.title} / {task.list.title}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {task.updatedAt && getRelativeDateString(new Date(task.updatedAt))}
                      </span>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>
      )}
      </div>

      {/* Right sidebar - Unassigned Tasks */}
      <div className="hidden lg:block">
        <div className="sticky top-6">
          <UnassignedTasksColumn 
            onTaskClaimed={() => {
              // Reload data when a task is claimed
              loadData();
            }}
          />
        </div>
      </div>
    </div>
  );
} 