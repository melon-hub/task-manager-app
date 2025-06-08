'use client';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Card, Bucket, Label } from '@/types';
import { 
  Tag, 
  Flag, 
  ArrowRight, 
  Copy, 
  Trash2, 
  Edit2, 
  Check,
  Calendar,
  Users,
  CheckSquare
} from 'lucide-react';
import { useBoardStore } from '@/lib/store/boardStore';
import { useState } from 'react';
import { EditCardDialog } from './EditCardDialog';

interface CardContextMenuProps {
  card: Card;
  children: React.ReactNode;
}

export function CardContextMenu({ card, children }: CardContextMenuProps) {
  const { buckets, labels, updateCard, deleteCard, moveCard, createCard, cards } = useBoardStore();
  const [showEditDialog, setShowEditDialog] = useState(false);

  const currentBucket = buckets.find(b => b.id === card.bucketId);
  const availableBuckets = buckets.filter(b => b.boardId === currentBucket?.boardId);

  const handlePriorityChange = (priority: 'low' | 'medium' | 'high' | 'none') => {
    updateCard(card.id, { priority: priority === 'none' ? undefined : priority });
  };

  const handleLabelToggle = (label: Label) => {
    const currentLabels = card.labels || [];
    const hasLabel = currentLabels.some(l => l.id === label.id);
    
    if (hasLabel) {
      updateCard(card.id, { 
        labels: currentLabels.filter(l => l.id !== label.id) 
      });
    } else {
      updateCard(card.id, { 
        labels: [...currentLabels, label] 
      });
    }
  };

  const handleMoveToBucket = async (targetBucketId: string) => {
    if (targetBucketId !== card.bucketId) {
      // Move to the end of the target bucket
      await moveCard(card.id, targetBucketId, 99999);
    }
  };

  const handleDuplicate = async () => {
    const newCardId = await createCard(card.bucketId, `${card.title} (Copy)`);
    
    // Copy all properties to the new card
    if (newCardId) {
      await updateCard(newCardId, {
        description: card.description,
        priority: card.priority,
        labels: card.labels,
        checklist: card.checklist?.map(item => ({ ...item, id: Math.random().toString() })),
        assignees: card.assignees?.slice(),
        dueDate: card.dueDate,
      });
    }
  };

  const handleToggleComplete = () => {
    updateCard(card.id, { completed: !card.completed });
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuLabel>Quick Actions</ContextMenuLabel>
          <ContextMenuSeparator />
          
          {/* Complete/Uncomplete */}
          <ContextMenuItem onClick={handleToggleComplete}>
            <Check className="mr-2 h-4 w-4" />
            {card.completed ? 'Mark as Active' : 'Mark as Complete'}
          </ContextMenuItem>
          
          {/* Edit */}
          <ContextMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Card
          </ContextMenuItem>
          
          <ContextMenuSeparator />
          
          {/* Priority */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Flag className="mr-2 h-4 w-4" />
              Set Priority
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuRadioGroup value={card.priority || 'none'}>
                <ContextMenuRadioItem value="high" onClick={() => handlePriorityChange('high')}>
                  <span className="flex items-center">
                    <Flag className="mr-2 h-4 w-4 text-red-500" />
                    High
                  </span>
                </ContextMenuRadioItem>
                <ContextMenuRadioItem value="medium" onClick={() => handlePriorityChange('medium')}>
                  <span className="flex items-center">
                    <Flag className="mr-2 h-4 w-4 text-yellow-500" />
                    Medium
                  </span>
                </ContextMenuRadioItem>
                <ContextMenuRadioItem value="low" onClick={() => handlePriorityChange('low')}>
                  <span className="flex items-center">
                    <Flag className="mr-2 h-4 w-4 text-blue-500" />
                    Low
                  </span>
                </ContextMenuRadioItem>
                <ContextMenuRadioItem value="none" onClick={() => handlePriorityChange('none')}>
                  No Priority
                </ContextMenuRadioItem>
              </ContextMenuRadioGroup>
            </ContextMenuSubContent>
          </ContextMenuSub>
          
          {/* Labels */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Tag className="mr-2 h-4 w-4" />
              Labels
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              {labels.length > 0 ? (
                labels.map((label) => {
                  const hasLabel = card.labels?.some(l => l.id === label.id);
                  return (
                    <ContextMenuItem
                      key={label.id}
                      onClick={() => handleLabelToggle(label)}
                      className="flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-sm" 
                          style={{ backgroundColor: label.color }}
                        />
                        {label.name}
                      </span>
                      {hasLabel && <Check className="h-4 w-4" />}
                    </ContextMenuItem>
                  );
                })
              ) : (
                <ContextMenuItem disabled>
                  No labels available
                </ContextMenuItem>
              )}
            </ContextMenuSubContent>
          </ContextMenuSub>
          
          {/* Move to */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <ArrowRight className="mr-2 h-4 w-4" />
              Move to
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              {availableBuckets.map((bucket) => (
                <ContextMenuItem
                  key={bucket.id}
                  onClick={() => handleMoveToBucket(bucket.id)}
                  disabled={bucket.id === card.bucketId}
                >
                  {bucket.title}
                  {bucket.id === card.bucketId && ' (current)'}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
          
          <ContextMenuSeparator />
          
          {/* Additional quick actions */}
          <ContextMenuItem onClick={() => setShowEditDialog(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            Set Due Date
          </ContextMenuItem>
          
          <ContextMenuItem onClick={() => setShowEditDialog(true)}>
            <Users className="mr-2 h-4 w-4" />
            Assign Members
          </ContextMenuItem>
          
          <ContextMenuItem onClick={() => setShowEditDialog(true)}>
            <CheckSquare className="mr-2 h-4 w-4" />
            Add Checklist
          </ContextMenuItem>
          
          <ContextMenuSeparator />
          
          {/* Duplicate */}
          <ContextMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate Card
          </ContextMenuItem>
          
          {/* Delete */}
          <ContextMenuItem
            onClick={() => deleteCard(card.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Card
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      
      <EditCardDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        card={card}
        onUpdateCard={updateCard}
      />
      
    </>
  );
}