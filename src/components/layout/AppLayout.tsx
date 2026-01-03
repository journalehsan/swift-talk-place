import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, useSidebarContext } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayoutContent({ children }: AppLayoutProps) {
  const { collapsed } = useSidebarContext();

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className={cn(
        "min-h-screen transition-all duration-300 flex flex-col",
        collapsed ? "pl-16" : "pl-64"
      )}>
        <TopBar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}
