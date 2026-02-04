// Reusable page header component
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SoundToggle } from '@/components/SoundToggle';
import { audioService } from '@/services/audio';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  backTo?: string;
  onBack?: () => void;
  showSound?: boolean;
  rightContent?: ReactNode;
  bordered?: boolean;
  playSound?: boolean;
}

export function PageHeader({ 
  title, 
  backTo, 
  onBack,
  showSound = false,
  rightContent,
  bordered = true,
  playSound = false
}: PageHeaderProps) {
  const handleBackClick = () => {
    if (playSound) audioService.play('tap');
    onBack?.();
  };

  return (
    <header className="flex items-center justify-between p-4 overlay-dark">
      {backTo || onBack ? (
        backTo ? (
          <Link to={backTo} onClick={playSound ? () => audioService.play('tap') : undefined}>
            <Button variant="ghost" size="icon" className="text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        ) : (
          <Button variant="ghost" size="icon" onClick={handleBackClick} className="text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )
      ) : (
        <div />
      )}
      
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-xl font-bold text-gradient-primary"
      >
        {title}
      </motion.h1>
      
      {showSound ? <SoundToggle /> : rightContent || <div />}
    </header>
  );
}

export default PageHeader;
