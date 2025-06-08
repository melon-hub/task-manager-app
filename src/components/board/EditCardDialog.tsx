'use client';

import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, ChecklistItem, Label as LabelType } from '@/types';
import { Check, X, UserPlus, CalendarIcon, Plus, Square, CheckSquare, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LabelPicker } from './LabelPicker';

// Sortable label component
function SortableLabel({ label }: { label: LabelType }) {
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
      {...attributes}
    >
      <div
        className="cursor-move opacity-60 hover:opacity-100 px-1"
        {...listeners}
      >
        <GripVertical className="h-3 w-3" />
      </div>
      <span className="px-1.5 py-0.5">
        {label.name}
      </span>
    </div>
  );
}

interface EditCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: Card | null;
  onUpdateCard: (cardId: string, data: {
    title?: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: Date;
    completed?: boolean;
    assignees?: string[];
    checklist?: ChecklistItem[];
    labels?: LabelType[];
  }) => void;
}

export function EditCardDialog({ open, onOpenChange, card, onUpdateCard }: EditCardDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | ''>('');
  const [dueDate, setDueDate] = useState('');
  const [completed, setCompleted] = useState(false);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [newAssignee, setNewAssignee] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [labels, setLabels] = useState<LabelType[]>([]);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      setPriority(card.priority || '');
      setDueDate(card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '');
      setCompleted(card.completed || false);
      setAssignees(card.assignees || []);
      setChecklist(card.checklist || []);
      setLabels(card.labels || []);
    }
  }, [card]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (card && title.trim()) {
      onUpdateCard(card.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority: priority || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        completed,
        assignees: assignees.length > 0 ? assignees : undefined,
        checklist: checklist.length > 0 ? checklist : undefined,
        labels: labels.length > 0 ? labels : undefined,
      });
      onOpenChange(false);
    }
  };

  const handleAddAssignee = () => {
    if (newAssignee.trim() && !assignees.includes(newAssignee.trim())) {
      setAssignees([...assignees, newAssignee.trim()]);
      setNewAssignee('');
    }
  };

  const handleRemoveAssignee = (assignee: string) => {
    setAssignees(assignees.filter(a => a !== assignee));
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem: ChecklistItem = {
        id: crypto.randomUUID(),
        text: newChecklistItem.trim(),
        completed: false,
      };
      setChecklist([...checklist, newItem]);
      setNewChecklistItem('');
    }
  };

  const handleToggleChecklistItem = (itemId: string) => {
    setChecklist(checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleRemoveChecklistItem = (itemId: string) => {
    setChecklist(checklist.filter(item => item.id !== itemId));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setLabels((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Initialize sensors outside of conditional rendering
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
          <DialogDescription>
            Update the details of your task
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCompleted(!completed)}
                className="h-5 w-5 rounded border border-input flex items-center justify-center hover:bg-muted transition-colors"
                aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
              >
                {completed && <Check className="h-3.5 w-3.5" />}
              </button>
              <Label className="text-sm font-medium">Mark as completed</Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-card-title">Title</Label>
              <Input
                id="edit-card-title"
                placeholder="Enter card title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-card-description">Description (optional)</Label>
              <Textarea
                id="edit-card-description"
                placeholder="Add a more detailed description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-card-priority">Priority</Label>
                <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                  <SelectTrigger id="edit-card-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        Low
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        High
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-card-due-date">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? new Date(dueDate).toLocaleDateString() : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4" align="start">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Calendar picker coming soon!</p>
                      <Input
                        id="edit-card-due-date"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                      {dueDate && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => setDueDate('')}
                        >
                          Clear date
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Labels</Label>
              <div className="flex items-start gap-2">
                <LabelPicker
                  selectedLabels={labels}
                  onLabelsChange={setLabels}
                  trigger={
                    <Button type="button" variant="outline" size="sm" className="gap-2">
                      <Tag className="h-3 w-3" />
                      Add Labels
                    </Button>
                  }
                />
                {labels.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Drag to reorder labels</p>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext items={labels.map(l => l.id)} strategy={horizontalListSortingStrategy}>
                        <div className="flex flex-wrap gap-1">
                          {labels.map((label) => (
                            <SortableLabel key={label.id} label={label} />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-card-assignees">Assignees</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="edit-card-assignees"
                    placeholder="Enter name..."
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAssignee();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddAssignee}
                    disabled={!newAssignee.trim()}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
                {assignees.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {assignees.map((assignee) => (
                      <Badge key={assignee} variant="secondary" className="gap-1">
                        {assignee}
                        <button
                          type="button"
                          onClick={() => handleRemoveAssignee(assignee)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-card-checklist">Checklist</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="edit-card-checklist"
                    placeholder="Add a checklist item..."
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
                {checklist.length > 0 && (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 rounded-md bg-muted/50 group"
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleChecklistItem(item.id)}
                          className="flex-shrink-0"
                        >
                          {item.completed ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                        <span className={cn(
                          "flex-1 text-sm",
                          item.completed && "line-through text-muted-foreground"
                        )}>
                          {item.text}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveChecklistItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    ))}
                    <div className="text-xs text-muted-foreground text-right">
                      {checklist.filter(item => item.completed).length}/{checklist.length} completed
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}