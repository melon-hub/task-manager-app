'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { UserPlus, X, Check, Users } from 'lucide-react';
import { usePreferencesStore } from '@/lib/store/preferencesStore';
import { cn } from '@/lib/utils';

interface AssigneeManagerProps {
  assignees: string[];
  onChange: (assignees: string[]) => void;
}

export function AssigneeManager({ assignees, onChange }: AssigneeManagerProps) {
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  const { users } = usePreferencesStore();

  const handleToggleAssignee = (userId: string) => {
    if (assignees.includes(userId)) {
      onChange(assignees.filter(a => a !== userId));
    } else {
      onChange([...assignees, userId]);
    }
  };

  const handleRemoveAssignee = (assigneeId: string) => {
    onChange(assignees.filter(a => a !== assigneeId));
  };

  return (
    <div className="grid gap-2">
      <Label>Assignees</Label>
      
      {assignees.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {assignees.map((assigneeId) => {
            const user = users.find(u => u.id === assigneeId);
            if (!user) return null;
            
            return (
              <Badge key={assigneeId} variant="secondary" className="gap-1">
                <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-[10px] font-medium">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                {user.name}
                <button
                  type="button"
                  onClick={() => handleRemoveAssignee(assigneeId)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
      
      <Popover open={showAssigneePicker} onOpenChange={setShowAssigneePicker}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="w-full">
            <Users className="mr-2 h-4 w-4" />
            {assignees.length > 0 ? 'Manage Assignees' : 'Add Assignees'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-3 border-b">
            <h4 className="font-medium text-sm">Assign Team Members</h4>
            <p className="text-xs text-muted-foreground mt-1">Click to assign or unassign</p>
          </div>
          
          <div className="max-h-64 overflow-y-auto p-2">
            {users.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No users added yet.
                <br />
                Go to Settings to add team members.
              </div>
            ) : (
              users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className="w-full flex items-center gap-3 p-2 rounded hover:bg-accent transition-colors"
                  onClick={() => handleToggleAssignee(user.id)}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded border-2",
                      assignees.includes(user.id)
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    )}
                  >
                    {assignees.includes(user.id) && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-1 text-left">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      {user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}