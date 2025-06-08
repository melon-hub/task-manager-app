'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Database, Star } from 'lucide-react';
import { useBoardStore } from '@/lib/store/boardStore';
import { usePreferencesStore } from '@/lib/store/preferencesStore';
import { Board } from '@/types';
import { db } from '@/lib/db/schema';
import Link from 'next/link';
import { CreateBoardDialog } from '@/components/board/CreateBoardDialog';
import { createMockData } from '@/lib/mock-data';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { createBoard } = useBoardStore();
  const { favoriteBoards, toggleFavoriteBoard } = usePreferencesStore();

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    const allBoards = await db.boards.toArray();
    setBoards(allBoards);
  };

  const handleCreateBoard = async (title: string) => {
    await createBoard(title);
    loadBoards();
  };

  const handleLoadMockData = async () => {
    const board = await createMockData();
    if (board) {
      loadBoards();
    }
  };

  return (
    <div className="p-8">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-3">My Boards</h1>
          <p className="text-muted-foreground">Create and manage your task boards</p>
        </div>
        {boards.length === 0 && (
          <Button
            variant="outline"
            onClick={handleLoadMockData}
          >
            <Database className="mr-2 h-4 w-4" />
            Load Sample Data
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {boards.map((board) => {
          const isFavorite = favoriteBoards.includes(board.id);
          
          return (
            <ContextMenu key={board.id}>
              <ContextMenuTrigger>
                <div className="relative group">
                  <Link href={`/boards/${board.id}`}>
                    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                      <h3 className="font-semibold text-lg mb-2">{board.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(board.createdAt).toLocaleDateString()}
                      </p>
                    </Card>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavoriteBoard(board.id);
                    }}
                  >
                    <Star className={`h-4 w-4 ${isFavorite ? 'fill-current text-yellow-500' : ''}`} />
                  </Button>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => toggleFavoriteBoard(board.id)}>
                  <Star className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current text-yellow-500' : ''}`} />
                  {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
        
        <Card 
          className="p-6 border-dashed cursor-pointer hover:border-primary transition-colors flex items-center justify-center"
          onClick={() => setShowCreateDialog(true)}
        >
          <div className="text-center">
            <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium">Create new board</p>
          </div>
        </Card>
      </div>
      
      <CreateBoardDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateBoard={handleCreateBoard}
      />
    </div>
  );
}