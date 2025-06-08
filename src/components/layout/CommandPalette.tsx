'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useBoardStore } from '@/lib/store/boardStore';
import { useRouter } from 'next/navigation';
import { Search, FileText, Settings, Home, Hash, Tag, Calendar, CheckSquare } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { cards, buckets, currentBoard } = useBoardStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Type a command or search..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
            <Command.Empty className="py-6 text-center text-sm">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation">
              <Command.Item
                onSelect={() => {
                  router.push('/dashboard');
                  setOpen(false);
                }}
                className="flex items-center gap-2 cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <Home className="h-4 w-4" />
                <span>Go to Dashboard</span>
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  router.push('/boards');
                  setOpen(false);
                }}
                className="flex items-center gap-2 cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <FileText className="h-4 w-4" />
                <span>View All Boards</span>
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  router.push('/settings');
                  setOpen(false);
                }}
                className="flex items-center gap-2 cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Command.Item>
            </Command.Group>


            {currentBoard && buckets.length > 0 && (
              <Command.Group heading="Lists">
                {buckets.map((bucket) => (
                  <Command.Item
                    key={bucket.id}
                    value={`bucket-${bucket.title}-${bucket.id}`}
                    onSelect={() => {
                      // Could implement scroll to bucket functionality
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
                  >
                    <Hash className="h-4 w-4" />
                    <span>{bucket.title}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {cards.filter(c => c.bucketId === bucket.id).length} cards
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}


            <Command.Group heading="Actions">
              <Command.Item
                onSelect={() => {
                  const event = new KeyboardEvent('keydown', { key: 'n' });
                  document.dispatchEvent(event);
                  setOpen(false);
                }}
                className="flex items-center gap-2 cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <FileText className="h-4 w-4" />
                <span>Create New Card</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  N
                </kbd>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}