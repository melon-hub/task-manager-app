'use client';

import { useState, useEffect } from 'react';
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
import { Check, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChecklistManager } from './edit-card/ChecklistManager';
import { AssigneeManager } from './edit-card/AssigneeManager';
import { LabelPopoverCompact } from './edit-card/LabelPopoverCompact';

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
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
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
        assignees: assignees,
        checklist: checklist,
        labels: labels,
      });
      onOpenChange(false);
    }
  };


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
            
            <LabelPopoverCompact
              selectedLabels={labels}
              onLabelsChange={setLabels}
            />
            
            <AssigneeManager
              assignees={assignees}
              onChange={setAssignees}
            />
            
            <ChecklistManager
              checklist={checklist}
              onChange={setChecklist}
            />
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