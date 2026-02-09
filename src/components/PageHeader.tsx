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
    <header className="flex items-center justify-between p-4">
      {/* Left */}
      { backTo && backTo !== '/settings' && (
        <Link to={backTo} onClick={() => audioService.play('tap')}>
          <Button variant="ghost" size="icon" className="text-white btn-3d">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
      )}
      { backTo === '/settings' && (
        <Link to={backTo} onClick={() => audioService.play('tap')}>
          <Button variant="ghost" size="icon" className="text-white btn-3d">
            <Settings className="w-5 h-5" />
          </Button>
        </Link>
      )}
      { onBack && (
        <Button variant="ghost" size="icon" onClick={handleBackClick} className="text-white btn-3d">
          <ArrowLeft className="w-5 h-5" />
        </Button>
      )}
      
      {/* Center */}
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="label-3d font-display text-xl md:text-2xl font-bold text-white bg-card overlay-darker rounded-lg px-4 py-1"
      >
        {title}
      </motion.h1>
      
      {/* Right */}
      <SoundToggle />
    </header>
  );
}

export default PageHeader;
