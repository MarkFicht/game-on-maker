// Reusable deck section with header and list
import { ReactNode } from 'react';
import { FadeInUp } from '@/components/animated';
import { SectionHeader } from '@/components/SectionHeader';

interface DeckSectionProps {
  title: string;
  icon?: ReactNode;
  delay?: number;
  children: ReactNode;
}

export function DeckSection({ title, icon, delay = 0, children }: DeckSectionProps) {
  return (
    <FadeInUp delay={delay}>
      <div className="bg-card rounded-xl px-4 py-2 mb-3">
        <SectionHeader icon={icon} className="m-0 justify-center text-white">
          {title}
        </SectionHeader>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </FadeInUp>
  );
}
