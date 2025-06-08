'use client';

import { Bucket as BucketType, Card as CardType, Label, ChecklistItem } from '@/types';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MoreHorizontal, Plus, ChevronDown, ChevronRight, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useBoardStore } from '@/lib/store/boardStore';
import { CardItemMemo } from './CardItemMemo';
import { useDroppable } from '@dnd-kit/core';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreateCardDialog } from './CreateCardDialog';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface BucketProps {
  bucket: BucketType;
  cards: CardType[];
  activeCardId: string | null;
}

export function Bucket({ bucket, cards, activeCardId }: BucketProps) {
  const { createCard, deleteBucket, updateCard } = useBoardStore();
  const [showCreateCardDialog, setShowCreateCardDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `bucket-${bucket.id}` });
  
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `bucket-${bucket.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAddCard = async (data: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
    labels?: Label[];
    assignees?: string[];
    checklist?: ChecklistItem[];
  }) => {
    const cardId = await createCard(bucket.id, data.title);
    if (cardId && (data.description || data.priority || data.dueDate || data.labels || data.assignees || data.checklist)) {
      await updateCard(cardId, {
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        labels: data.labels,
        assignees: data.assignees,
        checklist: data.checklist,
      });
    }
  };

  const handleDeleteBucket = async () => {
    await deleteBucket(bucket.id);
  };

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCardTitle.trim()) {
      await createCard(bucket.id, newCardTitle.trim());
      setNewCardTitle('');
      // Keep the form open for rapid card creation
    }
  };

  const handleQuickAddKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuickAddSubmit(e as any);
    } else if (e.key === 'Escape') {
      setIsAddingCard(false);
      setNewCardTitle('');
    }
  };

  // Separate active and completed cards
  const sortedCards = cards.sort((a, b) => a.position - b.position);
  const activeCards = sortedCards.filter(card => !card.completed);
  const completedCards = sortedCards.filter(card => card.completed);

  return (
    <div
      ref={(node) => {
        setSortableRef(node);
        setDroppableRef(node);
      }}
      style={style}
      className="w-80 flex-shrink-0 h-full"
    >
      <Card className="group h-full flex flex-col bg-muted/30 border-border/40 py-0 gap-0">
        <div className="px-3 py-2.5 flex items-center justify-between">
          <h3 
            className="text-sm font-medium text-foreground cursor-move"
            {...attributes}
            {...listeners}
          >
            {bucket.title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{activeCards.length}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 -mr-1">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
                  Delete bucket
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex-1 px-2 py-1 overflow-y-auto">
          {/* Active cards */}
          <SortableContext
            items={activeCards.map(c => `card-${c.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1.5">
              {activeCards.map((card) => {
                const isBeingDragged = card.id === activeCardId;
                
                return (
                  <div key={card.id}>
                    <CardItemMemo card={card} />
                  </div>
                );
              })}
            </div>
          </SortableContext>
          
          {/* Completed cards section */}
          {completedCards.length > 0 && (
            <div className="mt-3 pt-2 border-t border-border/30">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="w-full flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {showCompleted ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                Completed ({completedCards.length})
              </button>
              
              {showCompleted && (
                <div className="mt-1.5 space-y-1.5">
                  {completedCards.map((card) => (
                    <CardItemMemo key={card.id} card={card} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="px-2 pb-1.5">
          {isAddingCard ? (
            <form onSubmit={handleQuickAddSubmit} className="space-y-2">
              <Textarea
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={handleQuickAddKeyDown}
                placeholder="Enter a title for this card..."
                className="min-h-[60px] resize-none"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Button type="submit" size="sm" className="h-8">
                  Add card
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    setIsAddingCard(false);
                    setNewCardTitle('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </form>
          ) : (
            <button
              className="w-full justify-start flex items-center py-1.5 px-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 rounded opacity-0 group-hover:opacity-100"
              onClick={() => setIsAddingCard(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add a card
            </button>
          )}
        </div>
      </Card>
      
      <CreateCardDialog
        open={showCreateCardDialog}
        onOpenChange={setShowCreateCardDialog}
        onCreateCard={handleAddCard}
      />
      
      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteBucket}
        title="Delete List"
        description={`Are you sure you want to delete "${bucket.title}" and all ${cards.length} card${cards.length !== 1 ? 's' : ''}? This action cannot be undone.`}
      />
    </div>
  );
}