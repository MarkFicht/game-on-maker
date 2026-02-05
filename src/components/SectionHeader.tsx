// Section header component to reduce repetition
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title?: string;
  icon?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, icon, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center gap-2 rounded-2xl bg-black/90 px-3 py-1", className)}>
      <span className="text-md font-semibold font-display text-white uppercase tracking-widest">{'>'}</span>
      {icon && <span className="emoji-outlined-sm -mt-1.5">{icon}</span>}
      <h2 className="text-md font-semibold font-display text-white uppercase tracking-widest">
        {`${title}`}
      </h2>
      <span className="text-md font-semibold font-display text-white uppercase tracking-widest">{'<'}</span>
    </div>
  );
}
