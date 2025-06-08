'use client';

import { useBoardStore } from '@/lib/store/boardStore';
import { Button } from '@/components/ui/button';
import { Card as CardUI } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, closestCenter, DragStartEvent, DragOverEvent, pointerWithin, rectIntersection } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import { Bucket } from './Bucket';
import { Card } from '@/types';
import { CreateBucketDialog } from './CreateBucketDialog';
import { ViewToggle } from './ViewToggle';
import { BoardListView } from './BoardListView';
import { FilterBar } from './FilterBar';

export function BoardView() {
  const { currentBoard, buckets, cards, createBucket, moveCard, moveBucket, generateMockData, getFilteredCards } = useBoardStore();
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [showCreateBucketDialog, setShowCreateBucketDialog] = useState(false);

  // Use filtered cards instead of raw cards
  const filteredCards = getFilteredCards();

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;
    
    if (activeId.startsWith('card-')) {
      const cardId = activeId.replace('card-', '');
      const card = filteredCards.find(c => c.id === cardId);
      setActiveCard(card || null);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Only handle card movements
    if (!activeId.startsWith('card-')) return;

    const activeCardId = activeId.replace('card-', '');
    const activeCard = filteredCards.find(c => c.id === activeCardId);
    
    if (!activeCard) return;

    // If we're over a card
    if (overId.startsWith('card-')) {
      const overCardId = overId.replace('card-', '');
      const overCard = filteredCards.find(c => c.id === overCardId);
      
      if (!overCard || activeCard.id === overCard.id) return;
      
      // If moving to a different bucket, move the card immediately for visual feedback
      if (activeCard.bucketId !== overCard.bucketId) {
        moveCard(activeCard.id, overCard.bucketId, overCard.position);
      }
    } else if (overId.startsWith('bucket-')) {
      // If we're over an empty bucket or the bucket area
      const overBucketId = overId.replace('bucket-', '');
      
      if (activeCard.bucketId !== overBucketId) {
        // Move to the end of the new bucket
        const targetBucketCards = filteredCards.filter(c => c.bucketId === overBucketId);
        const maxPosition = Math.max(...targetBucketCards.map(c => c.position), 0);
        moveCard(activeCard.id, overBucketId, maxPosition + 1);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setTimeout(() => {
        setActiveCard(null);
      }, 0);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if we're dragging a card
    if (activeId.startsWith('card-')) {
      const cardId = activeId.replace('card-', '');
      const draggedCard = filteredCards.find(c => c.id === cardId);
      
      if (!draggedCard) return;
      
      // Check if dropping on another card (reordering within or between buckets)
      if (overId.startsWith('card-')) {
        const targetCardId = overId.replace('card-', '');
        const targetCard = filteredCards.find(c => c.id === targetCardId);
        
        if (targetCard) {
          // If same bucket, reorder
          if (draggedCard.bucketId === targetCard.bucketId) {
            // Get all cards in this bucket sorted by position
            const bucketCards = filteredCards
              .filter(c => c.bucketId === draggedCard.bucketId && !c.completed)
              .sort((a, b) => a.position - b.position);
            
            const draggedIndex = bucketCards.findIndex(c => c.id === cardId);
            const targetIndex = bucketCards.findIndex(c => c.id === targetCardId);
            
            if (draggedIndex !== -1 && targetIndex !== -1) {
              // Calculate new position
              let newPosition;
              if (targetIndex === 0) {
                newPosition = bucketCards[0].position / 2;
              } else if (targetIndex === bucketCards.length - 1 && draggedIndex < targetIndex) {
                newPosition = bucketCards[bucketCards.length - 1].position + 1;
              } else if (draggedIndex < targetIndex) {
                // Moving down
                newPosition = (bucketCards[targetIndex].position + bucketCards[targetIndex + 1].position) / 2;
              } else {
                // Moving up
                newPosition = (bucketCards[targetIndex - 1].position + bucketCards[targetIndex].position) / 2;
              }
              
              moveCard(cardId, draggedCard.bucketId, newPosition);
            }
          } else {
            // Different bucket - move to target card's bucket at target position
            moveCard(cardId, targetCard.bucketId, targetCard.position + 0.1);
          }
        }
      } else if (overId.startsWith('bucket-')) {
        // Dropping on bucket (not on a card)
        const targetBucketId = overId.replace('bucket-', '');
        
        if (draggedCard.bucketId !== targetBucketId) {
          // Move to end of new bucket
          const targetBucketCards = filteredCards.filter(c => c.bucketId === targetBucketId);
          const maxPosition = Math.max(...targetBucketCards.map(c => c.position), 0);
          moveCard(cardId, targetBucketId, maxPosition + 1);
        }
      }
    }
    
    // Check if we're dragging a bucket
    if (activeId.startsWith('bucket-') && overId.startsWith('bucket-')) {
      const draggedBucketId = activeId.replace('bucket-', '');
      const targetBucketId = overId.replace('bucket-', '');
      
      const draggedBucket = buckets.find(b => b.id === draggedBucketId);
      const targetBucket = buckets.find(b => b.id === targetBucketId);
      
      if (draggedBucket && targetBucket && draggedBucket.id !== targetBucket.id) {
        moveBucket(draggedBucketId, targetBucket.position);
      }
    }

    // Reset drag state
    setActiveCard(null);
  };

  const handleCreateBucket = async (title: string) => {
    await createBucket(title);
  };

  if (!currentBoard) return null;

  const viewMode = currentBoard.viewMode || 'cards';

  // If in list view, render the list view component
  if (viewMode === 'list') {
    return <BoardListView />;
  }

  // Otherwise render the card view
  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 py-3 flex items-center gap-4">
          <h1 className="text-xl font-bold flex-shrink-0">{currentBoard.title}</h1>
          <div className="flex-1">
            <FilterBar />
          </div>
          <ViewToggle />
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto">
        <div className="p-6">
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-[calc(100vh-200px)]">
            <SortableContext
              items={buckets.map(b => `bucket-${b.id}`)}
              strategy={horizontalListSortingStrategy}
            >
              {buckets.map((bucket) => (
                <Bucket
                  key={bucket.id}
                  bucket={bucket}
                  cards={filteredCards.filter(c => c.bucketId === bucket.id)}
                  activeCardId={activeCard?.id || null}
                />
              ))}
            </SortableContext>
            
            <div className="w-80 flex-shrink-0">
              <Button
                variant="ghost"
                className="w-full h-12 justify-start px-5 text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-card/50 transition-all rounded-lg border border-dashed border-border/50"
                onClick={() => setShowCreateBucketDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add another list
              </Button>
            </div>
          </div>
          
          <DragOverlay dropAnimation={{
            duration: 200,
            easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
          }}>
            {activeCard && (
              <div className="bg-transparent border-2 border-dashed border-primary/50 rounded-lg w-80 h-24 cursor-grabbing" />
            )}
          </DragOverlay>
        </DndContext>
        </div>
      </div>
      
      <CreateBucketDialog
        open={showCreateBucketDialog}
        onOpenChange={setShowCreateBucketDialog}
        onCreateBucket={handleCreateBucket}
      />
    </div>
  );
}