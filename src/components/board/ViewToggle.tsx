'use client';

import { LayoutGrid, List } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useBoardStore } from '@/lib/store/boardStore';

export function ViewToggle() {
  const { currentBoard, updateBoard } = useBoardStore();
  
  if (!currentBoard) return null;
  
  const viewMode = currentBoard.viewMode || 'cards';
  
  const handleViewChange = (value: string) => {
    if (value && (value === 'cards' || value === 'list')) {
      updateBoard(currentBoard.id, { viewMode: value });
    }
  };
  
  return (
    <ToggleGroup 
      type="single" 
      value={viewMode} 
      onValueChange={handleViewChange}
      className="border rounded-md"
    >
      <ToggleGroupItem value="cards" aria-label="Card view" className="px-2">
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view" className="px-2">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}