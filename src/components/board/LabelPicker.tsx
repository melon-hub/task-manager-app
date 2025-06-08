'use client';

import { useState } from 'react';
import { Plus, Check, X, Edit2, Trash2, Palette } from 'lucide-react';
import { Label } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useBoardStore } from '@/lib/store/boardStore';

interface LabelPickerProps {
  selectedLabels: Label[];
  onLabelsChange: (labels: Label[]) => void;
  trigger?: React.ReactNode;
}

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#ec4899', // pink
  '#64748b', // slate
];

export function LabelPicker({ selectedLabels, onLabelsChange, trigger }: LabelPickerProps) {
  const { labels, createLabel, updateLabel, deleteLabel } = useBoardStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(PRESET_COLORS[0]);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleToggleLabel = (label: Label) => {
    const isSelected = selectedLabels.some(l => l.id === label.id);
    if (isSelected) {
      onLabelsChange(selectedLabels.filter(l => l.id !== label.id));
    } else {
      onLabelsChange([...selectedLabels, label]);
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    
    await createLabel(newLabelName.trim(), newLabelColor);
    setNewLabelName('');
    setIsCreating(false);
  };

  const handleUpdateLabel = async (labelId: string) => {
    if (!editName.trim()) return;
    
    await updateLabel(labelId, { name: editName.trim(), color: editColor });
    setEditingId(null);
  };

  const handleDeleteLabel = async (labelId: string) => {
    await deleteLabel(labelId);
    setEditingId(null);
  };

  const startEdit = (label: Label) => {
    setEditingId(label.id);
    setEditName(label.name);
    setEditColor(label.color);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-3 w-3" />
            Labels
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <h4 className="font-medium text-sm">Labels</h4>
          <p className="text-xs text-muted-foreground mt-1">Click to select, hover to edit</p>
        </div>
        
        <div className="max-h-64 overflow-y-auto p-2">
          {labels.map((label) => (
            <div key={label.id} className="group">
              {editingId === label.id ? (
                <div className="p-2 space-y-2 bg-accent/50 rounded">
                  <div className="flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-7 text-xs flex-1"
                      placeholder="Label name"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateLabel(label.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 hover:bg-primary/10"
                      onClick={() => handleUpdateLabel(label.id)}
                      title="Save changes"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 hover:bg-muted"
                      onClick={() => setEditingId(null)}
                      title="Cancel"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 gap-2 flex-1"
                          style={{ backgroundColor: editColor }}
                        >
                          <Palette className="h-3 w-3" />
                          <span className="text-xs">Change color</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2" align="start">
                        <div className="grid grid-cols-7 gap-1">
                          {PRESET_COLORS.map((color) => (
                            <button
                              key={color}
                              className={cn(
                                "w-8 h-8 rounded hover:scale-110 transition-transform",
                                editColor === color && "ring-2 ring-offset-1 ring-primary"
                              )}
                              style={{ backgroundColor: color }}
                              onClick={() => setEditColor(color)}
                            />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              ) : (
                <div className="w-full flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors">
                  <button
                    className="flex-1 flex items-center gap-2"
                    onClick={() => handleToggleLabel(label)}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded border-2",
                        selectedLabels.some(l => l.id === label.id)
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      )}
                    >
                      {selectedLabels.some(l => l.id === label.id) && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-sm text-xs font-medium text-white flex-1 text-left"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.name}
                    </span>
                  </button>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="h-6 w-6 hover:bg-muted rounded flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(label);
                      }}
                      title="Edit label"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      className="h-6 w-6 hover:bg-destructive/10 rounded flex items-center justify-center text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLabel(label.id);
                      }}
                      title="Delete label"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isCreating ? (
            <div className="p-2 space-y-2 bg-accent/50 rounded m-2">
              <div className="flex gap-2">
                <Input
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  className="h-7 text-xs flex-1"
                  placeholder="Label name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateLabel();
                    if (e.key === 'Escape') {
                      setIsCreating(false);
                      setNewLabelName('');
                    }
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 hover:bg-primary/10"
                  onClick={handleCreateLabel}
                  disabled={!newLabelName.trim()}
                  title="Create label"
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 hover:bg-muted"
                  onClick={() => {
                    setIsCreating(false);
                    setNewLabelName('');
                  }}
                  title="Cancel"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-2 w-full"
                    style={{ backgroundColor: newLabelColor }}
                  >
                    <Palette className="h-3 w-3" />
                    <span className="text-xs">Select color</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <div className="grid grid-cols-7 gap-1">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        className={cn(
                          "w-8 h-8 rounded hover:scale-110 transition-transform",
                          newLabelColor === color && "ring-2 ring-offset-1 ring-primary"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewLabelColor(color)}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <button
              className="w-full flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors text-sm"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="h-4 w-4" />
              Create new label
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}