// Reusable stat card component
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  value: string | number;
  label: string;
}

export function StatCard({ icon: Icon, iconColor, value, label }: StatCardProps) {
  return (
    <div className="game-card p-3 text-center">
      <Icon className={`w-4 h-4 ${iconColor} mx-auto mb-1`} />
      <p className="font-display text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
