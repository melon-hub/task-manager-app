'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useBoardStore } from '@/lib/store/boardStore';
import { BoardView } from '@/components/board/BoardView';

export default function BoardPage() {
  const params = useParams();
  const boardId = params.id as string;
  const { loadBoard, currentBoard, loading } = useBoardStore();

  useEffect(() => {
    if (boardId) {
      loadBoard(boardId);
    }
  }, [boardId, loadBoard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading board...</p>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    );
  }

  return <BoardView />;
}