'use client';

import { useState, useEffect } from 'react';
import { useBoardStore } from '@/lib/store/boardStore';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Tag, Plus, Square, CheckSquare, X, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label as LabelType, ChecklistItem } from '@/types';
import { LabelPicker } from './LabelPicker';
import { Badge } from '@/components/ui/badge';

interface CreateCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCard: (data: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
    labels?: LabelType[];
    assignees?: string[];
    checklist?: ChecklistItem[];
    bucketId?: string;
  }) => void;
  targetBucketName?: string;
  showBucketSelector?: boolean;
  defaultBucketId?: string;
}

export function CreateCardDialog({ open, onOpenChange, onCreateCard, targetBucketName, showBucketSelector = false, defaultBucketId }: CreateCardDialogProps) {
  const { buckets } = useBoardStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | ''>('');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState<LabelType[]>([]);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [newAssignee, setNewAssignee] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [selectedBucketId, setSelectedBucketId] = useState<string>('');

  // Handle dialog open/close
  useEffect(() => {
    if (open) {
      // When opening, set the default bucket
      if (showBucketSelector && buckets.length > 0) {
        const targetId = defaultBucketId || buckets[0].id;
        setSelectedBucketId(targetId);
      }
    } else {
      // When closing, reset all form fields
      setTitle('');
      setDescription('');
      setPriority('');
      setDueDate('');
      setLabels([]);
      setAssignees([]);
      setNewAssignee('');
      setChecklist([]);
      setNewChecklistItem('');
      setSelectedBucketId('');
    }
  }, [open, showBucketSelector, buckets, defaultBucketId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreateCard({
        title: title.trim(),
        description: description.trim() || undefined,
        priority: priority || undefined,
        dueDate: dueDate || undefined,
        labels: labels.length > 0 ? labels : undefined,
        assignees: assignees.length > 0 ? assignees : undefined,
        checklist: checklist.length > 0 ? checklist : undefined,
        bucketId: selectedBucketId || undefined,
      });
      // Close dialog (form will be reset by the useEffect)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Card</DialogTitle>
          <DialogDescription>
            {targetBucketName ? (
              <>Add a card to <span className="font-medium">{targetBucketName}</span></>
            ) : (
              'Add details for your new task'
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {showBucketSelector && buckets.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="bucket-select">List</Label>
                <Select value={selectedBucketId} onValueChange={setSelectedBucketId}>
                  <SelectTrigger id="bucket-select" className="w-full">
                    <SelectValue placeholder="Select a list" />
                  </SelectTrigger>
                  <SelectContent>
                    {buckets.map((bucket) => (
                      <SelectItem key={bucket.id} value={bucket.id}>
                        {bucket.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="card-title">Title</Label>
              <Input
                id="card-title"
                placeholder="Enter card title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus={!showBucketSelector}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="card-description">Description (optional)</Label>
              <Textarea
                id="card-description"
                placeholder="Add a more detailed description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="card-priority">Priority</Label>
                <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                  <SelectTrigger id="card-priority">
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
                <Label htmlFor="card-due-date">Due Date</Label>
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
                        id="card-due-date"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
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
                  <div className="flex flex-wrap gap-1">
                    {labels.map((label) => (
                      <span
                        key={label.id}
                        className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium text-white"
                        style={{ backgroundColor: label.color }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="card-assignees">Assignees</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="card-assignees"
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
              <Label htmlFor="card-checklist">Checklist</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="card-checklist"
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
              Create Card
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}