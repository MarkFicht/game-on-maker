// Page layout wrapper to reduce repetitive className
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export function PageLayout({ children, className}: PageLayoutProps) {
  return (
    <div 
      className={cn(
        "min-h-[100dvh] flex flex-col safe-top safe-bottom safe-x",
        className
      )}
    >
      {children}
    </div>
  );
}
