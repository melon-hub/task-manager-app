'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, isToday, addDays } from 'date-fns';
import { Card as CardType } from '@/types';
import { Calendar, ChevronRight, Circle, MoreVertical } from 'lucide-react';
import { useBoardStore } from '@/lib/store/boardStore';
import { db } from '@/lib/db/schema';

interface TaskListItemProps {
  task: CardType & { board: { id: string; title: string; }; list: { title: string; }; };
  isOverdue?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  onTaskUpdate: (taskId: string, updates: Partial<CardType>) => void;
  onTaskDelete: (taskId: string) => void;
}

const priorityClasses = {
  high: 'border-l-red-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-blue-500',
};

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
};

export function TaskListItem({ task, isOverdue, isSelected = false, onSelectionChange, onTaskUpdate, onTaskDelete }: TaskListItemProps) {
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleNavigate = () => {
    router.push(`/boards/${task.board.id}?cardId=${task.id}`);
  };

  const handleComplete = async (checked: boolean) => {
    setIsCompleting(true);
    try {
      const updates = { completed: checked, updatedAt: new Date() };
      await db.cards.update(task.id, updates);
      // Update local state instead of reloading
      onTaskDelete(task.id);
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleQuickDateChange = async (days: number) => {
    try {
      let updates: Partial<CardType>;
      if (days === -1) {
        updates = { updatedAt: new Date() };
        await db.cards.where('id').equals(task.id).modify({ dueDate: undefined });
        // Manually set dueDate to undefined for local state update
        updates.dueDate = undefined;
      } else {
        const newDate = addDays(new Date(), days);
        updates = { dueDate: newDate, updatedAt: new Date() };
        await db.cards.update(task.id, updates);
      }
      setIsDatePickerOpen(false);
      // Update local state instead of reloading
      onTaskUpdate(task.id, updates);
    } catch (error) {
      console.error('Failed to update due date:', error);
    }
  };
  
  const dueDateFormatted = task.dueDate ? format(new Date(task.dueDate), 'MMM d') : '';
  const isDueToday = task.dueDate ? isToday(new Date(task.dueDate)) : false;

  return (
    <div
      className={cn(
        "group flex items-center bg-card hover:bg-muted/50 rounded-lg border border-l-4 transition-colors",
        task.priority ? priorityClasses[task.priority] : 'border-l-transparent',
        isSelected && "bg-muted/50 ring-2 ring-primary"
      )}
    >
      <div className="flex items-center flex-grow p-3">
        {onSelectionChange && (
          <Checkbox 
            id={`select-${task.id}`} 
            className="mr-3" 
            checked={isSelected}
            onCheckedChange={onSelectionChange}
            onPointerDown={(e) => e.stopPropagation()} 
          />
        )}
        <Checkbox 
          id={`task-${task.id}`} 
          className="mr-4" 
          checked={task.completed}
          disabled={isCompleting}
          onCheckedChange={handleComplete}
          onPointerDown={(e) => e.stopPropagation()} 
        />
        <div className="flex-grow cursor-pointer" onClick={handleNavigate}>
          <div className="flex items-center gap-2">
            {task.priority && (
              <Circle className={cn("h-2 w-2 fill-current", priorityColors[task.priority])} />
            )}
            <p className="font-medium text-card-foreground">{task.title}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <button 
              className="hover:underline"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); router.push(`/boards/${task.board.id}`); }}
            >
              {task.board.title}
            </button>
            <span>/</span>
            <span>{task.list.title}</span>
            {task.labels && task.labels.length > 0 && (
              <>
                <span>•</span>
                <span>{task.labels.length} label{task.labels.length > 1 ? 's' : ''}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {task.dueDate ? (
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-sm font-semibold",
                    isOverdue ? 'text-red-500 hover:text-red-600' : 
                    isDueToday ? 'text-blue-500 hover:text-blue-600' : 
                    'text-muted-foreground hover:text-foreground'
                  )}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  {dueDateFormatted}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="end">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleQuickDateChange(0)}
                  >
                    Today
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleQuickDateChange(1)}
                  >
                    Tomorrow
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleQuickDateChange(7)}
                  >
                    Next week
                  </Button>
                  <div className="border-t my-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-destructive"
                    onClick={() => handleQuickDateChange(-1)}
                  >
                    Remove date
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Add date
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="end">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleQuickDateChange(0)}
                  >
                    Today
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleQuickDateChange(1)}
                  >
                    Tomorrow
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleQuickDateChange(7)}
                  >
                    Next week
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
      <div 
        className="pr-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1" 
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8"
          onClick={handleNavigate}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 