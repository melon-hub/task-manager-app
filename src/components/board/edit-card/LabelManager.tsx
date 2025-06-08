'use client';

import { useState } from 'react';
import { Label as LabelType } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Tag, X, Plus, Settings } from 'lucide-react';
import { LabelPicker } from '../LabelPicker';
import { useBoardStore } from '@/lib/store/boardStore';
import { cn } from '@/lib/utils';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

// Sortable label component
function SortableLabel({ label, onRemove }: { label: LabelType; onRemove: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: label.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, backgroundColor: label.color }}
      className="inline-flex items-center gap-0.5 rounded-sm text-xs font-medium text-white"
    >
      <button
        className="pl-1.5 py-0.5 cursor-grab active:cursor-grabbing"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="h-3 w-3" />
      </button>
      <span className="px-1">{label.name}</span>
      <button
        type="button"
        onClick={onRemove}
        className="px-1.5 py-0.5 hover:bg-black/20 rounded-r-sm"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

interface LabelManagerProps {
  labels: LabelType[];
  onChange: (labels: LabelType[]) => void;
}

export function LabelManager({ labels, onChange }: LabelManagerProps) {
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const { labels: boardLabels } = useBoardStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = labels.findIndex(label => label.id === active.id);
      const newIndex = labels.findIndex(label => label.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onChange(arrayMove(labels, oldIndex, newIndex));
      }
    }
  };


  const handleRemoveLabel = (labelId: string) => {
    onChange(labels.filter(l => l.id !== labelId));
  };

  const handleToggleLabel = (label: LabelType) => {
    const isSelected = labels.some(l => l.id === label.id);
    if (isSelected) {
      onChange(labels.filter(l => l.id !== label.id));
    } else {
      onChange([...labels, label]);
    }
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label>Labels</Label>
        <Popover open={showLabelPicker} onOpenChange={setShowLabelPicker}>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Manage
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="end">
            <LabelPicker
              selectedLabels={labels}
              onLabelsChange={onChange}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Available Labels */}
      {boardLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {boardLabels.map((label) => {
            const isSelected = labels.some(l => l.id === label.id);
            return (
              <button
                key={label.id}
                type="button"
                onClick={() => handleToggleLabel(label)}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-medium transition-all",
                  isSelected
                    ? "ring-2 ring-offset-1 ring-primary scale-105"
                    : "opacity-60 hover:opacity-100 hover:scale-105"
                )}
                style={{ 
                  backgroundColor: label.color,
                  color: 'white'
                }}
              >
                {label.name}
                {isSelected && <X className="h-3 w-3 ml-0.5" />}
              </button>
            );
          })}
        </div>
      )}
      
      {boardLabels.length === 0 && (
        <div className="text-sm text-muted-foreground text-center py-3 border-2 border-dashed rounded-md">
          No labels created yet.
          <br />
          <button
            type="button"
            onClick={() => setShowLabelPicker(true)}
            className="text-primary hover:underline"
          >
            Create your first label
          </button>
        </div>
      )}
      
      {/* Selected Labels with Drag & Drop */}
      {labels.length > 0 && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">Selected labels (drag to reorder):</p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={labels}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex flex-wrap gap-1">
                {labels.map((label) => (
                  <SortableLabel
                    key={label.id}
                    label={label}
                    onRemove={() => handleRemoveLabel(label.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}