'use client';

import { useState, useEffect } from 'react';
import { Label as LabelType } from '@/types';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Check, Edit2, Search } from 'lucide-react';
import { useBoardStore } from '@/lib/store/boardStore';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface LabelPopoverCompactProps {
  selectedLabels: LabelType[];
  onLabelsChange: (labels: LabelType[]) => void;
}

const PRESET_COLORS = [
  '#22c55e', // green
  '#f59e0b', // amber
  '#f97316', // orange
  '#ef4444', // red
  '#a855f7', // purple
  '#3b82f6', // blue
  '#10b981', // emerald
  '#ec4899', // pink
  '#6366f1', // indigo
  '#84cc16', // lime
  '#06b6d4', // cyan
  '#64748b', // slate
];

export function LabelPopoverCompact({ selectedLabels, onLabelsChange }: LabelPopoverCompactProps) {
  const { labels: boardLabels, createLabel, updateLabel, deleteLabel } = useBoardStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(PRESET_COLORS[0]);
  const [editValues, setEditValues] = useState<{ name: string; color: string }>({ name: '', color: '' });

  // Reset states when closing
  useEffect(() => {
    if (!isOpen) {
      setEditingId(null);
      setIsCreating(false);
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filter labels based on search
  const filteredLabels = boardLabels.filter(label =>
    label.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleLabel = (label: LabelType) => {
    const isSelected = selectedLabels.some(l => l.id === label.id);
    if (isSelected) {
      onLabelsChange(selectedLabels.filter(l => l.id !== label.id));
    } else {
      onLabelsChange([...selectedLabels, label]);
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    
    const newLabel = await createLabel(newLabelName.trim(), newLabelColor);
    if (newLabel) {
      onLabelsChange([...selectedLabels, newLabel]);
    }
    setNewLabelName('');
    setIsCreating(false);
    setNewLabelColor(PRESET_COLORS[0]);
  };

  const startEdit = (label: LabelType) => {
    setEditingId(label.id);
    setEditValues({ name: label.name, color: label.color });
    setIsCreating(false);
  };

  const handleUpdateLabel = async () => {
    if (!editingId || !editValues.name.trim()) return;
    
    await updateLabel(editingId, { 
      name: editValues.name.trim(), 
      color: editValues.color 
    });
    
    // Update local selected labels
    const updatedLabels = selectedLabels.map(l => 
      l.id === editingId 
        ? { ...l, name: editValues.name.trim(), color: editValues.color } 
        : l
    );
    onLabelsChange(updatedLabels);
    
    setEditingId(null);
  };

  const handleDeleteLabel = async (labelId: string) => {
    await deleteLabel(labelId);
    onLabelsChange(selectedLabels.filter(l => l.id !== labelId));
    if (editingId === labelId) {
      setEditingId(null);
    }
  };

  const renderColorPicker = (selectedColor: string, onColorSelect: (color: string) => void) => (
    <div className="grid grid-cols-6 gap-0.5">
      {PRESET_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onColorSelect(color)}
          className={cn(
            "h-6 w-full rounded transition-all hover:scale-105",
            selectedColor === color 
              ? "ring-2 ring-primary ring-offset-1" 
              : ""
          )}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );

  const renderLabelContent = () => {
    if (isCreating) {
      return (
        <div className="p-2 space-y-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              placeholder="Enter label name..."
              className="h-7 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateLabel();
                } else if (e.key === 'Escape') {
                  setIsCreating(false);
                  setNewLabelName('');
                }
              }}
              autoFocus
            />
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Select a color</Label>
            {renderColorPicker(newLabelColor, setNewLabelColor)}
          </div>
          
          <div className="flex gap-1.5 pt-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1 h-7 text-xs"
              onClick={() => {
                setIsCreating(false);
                setNewLabelName('');
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={handleCreateLabel}
              disabled={!newLabelName.trim()}
            >
              Create
            </Button>
          </div>
        </div>
      );
    }

    if (editingId) {
      const label = boardLabels.find(l => l.id === editingId);
      if (!label) return null;

      return (
        <div className="p-2 space-y-1.5">
          <div>
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input
              value={editValues.name}
              onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter label name..."
              className="h-7 text-sm mt-0.5"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleUpdateLabel();
                } else if (e.key === 'Escape') {
                  setEditingId(null);
                }
              }}
              autoFocus
            />
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground">Select a color</Label>
            <div className="mt-0.5">
              {renderColorPicker(editValues.color, (color) => 
                setEditValues(prev => ({ ...prev, color }))
              )}
            </div>
          </div>
          
          <div className="flex gap-1.5 pt-1">
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="h-7 text-xs"
              onClick={() => handleDeleteLabel(editingId)}
            >
              Delete
            </Button>
            <div className="flex-1" />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => setEditingId(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-7 text-xs"
              onClick={handleUpdateLabel}
              disabled={!editValues.name.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search labels..."
              className="h-7 pl-8 text-sm"
            />
          </div>
        </div>
        
        <div className="max-h-[240px] overflow-y-auto py-1">
          {filteredLabels.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No labels found
            </p>
          ) : (
            filteredLabels.map((label) => {
              const isSelected = selectedLabels.some(l => l.id === label.id);
              
              return (
                <div
                  key={label.id}
                  className="flex items-center gap-2 px-2 py-1 hover:bg-accent/50 transition-colors group"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleLabel(label)}
                    className="flex-1 flex items-center gap-2 text-left min-w-0"
                  >
                    <div
                      className="h-6 flex-1 rounded text-xs font-medium flex items-center px-2 text-white truncate"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.name}
                    </div>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    )}
                  </button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(label);
                    }}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
        
        <div className="p-2 border-t">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-center h-7 text-xs"
            onClick={() => setIsCreating(true)}
          >
            Create a new label
          </Button>
        </div>
      </>
    );
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label>Labels</Label>
      </div>
      
      {/* Selected labels */}
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedLabels.map((label) => (
            <Badge
              key={label.id}
              variant="secondary"
              className="gap-1 pr-1"
              style={{ backgroundColor: label.color, color: 'white' }}
            >
              {label.name}
              <button
                type="button"
                onClick={() => handleToggleLabel(label)}
                className="ml-0.5 hover:bg-black/20 rounded p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      
      {/* Popover trigger */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="justify-start"
          >
            <Plus className="h-3 w-3 mr-2" />
            {selectedLabels.length > 0 ? 'Manage labels' : 'Add labels'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <h3 className="font-medium text-sm">Labels</h3>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mr-1"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          {renderLabelContent()}
        </PopoverContent>
      </Popover>
    </div>
  );
}