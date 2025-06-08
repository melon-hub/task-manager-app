import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { DebugOverlay } from "@/components/debug/DebugOverlay";
import { cookies } from 'next/headers';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaskFlow - Professional Task Management",
  description: "A powerful task management app combining the best of Trello, Planner, and Lists",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value as 'light' | 'dark' | 'system' | undefined;
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className} suppressHydrationWarning>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = document.cookie.match(/theme=([^;]+)/)?.[1];
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isDark = theme === 'dark' || (!theme && prefersDark) || (theme === 'system' && prefersDark);
                if (isDark) document.documentElement.classList.add('dark');
              })();
            `,
          }}
        />
        <ThemeProvider defaultTheme={theme || 'system'}>
          <div className="flex h-screen" suppressHydrationWarning>
            <Sidebar />
            <main className="flex-1 overflow-auto bg-background">
              {children}
            </main>
          </div>
          <DebugOverlay />
          <Toaster 
            position="bottom-center" 
            expand={false}
            richColors
            theme={theme === 'dark' || theme === 'system' ? 'dark' : 'light'}
            className="toaster"
            toastOptions={{
              classNames: {
                toast: 'bg-background border-border shadow-lg',
                title: 'text-foreground font-medium text-sm',
                description: 'text-muted-foreground text-sm',
                actionButton: 'bg-primary text-primary-foreground hover:bg-primary/90 font-medium',
                cancelButton: 'bg-muted text-foreground hover:bg-muted/80',
                closeButton: 'bg-background border-border hover:bg-muted',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}