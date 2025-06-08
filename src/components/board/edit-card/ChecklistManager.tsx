'use client';

import { useState } from 'react';
import { ChecklistItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckSquare, Plus, Square, X } from 'lucide-react';

interface ChecklistManagerProps {
  checklist: ChecklistItem[];
  onChange: (checklist: ChecklistItem[]) => void;
}

export function ChecklistManager({ checklist, onChange }: ChecklistManagerProps) {
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem: ChecklistItem = {
        id: crypto.randomUUID(),
        text: newChecklistItem.trim(),
        completed: false,
      };
      onChange([...checklist, newItem]);
      setNewChecklistItem('');
    }
  };

  const handleToggleChecklistItem = (id: string) => {
    onChange(
      checklist.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleRemoveChecklistItem = (id: string) => {
    onChange(checklist.filter(item => item.id !== id));
  };

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label>Checklist</Label>
        {totalCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {completedCount} of {totalCount} completed
          </span>
        )}
      </div>
      
      {totalCount > 0 && (
        <Progress value={completionPercentage} className="h-2" />
      )}
      
      <div className="space-y-1">
        {checklist.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 group"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0"
              onClick={() => handleToggleChecklistItem(item.id)}
            >
              {item.completed ? (
                <CheckSquare className="h-4 w-4 text-primary" />
              ) : (
                <Square className="h-4 w-4" />
              )}
            </Button>
            <span
              className={`flex-1 text-sm ${
                item.completed ? 'line-through text-muted-foreground' : ''
              }`}
            >
              {item.text}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemoveChecklistItem(item.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Input
          placeholder="Add an item..."
          value={newChecklistItem}
          onChange={(e) => setNewChecklistItem(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddChecklistItem();
            }
          }}
        />
        <Button
          type="button"
          size="sm"
          onClick={handleAddChecklistItem}
          disabled={!newChecklistItem.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}