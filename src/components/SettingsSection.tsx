// Reusable settings section with separator
import { ReactNode } from 'react';
import { FadeInUp } from '@/components/animated';
import { SectionHeader } from '@/components/SectionHeader';
import { Separator } from '@/components/ui/separator';

interface SettingsSectionProps {
  title: string;
  delay?: number;
  children: ReactNode;
  showSeparator?: boolean;
}

export function SettingsSection({ title, delay = 0, children, showSeparator = true }: SettingsSectionProps) {
  return (
    <>
      <FadeInUp delay={delay} className="p-4 space-y-4">
        <SectionHeader className="mb-4">{title}</SectionHeader>
        {children}
      </FadeInUp>
      {showSeparator && <Separator />}
    </>
  );
}
