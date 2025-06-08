'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserPlus, X } from 'lucide-react';

interface AssigneeManagerProps {
  assignees: string[];
  onChange: (assignees: string[]) => void;
}

export function AssigneeManager({ assignees, onChange }: AssigneeManagerProps) {
  const [newAssignee, setNewAssignee] = useState('');

  const handleAddAssignee = () => {
    if (newAssignee.trim() && !assignees.includes(newAssignee.trim())) {
      onChange([...assignees, newAssignee.trim()]);
      setNewAssignee('');
    }
  };

  const handleRemoveAssignee = (assignee: string) => {
    onChange(assignees.filter(a => a !== assignee));
  };

  return (
    <div className="grid gap-2">
      <Label>Assignees</Label>
      
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
      
      <div className="flex gap-2">
        <Input
          placeholder="Add assignee..."
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
    </div>
  );
}