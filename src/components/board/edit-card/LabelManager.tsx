'use client';

import { useState } from 'react';
import { Label as LabelType } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Tag, X } from 'lucide-react';
import { LabelPicker } from '../LabelPicker';
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

  return (
    <div className="grid gap-2">
      <Label>Labels</Label>
      
      {labels.length > 0 && (
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
      )}
      
      <Popover open={showLabelPicker} onOpenChange={setShowLabelPicker}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="w-full">
            <Tag className="mr-2 h-4 w-4" />
            {labels.length > 0 ? 'Manage Labels' : 'Add Labels'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <LabelPicker
            selectedLabels={labels}
            onLabelsChange={onChange}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}