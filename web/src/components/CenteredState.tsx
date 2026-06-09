// Centered error/fallback state component
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface CenteredStateProps {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

export function CenteredState({ message, action, children }: CenteredStateProps) {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground mb-4">{message}</p>
        {action && (
          <Button variant="link" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}
