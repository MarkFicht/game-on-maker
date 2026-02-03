// Reusable setting row component
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface SettingRowProps {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}

export function SettingRow({ icon: Icon, label, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Icon className="w-5 h-5 text-muted-foreground" />
        <p className="font-medium text-foreground">{label}</p>
      </div>
      {children}
    </div>
  );
}
