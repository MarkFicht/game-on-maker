// Section header component to reduce repetition
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function SectionHeader({ children, icon, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {icon}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {children}
      </h2>
    </div>
  );
}
