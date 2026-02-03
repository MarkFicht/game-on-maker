// Reusable back button component
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { withAudio } from '@/lib/audio-helpers';

interface BackButtonProps {
  to: string;
  onClick?: () => void;
}

export function BackButton({ to, onClick }: BackButtonProps) {
  return (
    <Link to={to} onClick={onClick ? withAudio('tap', onClick) : withAudio('tap', () => {})}>
      <Button variant="ghost" size="icon">
        <ArrowLeft className="w-5 h-5" />
      </Button>
    </Link>
  );
}
