// Page layout wrapper to reduce repetitive className
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  overflow?: boolean;
}

export function PageLayout({ children, className, overflow = false }: PageLayoutProps) {
  return (
    <div 
      className={cn(
        "min-h-[100dvh] flex flex-col bg-background safe-top safe-bottom safe-x",
        overflow && "overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}
