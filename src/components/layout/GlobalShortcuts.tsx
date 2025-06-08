'use client';

import { useEffect, useState } from 'react';
import { CreateCardDialog } from '@/components/board/CreateCardDialog';
import { useBoardStore } from '@/lib/store/boardStore';
import { Label } from '@/types';
import { CommandPalette } from './CommandPalette';

export function GlobalShortcuts() {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [capturedBucketId, setCapturedBucketId] = useState<string | null>(null);
  const { currentBoard, buckets, createCard, updateCard, hoveredBucketId } = useBoardStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Global shortcuts
      if (e.key.toLowerCase() === 'n' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        // Capture the current hovered bucket ID before opening the dialog
        setCapturedBucketId(hoveredBucketId);
        setShowQuickAdd(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hoveredBucketId]);

  const handleQuickAddCard = async (data: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
    labels?: Label[];
    assignees?: string[];
    bucketId?: string;
  }) => {
    // Use the selected bucket or default to first bucket
    const targetBucketId = data.bucketId || buckets[0]?.id;
    if (!targetBucketId) return;

    const cardId = await createCard(targetBucketId, data.title);
    if (cardId && (data.description || data.priority || data.dueDate || data.labels || data.assignees)) {
      await updateCard(cardId, {
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        labels: data.labels,
        assignees: data.assignees,
      });
    }
  };

  return (
    <>
      <CommandPalette />
      {currentBoard && (
        <CreateCardDialog
          open={showQuickAdd}
          onOpenChange={(open) => {
            setShowQuickAdd(open);
            // Clear captured bucket ID when dialog closes
            if (!open) {
              setCapturedBucketId(null);
            }
          }}
          onCreateCard={handleQuickAddCard}
          targetBucketName={capturedBucketId ? buckets.find(b => b.id === capturedBucketId)?.title : buckets[0]?.title}
          showBucketSelector={true}
          defaultBucketId={capturedBucketId || buckets[0]?.id}
        />
      )}
    </>
  );
}