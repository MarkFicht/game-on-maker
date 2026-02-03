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
      <SectionHeader icon={icon} className="mb-3">
        {title}
      </SectionHeader>
      <div className="space-y-3">
        {children}
      </div>
    </FadeInUp>
  );
}
