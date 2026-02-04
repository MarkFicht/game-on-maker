// Reusable page header component
import { ArrowLeft, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SoundToggle } from '@/components/SoundToggle';
import { audioService } from '@/services/audio';

interface PageHeaderProps {
  title: string;
  backTo?: string;
  onBack?: () => void;
}

export function PageHeader({ 
  title, 
  backTo, 
  onBack,
}: PageHeaderProps) {
  const handleBackClick = () => {
    audioService.play('tap');
    onBack?.();
  };

  return (
    <header className="flex items-center justify-between p-4 overlay-dark">
      {/* Left */}
      { backTo && backTo !== '/settings' && (
        <Link to={backTo} onClick={() => audioService.play('tap')}>
          <Button variant="ghost" size="icon" className="text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
      )}
      { backTo === '/settings' && (
        <Link to={backTo} onClick={() => audioService.play('tap')}>
          <Button variant="ghost" size="icon" className="text-white">
            <Settings className="w-5 h-5" />
          </Button>
        </Link>
      )}
      { onBack && (
        <Button variant="ghost" size="icon" onClick={handleBackClick} className="text-white">
          <ArrowLeft className="w-5 h-5" />
        </Button>
      )}
      
      {/* Center */}
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-xl font-bold text-gradient-primary"
      >
        {title}
      </motion.h1>
      
      {/* Right */}
      <SoundToggle />
    </header>
  );
}

export default PageHeader;
