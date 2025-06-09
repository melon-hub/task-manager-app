'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/db/schema';
import { usePreferencesStore } from '@/lib/store/preferencesStore';
import { useBoardStore } from '@/lib/store/boardStore';
import { Board, Card as CardType, Bucket, Label } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, UserPlus, Calendar, CheckSquare, AlertCircle, Layers, Tag, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRelativeDateString, getDueDateStatus } from '@/lib/utils/date';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label as UILabel } from '@/components/ui/label';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';

interface UnassignedTasksColumnProps {
  onTaskClaimed?: () => void;
}

export function UnassignedTasksColumn({ onTaskClaimed }: UnassignedTasksColumnProps) {
  const { activeUser } = usePreferencesStore();
  const { updateCard, labels: boardLabels } = useBoardStore();
  const [unassignedCards, setUnassignedCards] = useState<CardType[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoard, setSelectedBoard] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [dueDateFilter, setDueDateFilter] = useState<string>('all');

  useEffect(() => {
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
        
        // Filter for unassigned, incomplete cards
        const unassigned = cardsData.filter(c => 
          (!c.assignees || c.assignees.length === 0) && !c.completed
        );
        setUnassignedCards(unassigned);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredTasks = useMemo(() => {
    let filtered = unassignedCards;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(card => 
        card.title.toLowerCase().includes(query) ||
        card.description?.toLowerCase().includes(query)
      );
    }

    // Board filter
    if (selectedBoard !== 'all') {
      filtered = filtered.filter(card => {
        const bucket = buckets.find(b => b.id === card.bucketId);
        return bucket?.boardId === selectedBoard;
      });
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(card => card.priority === selectedPriority);
    }

    // Label filter
    if (selectedLabels.length > 0) {
      filtered = filtered.filter(card => 
        card.labels?.some(label => selectedLabels.includes(label.id))
      );
    }

    // Due date filter
    if (dueDateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(card => {
        if (!card.dueDate) return dueDateFilter === 'no-date';
        
        const dueDate = new Date(card.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        switch (dueDateFilter) {
          case 'overdue':
            return dueDate < today;
          case 'today':
            return dueDate.getTime() === today.getTime();
          case 'this-week':
            const weekEnd = new Date(today);
            weekEnd.setDate(weekEnd.getDate() + 7);
            return dueDate >= today && dueDate <= weekEnd;
          case 'no-date':
            return false; // Already handled above
          default:
            return true;
        }
      });
    }

    return filtered.map(card => {
      const bucket = buckets.find(b => b.id === card.bucketId);
      const board = bucket ? boards.find(b => b.id === bucket.boardId) : undefined;
      return {
        ...card,
        board: { id: board?.id || '', title: board?.title || 'Unknown Board' },
        list: { title: bucket?.title || 'Unknown List' },
      };
    });
  }, [unassignedCards, buckets, boards, searchQuery, selectedBoard, selectedPriority, selectedLabels, dueDateFilter]);

  const handleClaimTask = async (taskId: string) => {
    if (!activeUser) return;
    
    try {
      await updateCard(taskId, { 
        assignees: [activeUser]
      });
      
      // Remove from local state
      setUnassignedCards(prev => prev.filter(c => c.id !== taskId));
      
      if (onTaskClaimed) {
        onTaskClaimed();
      }
    } catch (error) {
      console.error('Failed to claim task:', error);
    }
  };

  const renderTaskItem = (task: typeof filteredTasks[0]) => {
    const hasLabels = task.labels && task.labels.length > 0;
    const hasDueDate = !!task.dueDate;
    const hasChecklist = task.checklist && task.checklist.length > 0;
    const dueDateStatus = hasDueDate ? getDueDateStatus(new Date(task.dueDate), false) : null;

    return (
      <ContextMenu key={task.id}>
        <ContextMenuTrigger>
          <div
            className={cn(
              "flex items-center gap-2 px-2 py-1 hover:bg-accent/50 rounded cursor-default transition-colors text-sm"
            )}
          >
            {/* Priority indicator dot */}
            {task.priority && (
              <div className={cn(
                "h-1.5 w-1.5 rounded-full flex-shrink-0",
                task.priority === 'high' && "bg-red-500",
                task.priority === 'medium' && "bg-yellow-500",
                task.priority === 'low' && "bg-blue-500"
              )} />
            )}
            
            {/* Title */}
            <span className="truncate flex-1 min-w-0">
              {task.title}
            </span>

            {/* Inline metadata */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Labels */}
              {hasLabels && (
                <div className="flex items-center gap-0.5">
                  {task.labels.slice(0, 1).map((label) => (
                    <div
                      key={label.id}
                      className="h-3 w-3 rounded-sm"
                      style={{ backgroundColor: label.color }}
                      title={label.name}
                    />
                  ))}
                  {task.labels.length > 1 && (
                    <span className="text-xs text-muted-foreground">
                      +{task.labels.length - 1}
                    </span>
                  )}
                </div>
              )}

              {/* Due date */}
              {hasDueDate && (
                <span className={cn(
                  "text-xs",
                  dueDateStatus === 'overdue' && "text-red-500",
                  dueDateStatus === 'due-soon' && "text-orange-500",
                  dueDateStatus === 'normal' && "text-muted-foreground"
                )}>
                  {getRelativeDateString(new Date(task.dueDate))}
                </span>
              )}

              {/* Checklist */}
              {hasChecklist && (
                <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <CheckSquare className="h-3 w-3" />
                  <span>{task.checklist.filter(item => item.completed).length}/{task.checklist.length}</span>
                </div>
              )}
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => handleClaimTask(task.id)}>
            <UserPlus className="h-3.5 w-3.5 mr-2" />
            Claim Task
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-card rounded-lg border p-4">
        <div className="text-muted-foreground text-sm">Loading unassigned tasks...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border">
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Unassigned Tasks
          </h2>
          <Badge variant="secondary" className="text-xs">{filteredTasks.length}</Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-7 text-xs"
          />
        </div>

        {/* Compact Filters */}
        <div className="flex items-center gap-1.5">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs flex items-center gap-1 px-2"
              >
                <Filter className="h-3 w-3" />
                Filters
                {(selectedBoard !== 'all' || selectedPriority !== 'all' || selectedLabels.length > 0 || dueDateFilter !== 'all') && (
                  <span className="ml-1 font-semibold">
                    {[
                      selectedBoard !== 'all' ? 1 : 0,
                      selectedPriority !== 'all' ? 1 : 0,
                      selectedLabels.length > 0 ? 1 : 0,
                      dueDateFilter !== 'all' ? 1 : 0
                    ].reduce((a, b) => a + b, 0)}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="start">
              <div className="space-y-3">
                <div className="space-y-1">
                  <UILabel className="text-xs text-muted-foreground">Board</UILabel>
                  <Select value={selectedBoard} onValueChange={setSelectedBoard}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="All boards" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All boards</SelectItem>
                      {boards.map(board => (
                        <SelectItem key={board.id} value={board.id}>
                          <div className="flex items-center gap-2">
                            <Layers className="h-3 w-3" />
                            {board.title}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <UILabel className="text-xs text-muted-foreground">Priority</UILabel>
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All priorities</SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          High
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-yellow-500" />
                          Medium
                        </div>
                      </SelectItem>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          Low
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <UILabel className="text-xs text-muted-foreground">Due Date</UILabel>
                  <Select value={dueDateFilter} onValueChange={setDueDateFilter}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="All due dates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All due dates</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="today">Due today</SelectItem>
                      <SelectItem value="this-week">Due this week</SelectItem>
                      <SelectItem value="no-date">No due date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <UILabel className="text-xs text-muted-foreground">Labels</UILabel>
                  <ScrollArea className="h-[120px] rounded-md border p-2">
                    <div className="space-y-1">
                      {boardLabels.map(label => (
                        <div key={label.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`filter-${label.id}`}
                            checked={selectedLabels.includes(label.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedLabels([...selectedLabels, label.id]);
                              } else {
                                setSelectedLabels(selectedLabels.filter(id => id !== label.id));
                              }
                            }}
                            className="h-3 w-3"
                          />
                          <UILabel
                            htmlFor={`filter-${label.id}`}
                            className="flex items-center gap-2 cursor-pointer text-sm"
                          >
                            <div
                              className="h-3 w-3 rounded-sm"
                              style={{ backgroundColor: label.color }}
                            />
                            {label.name}
                          </UILabel>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Clear filters button */}
                {(selectedBoard !== 'all' || selectedPriority !== 'all' || selectedLabels.length > 0 || dueDateFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-7 text-xs"
                    onClick={() => {
                      setSelectedBoard('all');
                      setSelectedPriority('all');
                      setSelectedLabels([]);
                      setDueDateFilter('all');
                    }}
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Quick filter badges */}
          {(selectedBoard !== 'all' || selectedPriority !== 'all' || dueDateFilter !== 'all') && (
            <div className="flex items-center gap-1 flex-wrap">
              {selectedBoard !== 'all' && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {boards.find(b => b.id === selectedBoard)?.title}
                  <button
                    onClick={() => setSelectedBoard('all')}
                    className="ml-0.5 hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedPriority !== 'all' && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs capitalize">
                  {selectedPriority}
                  <button
                    onClick={() => setSelectedPriority('all')}
                    className="ml-0.5 hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {dueDateFilter !== 'all' && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {dueDateFilter === 'no-date' ? 'No date' : dueDateFilter.replace('-', ' ')}
                  <button
                    onClick={() => setDueDateFilter('all')}
                    className="ml-0.5 hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Task List */}
      <ScrollArea className="flex-1">
        <div className="px-2 py-1">
          {filteredTasks.length > 0 ? (
            <>
              {filteredTasks.map((task, index) => (
                <div key={task.id}>
                  {renderTaskItem(task)}
                  {index < filteredTasks.length - 1 && (
                    <div className="h-px bg-border/50 mx-2" />
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Inbox className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs">No tasks found</p>
              {(selectedBoard !== 'all' || selectedPriority !== 'all' || selectedLabels.length > 0 || dueDateFilter !== 'all') && (
                <p className="text-xs mt-1">Try adjusting filters</p>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}