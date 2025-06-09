'use client';

import { Card } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckSquare, Edit2, Trash2, Check } from 'lucide-react';
import { useBoardStore } from '@/lib/store/boardStore';
import { usePreferencesStore } from '@/lib/store/preferencesStore';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { EditCardDialog } from './EditCardDialog';
import { cn } from '@/lib/utils';
import { getRelativeDateString, getDueDateStatus } from '@/lib/utils/date';
import { CardContextMenu } from './CardContextMenu';

interface CardItemProps {
  card: Card;
}

export function CardItem({ card }: CardItemProps) {
  const { deleteCard, updateCard } = useBoardStore();
  const { users } = usePreferencesStore();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(card.title);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [showLabelTooltip, setShowLabelTooltip] = useState(false);
  const labelTriggerRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef,
  } = useSortable({
    id: `card-${card.id}`,
    animateLayoutChanges: () => true,
  });

  const priorityColors = {
    high: { bg: 'bg-red-50 dark:bg-red-950/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800', borderL: 'border-l-red-500' },
    medium: { bg: 'bg-yellow-50 dark:bg-yellow-950/20', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800', borderL: 'border-l-yellow-500' },
    low: { bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', borderL: 'border-l-blue-500' },
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.25, 0.1, 0.25, 1)',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : undefined,
  };

  const handleDelete = () => {
    deleteCard(card.id);
  };

  const handleStartEditingTitle = () => {
    setIsEditingTitle(true);
    setEditedTitle(card.title);
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim() && editedTitle !== card.title) {
      updateCard(card.id, { title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleCancelEdit = () => {
    setEditedTitle(card.title);
    setIsEditingTitle(false);
  };

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (showLabelTooltip && labelTriggerRef.current) {
      const rect = labelTriggerRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top - 8, // 8px above the trigger
        left: rect.left
      });
    }
  }, [showLabelTooltip]);

  // Handle keyboard shortcut for edit when hovering
  useEffect(() => {
    if (!isHovered) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e' && !e.metaKey && !e.ctrlKey) {
        // Don't trigger if typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
        }
        e.preventDefault();
        setShowEditDialog(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isHovered]);

  return (
    <>
      <CardContextMenu card={card}>
        <div
          ref={(node) => {
            setNodeRef(node);
            cardRef.current = node;
          }}
          style={style}
          className={cn(
            "bg-card text-card-foreground rounded-lg border shadow-sm",
            "p-2.5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ease-in-out group relative",
            "border-l-4",
            card.priority ? priorityColors[card.priority].borderL : 'border-l-transparent',
            card.completed && "opacity-60",
            isDragging && "border-dashed border-muted-foreground/50 bg-muted/20"
          )}
          {...attributes}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
        {/* Card content */}
        <div
          ref={setActivatorNodeRef}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          {/* Labels and action buttons */}
          {(card.labels && card.labels.length > 0) && (
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1 min-w-0 flex-1">
                {card.labels.slice(0, 2).map((label) => (
                  <span
                    key={label.id}
                    className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium text-white truncate max-w-[80px]"
                    style={{ backgroundColor: label.color }}
                  >
                    {label.name}
                  </span>
                ))}
                {card.labels.length > 2 && (
                  <div
                    ref={labelTriggerRef}
                    className="inline-flex"
                    onMouseEnter={() => setShowLabelTooltip(true)}
                    onMouseLeave={() => setShowLabelTooltip(false)}
                  >
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-xs font-medium bg-muted text-muted-foreground cursor-help">
                      +{card.labels.length - 2}
                    </span>
                  </div>
                )}
              </div>
              {/* Action buttons appear on hover */}
              <div className={cn("flex items-center gap-0.5 transition-opacity flex-shrink-0 -mr-1", isHovered ? "opacity-100" : "opacity-0")} onPointerDown={(e) => e.stopPropagation()}>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEditDialog(true);
                  }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Action buttons for cards without labels (they need a home) */}
          {(!card.labels || card.labels.length === 0) && (
            <div className="flex justify-end -mt-1 mb-1 min-h-[22px]">
              <div className={cn("flex items-center gap-0.5 transition-opacity -mr-1", isHovered ? "opacity-100" : "opacity-0")} onPointerDown={(e) => e.stopPropagation()}>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEditDialog(true);
                  }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Title */}
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveTitle();
                } else if (e.key === 'Escape') {
                  handleCancelEdit();
                }
              }}
              className={cn(
                "text-sm font-normal leading-normal w-full bg-transparent border-b border-primary outline-none",
                "px-0 py-0 mt-1"
              )}
            />
          ) : (
            <h4 
              className={cn(
                "text-sm font-normal leading-normal break-words cursor-text mt-1",
                card.completed && "line-through text-muted-foreground"
              )}
              onDoubleClick={handleStartEditingTitle}
            >
              {card.title}
            </h4>
          )}
          
          {card.description && (
            <p className="text-xs text-muted-foreground mt-1.5">{card.description}</p>
          )}
          
          {(card.dueDate || (card.checklist && card.checklist.length > 0) || card.assignees) && (
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground mt-1.5">
              <div className="flex items-center gap-3">
                {card.dueDate && (
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-medium",
                    {
                      'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400': getDueDateStatus(new Date(card.dueDate), card.completed) === 'overdue',
                      'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400': getDueDateStatus(new Date(card.dueDate), card.completed) === 'due-soon',
                      'bg-gray-50 dark:bg-gray-950/20 text-gray-600 dark:text-gray-400': getDueDateStatus(new Date(card.dueDate), card.completed) === 'normal',
                      'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 line-through': getDueDateStatus(new Date(card.dueDate), card.completed) === 'completed',
                    }
                  )}>
                    <Calendar className="h-3 w-3" />
                    {getRelativeDateString(new Date(card.dueDate))}
                  </div>
                )}
                {card.checklist && card.checklist.length > 0 && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-muted/50">
                    <CheckSquare className="h-3 w-3" />
                    {card.checklist.length <= 5 ? (
                      // Visual dots for small checklists
                      <div className="flex items-center gap-0.5">
                        {card.checklist.map((item, index) => {
                          const completedCount = card.checklist?.filter(item => item.completed).length || 0;
                          const isFilledIn = index < completedCount;
                          return (
                            <div
                              key={index}
                              className={cn(
                                "h-2 w-2 rounded-full transition-colors",
                                isFilledIn 
                                  ? "bg-green-500 dark:bg-green-600" 
                                  : "bg-muted-foreground/30 border border-muted-foreground/50"
                              )}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      // Compact progress indicator for larger checklists
                      <div className="flex items-center gap-1">
                        <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 dark:bg-green-600 transition-all"
                            style={{
                              width: `${(card.checklist.filter(item => item.completed).length / card.checklist.length) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <span className="text-xs font-medium">
                      {card.checklist.filter(item => item.completed).length}/{card.checklist.length}
                    </span>
                  </div>
                )}
              </div>
              {card.assignees && card.assignees.length > 0 && (
                <div className="flex -space-x-2">
                  {card.assignees.slice(0, 3).map((assigneeId, index) => {
                    const user = users.find(u => u.id === assigneeId);
                    const displayName = user ? user.name : 'Unknown';
                    return (
                      <div
                        key={index}
                        className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium border-2 border-background"
                        title={displayName}
                      >
                        <span className="text-foreground">{displayName.charAt(0).toUpperCase()}</span>
                      </div>
                    );
                  })}
                  {card.assignees.length > 3 && (
                    <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium border-2 border-background">
                      +{card.assignees.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </CardContextMenu>
      
      <EditCardDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        card={card}
        onUpdateCard={updateCard}
      />
      
      
      {/* Portal tooltip for labels */}
      {showLabelTooltip && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[100] animate-in fade-in-0 slide-in-from-bottom-1 duration-150"
          style={{ 
            top: `${tooltipPosition.top - 36}px`, 
            left: `${tooltipPosition.left}px` 
          }}
        >
          <div className="bg-popover/95 backdrop-blur-sm rounded-md border shadow-md p-1.5 flex items-center gap-1 whitespace-nowrap">
            {card.labels.slice(2).map((label) => (
              <span
                key={label.id}
                className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium text-white"
                style={{ backgroundColor: label.color }}
              >
                {label.name}
              </span>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}