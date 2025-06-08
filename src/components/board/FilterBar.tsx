'use client';

import { useBoardStore } from '@/lib/store/boardStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  X, 
  Filter,
  Calendar,
  Tag,
  User,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function FilterBar() {
  const { 
    buckets, 
    labels, 
    cards,
    filters, 
    updateFilters, 
    resetFilters,
    getFilteredCards 
  } = useBoardStore();

  const filteredCount = getFilteredCards().length;
  const totalCount = cards.length;
  const hasActiveFilters = filters.searchQuery || 
    filters.selectedLabels.length > 0 || 
    filters.selectedPriorities.length > 0 ||
    filters.selectedBuckets.length > 0 ||
    filters.selectedAssignees.length > 0 ||
    !filters.showCompleted ||
    filters.dueDateFilter !== 'all';

  // Get unique assignees from all cards
  const allAssignees = Array.from(
    new Set(cards.flatMap(card => card.assignees || []))
  ).sort();

  return (
    <div className="flex items-center gap-2">
      {/* Search bar */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search cards..."
          value={filters.searchQuery}
          onChange={(e) => updateFilters({ searchQuery: e.target.value })}
          className="h-8 pl-9 pr-9 text-sm"
        />
        {filters.searchQuery && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5"
            onClick={() => updateFilters({ searchQuery: '' })}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filter buttons */}
      <div className="flex items-center gap-1">
        {/* Bucket filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className={cn(
                "h-8 px-2.5 text-xs",
                filters.selectedBuckets.length > 0 && "bg-primary/10 text-primary hover:bg-primary/20"
              )}
            >
              <Filter className="h-3 w-3 mr-1" />
              Buckets
              {filters.selectedBuckets.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-3.5 px-1 text-[10px]">
                  {filters.selectedBuckets.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {buckets.map((bucket) => (
              <DropdownMenuCheckboxItem
                key={bucket.id}
                checked={filters.selectedBuckets.includes(bucket.id)}
                onCheckedChange={(checked) => {
                  const newBuckets = checked
                    ? [...filters.selectedBuckets, bucket.id]
                    : filters.selectedBuckets.filter(id => id !== bucket.id);
                  updateFilters({ selectedBuckets: newBuckets });
                }}
              >
                {bucket.title}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Label filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className={cn(
                "h-8 px-2.5 text-xs",
                filters.selectedLabels.length > 0 && "bg-primary/10 text-primary hover:bg-primary/20"
              )}
            >
              <Tag className="h-3 w-3 mr-1" />
              Labels
              {filters.selectedLabels.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-3.5 px-1 text-[10px]">
                  {filters.selectedLabels.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {labels.map((label) => (
              <DropdownMenuCheckboxItem
                key={label.id}
                checked={filters.selectedLabels.includes(label.id)}
                onCheckedChange={(checked) => {
                  const newLabels = checked
                    ? [...filters.selectedLabels, label.id]
                    : filters.selectedLabels.filter(id => id !== label.id);
                  updateFilters({ selectedLabels: newLabels });
                }}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-sm" 
                    style={{ backgroundColor: label.color }}
                  />
                  {label.name}
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Priority filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className={cn(
                "h-8 px-2.5 text-xs",
                filters.selectedPriorities.length > 0 && "bg-primary/10 text-primary hover:bg-primary/20"
              )}
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              Priority
              {filters.selectedPriorities.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-3.5 px-1 text-[10px]">
                  {filters.selectedPriorities.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuCheckboxItem
              checked={filters.selectedPriorities.includes('high')}
              onCheckedChange={(checked) => {
                const newPriorities = checked
                  ? [...filters.selectedPriorities, 'high' as const]
                  : filters.selectedPriorities.filter(p => p !== 'high');
                updateFilters({ selectedPriorities: newPriorities });
              }}
            >
              <Badge variant="destructive" className="mr-2 h-5">High</Badge>
              High Priority
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.selectedPriorities.includes('medium')}
              onCheckedChange={(checked) => {
                const newPriorities = checked
                  ? [...filters.selectedPriorities, 'medium' as const]
                  : filters.selectedPriorities.filter(p => p !== 'medium');
                updateFilters({ selectedPriorities: newPriorities });
              }}
            >
              <Badge variant="default" className="mr-2 h-5">Medium</Badge>
              Medium Priority
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.selectedPriorities.includes('low')}
              onCheckedChange={(checked) => {
                const newPriorities = checked
                  ? [...filters.selectedPriorities, 'low' as const]
                  : filters.selectedPriorities.filter(p => p !== 'low');
                updateFilters({ selectedPriorities: newPriorities });
              }}
            >
              <Badge variant="secondary" className="mr-2 h-5">Low</Badge>
              Low Priority
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Due date filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className={cn(
                "h-8 px-2.5 text-xs",
                filters.dueDateFilter !== 'all' && "bg-primary/10 text-primary hover:bg-primary/20"
              )}
            >
              <Calendar className="h-3 w-3 mr-1" />
              Due Date
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => updateFilters({ dueDateFilter: 'all' })}>
              All cards
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilters({ dueDateFilter: 'overdue' })}>
              Overdue
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilters({ dueDateFilter: 'today' })}>
              Due today
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilters({ dueDateFilter: 'week' })}>
              Due this week
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateFilters({ dueDateFilter: 'has-date' })}>
              Has due date
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Assignee filter */}
        {allAssignees.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className={cn(
                  "h-8 px-2.5 text-xs",
                  filters.selectedAssignees.length > 0 && "bg-primary/10 text-primary hover:bg-primary/20"
                )}
              >
                <User className="h-3 w-3 mr-1" />
                Assignee
                {filters.selectedAssignees.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-3.5 px-1 text-[10px]">
                    {filters.selectedAssignees.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {allAssignees.map((assignee) => (
                <DropdownMenuCheckboxItem
                  key={assignee}
                  checked={filters.selectedAssignees.includes(assignee)}
                  onCheckedChange={(checked) => {
                    const newAssignees = checked
                      ? [...filters.selectedAssignees, assignee]
                      : filters.selectedAssignees.filter(a => a !== assignee);
                    updateFilters({ selectedAssignees: newAssignees });
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-medium">
                      {assignee.slice(0, 2).toUpperCase()}
                    </div>
                    {assignee}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Completed toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateFilters({ showCompleted: !filters.showCompleted })}
          className={cn(
            "h-8 px-2.5 text-xs",
            !filters.showCompleted && "bg-primary/10 text-primary hover:bg-primary/20"
          )}
        >
          <CheckSquare className="h-3 w-3 mr-1" />
          {filters.showCompleted ? 'Hide' : 'Show'} Completed
        </Button>

        {/* Clear filters */}
        {hasActiveFilters && (
          <>
            <div className="h-4 w-px bg-border mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-8 px-2.5 text-xs text-muted-foreground"
            >
              Clear filters
            </Button>
            <span className="text-xs text-muted-foreground ml-2">
              {filteredCount} of {totalCount}
            </span>
          </>
        )}
      </div>
    </div>
  );
}