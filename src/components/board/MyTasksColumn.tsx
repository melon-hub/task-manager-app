'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/db/schema';
import { usePreferencesStore } from '@/lib/store/preferencesStore';
import { Board, Card as CardType, Bucket } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import { Search, X, Calendar, CheckSquare, AlertCircle, Layers, Clock, ChevronRight, UserX, Eye } from 'lucide-react';
import { getRelativeDateString, getDueDateStatus } from '@/lib/utils/date';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBoardStore } from '@/lib/store/boardStore';
import { useDroppable } from '@dnd-kit/core';
import { useRouter } from 'next/navigation';

interface MyTasksColumnProps {
  currentBoardId?: string;
  onClose?: () => void;
}

interface TaskWithContext extends CardType {
  boardName: string;
  boardId: string;
  bucketName: string;
}

interface DraggableTaskItemProps {
  task: TaskWithContext;
  onTaskUnassigned?: () => void;
}

function DraggableTaskItem({ task, onTaskUnassigned }: DraggableTaskItemProps) {
  const dueDateStatus = task.dueDate ? getDueDateStatus(new Date(task.dueDate), false) : null;
  const { updateCard } = useBoardStore();
  const { activeUser } = usePreferencesStore();
  const router = useRouter();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `my-task-${task.id}`,
    disabled: true, // Temporarily disable dragging until we implement reordering
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleUnassign = async () => {
    if (!activeUser || !task.assignees) return;
    
    const newAssignees = task.assignees.filter(a => a !== activeUser);
    await updateCard(task.id, { assignees: newAssignees });
    onTaskUnassigned?.();
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          className={cn(
            "flex items-center gap-2 px-2 py-1 hover:bg-accent/50 rounded cursor-default transition-colors text-sm",
            "border-l-2",
            task.priority === 'high' && "border-l-red-500",
            task.priority === 'medium' && "border-l-yellow-500",
            task.priority === 'low' && "border-l-blue-500",
            !task.priority && "border-l-transparent"
          )}
        >
          {/* Priority dot */}
          {task.priority && (
            <div className={cn(
              "h-1.5 w-1.5 rounded-full flex-shrink-0",
              task.priority === 'high' && "bg-red-500",
              task.priority === 'medium' && "bg-yellow-500",
              task.priority === 'low' && "bg-blue-500"
            )} />
          )}
          
          {/* Title and list */}
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">{task.title}</p>
            <p className="text-xs text-muted-foreground">
              {task.bucketName}
            </p>
          </div>
          
          {/* Compact metadata */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Due date - more compact */}
            {task.dueDate && (
              <span className={cn(
                "text-xs",
                dueDateStatus === 'overdue' && "text-red-500 font-medium",
                dueDateStatus === 'due-soon' && "text-orange-500",
                dueDateStatus === 'normal' && "text-muted-foreground"
              )}>
                {getRelativeDateString(new Date(task.dueDate))}
              </span>
            )}
            
            {/* Checklist - just icon with count */}
            {task.checklist && task.checklist.length > 0 && (
              <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <CheckSquare className="h-3 w-3" />
                <span>{task.checklist.filter(item => item.completed).length}/{task.checklist.length}</span>
              </div>
            )}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleUnassign}>
          <UserX className="h-3.5 w-3.5 mr-2" />
          Unassign from me
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => router.push(`/boards/${task.boardId}`)}>
          <Layers className="h-3.5 w-3.5 mr-2" />
          Go to board
        </ContextMenuItem>
        <ContextMenuItem onClick={() => {/* TODO: Implement view details */}}>
          <Eye className="h-3.5 w-3.5 mr-2" />
          View details
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function MyTasksColumn({ currentBoardId, onClose }: MyTasksColumnProps) {
  const { activeUser } = usePreferencesStore();
  const [tasks, setTasks] = useState<TaskWithContext[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBoards, setExpandedBoards] = useState<Set<string>>(new Set([currentBoardId].filter(Boolean)));
  
  // Make the entire column a drop zone
  const { setNodeRef, isOver } = useDroppable({
    id: 'my-tasks-drop-zone',
  });

  const loadTasks = async () => {
    if (!activeUser) return;
    
    setIsLoading(true);
    try {
      const [boardsData, bucketsData, cardsData] = await Promise.all([
        db.boards.toArray(),
        db.buckets.toArray(),
        db.cards.toArray(),
      ]);
      
      setBoards(boardsData);
      setBuckets(bucketsData);
      
      // Filter cards assigned to the active user
      const myCards = cardsData.filter(card => 
        card.assignees?.includes(activeUser) && !card.completed
      );
      
      // Enrich cards with board and bucket context
      const enrichedTasks: TaskWithContext[] = myCards.map(card => {
        const bucket = bucketsData.find(b => b.id === card.bucketId);
        const board = bucket ? boardsData.find(b => b.id === bucket.boardId) : null;
        
        return {
          ...card,
          boardName: board?.title || 'Unknown Board',
          boardId: board?.id || '',
          bucketName: bucket?.title || 'Unknown List',
        };
      });
      
      setTasks(enrichedTasks);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [activeUser]);

  // Refresh tasks periodically to catch changes from board
  useEffect(() => {
    const interval = setInterval(() => {
      loadTasks();
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [activeUser]);

  // Filter tasks based on search
  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks;
    
    const query = searchQuery.toLowerCase();
    return tasks.filter(task => 
      task.title.toLowerCase().includes(query) ||
      task.boardName.toLowerCase().includes(query) ||
      task.bucketName.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery]);

  // Group tasks by board
  const tasksByBoard = useMemo(() => {
    const grouped = filteredTasks.reduce((acc, task) => {
      if (!acc[task.boardId]) {
        acc[task.boardId] = {
          boardName: task.boardName,
          tasks: [],
          isCurrentBoard: task.boardId === currentBoardId,
        };
      }
      acc[task.boardId].tasks.push(task);
      return acc;
    }, {} as Record<string, { boardName: string; tasks: TaskWithContext[]; isCurrentBoard: boolean }>);
    
    // Sort so current board is first
    return Object.entries(grouped).sort(([idA, a], [idB, b]) => {
      if (a.isCurrentBoard) return -1;
      if (b.isCurrentBoard) return 1;
      return a.boardName.localeCompare(b.boardName);
    });
  }, [filteredTasks, currentBoardId]);

  const toggleBoardExpansion = (boardId: string) => {
    const newExpanded = new Set(expandedBoards);
    if (newExpanded.has(boardId)) {
      newExpanded.delete(boardId);
    } else {
      newExpanded.add(boardId);
    }
    setExpandedBoards(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="w-80 bg-background border-r h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "w-80 bg-background border-r h-full flex flex-col transition-colors",
        isOver && "bg-accent/50 border-primary"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">My Tasks</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        
        {/* Summary */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{tasks.length} total tasks</span>
          <span>{tasksByBoard.length} boards</span>
        </div>
      </div>
      
      {/* Task List */}
      <ScrollArea className="flex-1">
        {isOver && (
          <div className="mx-4 mt-2 p-3 border-2 border-dashed border-primary rounded-lg bg-primary/10">
            <p className="text-sm text-center text-primary font-medium">
              Drop to assign to me
            </p>
          </div>
        )}
        <div className="p-2">
          {tasksByBoard.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No tasks assigned to you</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasksByBoard.map(([boardId, { boardName, tasks, isCurrentBoard }]) => {
                const isExpanded = expandedBoards.has(boardId);
                const overdueTasks = tasks.filter(t => t.dueDate && getDueDateStatus(new Date(t.dueDate), false) === 'overdue');
                
                return (
                  <div key={boardId} className="space-y-1">
                    <button
                      onClick={() => toggleBoardExpansion(boardId)}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded hover:bg-accent/50 transition-colors",
                        isCurrentBoard && "bg-accent/30"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded && "rotate-90"
                        )} />
                        <Layers className="h-4 w-4" />
                        <span className="font-medium text-sm">{boardName}</span>
                        {isCurrentBoard && (
                          <Badge variant="secondary" className="text-xs">Current</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {overdueTasks.length > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {overdueTasks.length} overdue
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {tasks.length}
                        </Badge>
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="ml-4">
                        {tasks.map(task => (
                          <DraggableTaskItem 
                            key={task.id} 
                            task={task} 
                            onTaskUnassigned={loadTasks}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}