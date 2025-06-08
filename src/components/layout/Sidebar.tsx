'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Kanban, 
  Settings,
  ChevronLeft,
  Menu,
  Star,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { usePreferencesStore } from '@/lib/store/preferencesStore';
import { db } from '@/lib/db/schema';
import { Board } from '@/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'All Boards', href: '/boards', icon: Kanban },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const { favoriteBoards, toggleFavoriteBoard, users, activeUser } = usePreferencesStore();

  useEffect(() => {
    // Load boards
    const loadBoards = async () => {
      const boardsData = await db.boards.toArray();
      setBoards(boardsData);
    };
    loadBoards();
  }, []);

  const favoriteBoarsdData = boards.filter(b => favoriteBoards.includes(b.id));
  const currentUser = users.find(u => u.id === activeUser) || users[0];

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-200 flex flex-col h-full bg-sidebar border-r`}>
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed && (
          <h1 className="text-xl font-semibold">TaskFlow</h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {/* Main Navigation */}
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href === '/boards' && pathname.startsWith('/boards/'));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }
              `}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        {/* Favorites Section */}
        {favoriteBoarsdData.length > 0 && (
          <>
            <Separator className="my-3" />
            {!collapsed && (
              <div className="px-3 py-1">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Favorites
                </h3>
              </div>
            )}
            {favoriteBoarsdData.map((board) => {
              const isActive = pathname === `/boards/${board.id}`;
              
              return (
                <div key={board.id} className="group relative">
                  <Link
                    href={`/boards/${board.id}`}
                    className={`
                      flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }
                    `}
                  >
                    <Star className="h-3.5 w-3.5 flex-shrink-0 fill-current" />
                    {!collapsed && <span className="truncate">{board.title}</span>}
                  </Link>
                  {!collapsed && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toggleFavoriteBoard(board.id)}>
                          <Star className="h-4 w-4 mr-2" />
                          Remove from favorites
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            })}
          </>
        )}
      </nav>
      
      <div className="mt-auto p-4 space-y-4">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <div className={`flex items-center gap-3 ${collapsed ? '' : 'flex-1'}`}>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium">{currentUser?.name?.charAt(0).toUpperCase() || 'U'}</span>
            </div>
            {!collapsed && (
              <div>
                <p className="text-sm font-medium">{currentUser?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{currentUser?.email || 'user@example.com'}</p>
              </div>
            )}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}