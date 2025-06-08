'use client';

import { useState } from 'react';
import { useBoardStore } from '@/lib/store/boardStore';
import { Card, Bucket } from '@/types';
import { FilterBar } from './FilterBar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit2, Trash2, ChevronUp, ChevronDown, Calendar, CheckSquare, ArrowUpDown, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EditCardDialog } from './EditCardDialog';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { CreateCardDialog } from './CreateCardDialog';
import { getRelativeDateString, getDueDateStatus } from '@/lib/utils/date';
import { ViewToggle } from './ViewToggle';
import { CardContextMenu } from './CardContextMenu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { LabelPicker } from './LabelPicker';

type SortConfig = {
  key: keyof Card | 'bucket';
  direction: 'asc' | 'desc';
};

export function BoardListView() {
  const { currentBoard, buckets, cards, updateCard, deleteCard, moveCard, labels, getFilteredCards } = useBoardStore();
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedBucketId, setSelectedBucketId] = useState<string>('');
  const [showLabelPicker, setShowLabelPicker] = useState(false);

  if (!currentBoard) return null;

  // Create a map of bucket IDs to bucket names
  const bucketMap = buckets.reduce((acc, bucket) => {
    acc[bucket.id] = bucket;
    return acc;
  }, {} as Record<string, Bucket>);

  // Get filtered cards
  const filteredCards = getFilteredCards();

  // Sort cards based on current sort configuration
  const sortedCards = [...filteredCards].sort((a, b) => {
    if (!sortConfig) {
      // Default sort by bucket position then card position
      const bucketA = bucketMap[a.bucketId];
      const bucketB = bucketMap[b.bucketId];
      if (bucketA.position !== bucketB.position) {
        return bucketA.position - bucketB.position;
      }
      return a.position - b.position;
    }

    let aValue: any;
    let bValue: any;

    if (sortConfig.key === 'bucket') {
      aValue = bucketMap[a.bucketId].title;
      bValue = bucketMap[b.bucketId].title;
    } else {
      aValue = a[sortConfig.key];
      bValue = b[sortConfig.key];
    }

    if (aValue === bValue) return 0;
    
    const modifier = sortConfig.direction === 'asc' ? 1 : -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * modifier;
    }
    
    return (aValue < bValue ? -1 : 1) * modifier;
  });

  const handleSort = (key: keyof Card | 'bucket') => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const toggleCardSelection = (cardId: string) => {
    setSelectedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const toggleAllCards = () => {
    if (selectedCards.size === filteredCards.length) {
      setSelectedCards(new Set());
    } else {
      setSelectedCards(new Set(filteredCards.map(c => c.id)));
    }
  };

  const handleDelete = () => {
    if (deletingCardId) {
      deleteCard(deletingCardId);
      setDeletingCardId(null);
    }
  };

  const handleBulkMove = async (toBucketId: string) => {
    const selectedCardsList = Array.from(selectedCards);
    for (const cardId of selectedCardsList) {
      const card = filteredCards.find(c => c.id === cardId);
      if (card) {
        // Find the highest position in the target bucket
        const targetBucketCards = filteredCards.filter(c => c.bucketId === toBucketId);
        const maxPosition = Math.max(...targetBucketCards.map(c => c.position), -1);
        await moveCard(cardId, toBucketId, maxPosition + 1);
      }
    }
    setSelectedCards(new Set());
  };

  const handleBulkPriority = async (priority: 'low' | 'medium' | 'high') => {
    const selectedCardsList = Array.from(selectedCards);
    for (const cardId of selectedCardsList) {
      await updateCard(cardId, { priority });
    }
    setSelectedCards(new Set());
  };

  const handleBulkLabels = async (selectedLabels: typeof labels) => {
    const selectedCardsList = Array.from(selectedCards);
    for (const cardId of selectedCardsList) {
      await updateCard(cardId, { labels: selectedLabels });
    }
    setSelectedCards(new Set());
    setShowLabelPicker(false);
  };

  const SortButton = ({ column, children }: { column: keyof Card | 'bucket'; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-medium hover:bg-transparent"
      onClick={() => handleSort(column)}
    >
      {children}
      {sortConfig?.key === column ? (
        sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
      ) : (
        <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
      )}
    </Button>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 py-3 flex items-center gap-4">
          <h1 className="text-xl font-bold flex-shrink-0">{currentBoard.title}</h1>
          <div className="flex-1">
            <FilterBar />
          </div>
          <ViewToggle />
          <Button 
            size="sm"
            onClick={() => setShowCreateDialog(true)}
          >
            Add Card
          </Button>
        </div>
      </div>
      
      {/* Bulk actions bar */}
      {selectedCards.size > 0 && (
        <div className="px-6 py-3 border-b bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedCards.size} {selectedCards.size === 1 ? 'item' : 'items'} selected
            </span>
            <div className="flex items-center gap-2">
              {/* Move to bucket dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    Move to...
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {buckets.map((bucket) => (
                    <DropdownMenuItem
                      key={bucket.id}
                      onClick={() => handleBulkMove(bucket.id)}
                    >
                      {bucket.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Set priority dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    Set Priority
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => handleBulkPriority('high')}>
                    <Badge variant="destructive" className="mr-2">High</Badge>
                    High Priority
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkPriority('medium')}>
                    <Badge variant="default" className="mr-2">Medium</Badge>
                    Medium Priority
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkPriority('low')}>
                    <Badge variant="secondary" className="mr-2">Low</Badge>
                    Low Priority
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    selectedCards.forEach(cardId => updateCard(cardId, { priority: undefined }));
                    setSelectedCards(new Set());
                  }}>
                    Clear Priority
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Labels dropdown */}
              <LabelPicker
                selectedLabels={[]}
                onLabelsChange={handleBulkLabels}
                trigger={
                  <Button size="sm" variant="outline" className="gap-2">
                    <Tag className="h-3 w-3" />
                    Labels
                  </Button>
                }
              />

              {/* Delete button */}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (confirm(`Delete ${selectedCards.size} cards?`)) {
                    selectedCards.forEach(cardId => deleteCard(cardId));
                    setSelectedCards(new Set());
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-muted/50 sticky top-0 z-10">
            <tr className="text-left text-sm">
              <th className="w-12 px-3 py-2">
                <Checkbox
                  checked={selectedCards.size === filteredCards.length && filteredCards.length > 0}
                  onCheckedChange={toggleAllCards}
                />
              </th>
              <th className="px-3 py-2">
                <SortButton column="title">Title</SortButton>
              </th>
              <th className="px-3 py-2">
                <SortButton column="bucket">Bucket</SortButton>
              </th>
              <th className="px-3 py-2">Labels</th>
              <th className="px-3 py-2">
                <SortButton column="priority">Priority</SortButton>
              </th>
              <th className="px-3 py-2">Assignee</th>
              <th className="px-3 py-2">
                <SortButton column="dueDate">Due Date</SortButton>
              </th>
              <th className="px-3 py-2">Progress</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCards.map((card) => {
              const bucket = bucketMap[card.bucketId];
              const isSelected = selectedCards.has(card.id);
              
              return (
                <CardContextMenu key={card.id} card={card}>
                  <tr
                    className={cn(
                      "border-b hover:bg-muted/30 transition-colors",
                      isSelected && "bg-muted/50"
                    )}
                  >
                  <td className="px-3 py-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleCardSelection(card.id)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <span className={cn(
                      "text-sm font-normal",
                      card.completed && "line-through text-muted-foreground"
                    )}>
                      {card.title}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="outline">{bucket.title}</Badge>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      {card.labels && card.labels.length > 0 ? (
                        <>
                          {card.labels.slice(0, 2).map((label) => (
                            <span
                              key={label.id}
                              className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium text-white"
                              style={{ backgroundColor: label.color }}
                            >
                              {label.name}
                            </span>
                          ))}
                          {card.labels.length > 2 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-xs font-medium bg-muted text-muted-foreground">
                              +{card.labels.length - 2}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {card.priority && (
                      <Badge
                        variant={
                          card.priority === 'high' ? 'destructive' :
                          card.priority === 'medium' ? 'default' : 'secondary'
                        }
                        className="capitalize"
                      >
                        {card.priority}
                      </Badge>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {card.assignees && card.assignees.length > 0 ? (
                      <div className="flex -space-x-2">
                        {card.assignees.slice(0, 2).map((assignee, index) => (
                          <div
                            key={index}
                            className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium border-2 border-background"
                            title={assignee}
                          >
                            {assignee.slice(0, 2).toUpperCase()}
                          </div>
                        ))}
                        {card.assignees.length > 2 && (
                          <div className="h-7 w-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium border-2 border-background">
                            +{card.assignees.length - 2}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {card.dueDate ? (
                      <div className={cn(
                        "flex items-center gap-1 text-xs font-medium",
                        {
                          'text-red-600 dark:text-red-400': getDueDateStatus(new Date(card.dueDate), card.completed) === 'overdue',
                          'text-orange-600 dark:text-orange-400': getDueDateStatus(new Date(card.dueDate), card.completed) === 'due-soon',
                          'text-gray-600 dark:text-gray-400': getDueDateStatus(new Date(card.dueDate), card.completed) === 'normal',
                          'text-green-600 dark:text-green-400 line-through': getDueDateStatus(new Date(card.dueDate), card.completed) === 'completed',
                        }
                      )}>
                        <Calendar className="h-3 w-3" />
                        {getRelativeDateString(new Date(card.dueDate))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {card.checklist && card.checklist.length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <CheckSquare className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium">
                          {card.checklist.filter(item => item.completed).length}/{card.checklist.length}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => setEditingCard(card)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeletingCardId(card.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                  </tr>
                </CardContextMenu>
              );
            })}
          </tbody>
        </table>
      </div>

      <CreateCardDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateCard={async (data) => {
          // Get the first bucket if no specific bucket selected
          const targetBucketId = selectedBucketId || buckets[0]?.id;
          if (targetBucketId) {
            const cardId = await createCard(targetBucketId, data.title);
            if (cardId && (data.description || data.priority || data.dueDate || data.labels || data.assignees || data.checklist)) {
              await updateCard(cardId, {
                description: data.description,
                priority: data.priority,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                labels: data.labels,
                assignees: data.assignees,
                checklist: data.checklist,
              });
            }
          }
          setShowCreateDialog(false);
          setSelectedBucketId('');
        }}
      />

      <EditCardDialog
        open={!!editingCard}
        onOpenChange={(open) => !open && setEditingCard(null)}
        card={editingCard}
        onUpdateCard={(id, updates) => {
          updateCard(id, updates);
          setEditingCard(null);
        }}
      />

      <DeleteDialog
        open={!!deletingCardId}
        onOpenChange={(open) => !open && setDeletingCardId(null)}
        onConfirm={handleDelete}
        title="Delete Card"
        description="Are you sure you want to delete this card? This action cannot be undone."
      />
    </div>
  );
}