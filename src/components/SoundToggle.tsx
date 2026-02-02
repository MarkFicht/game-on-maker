// Sound Toggle Component
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { audioService } from '@/services/audio';

interface SoundToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SoundToggle({ className = '', size = 'md' }: SoundToggleProps) {
  const [muted, setMuted] = useState(audioService.isMuted());

  useEffect(() => {
    const unsubscribe = audioService.subscribe(setMuted);
    return unsubscribe;
  }, []);

  const handleToggle = () => {
    const newMuted = audioService.toggleMute();
    if (!newMuted) {
      // Play a tap sound to confirm sound is on
      audioService.play('tap');
    }
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <motion.div whileTap={{ scale: 0.9 }}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className={`text-muted-foreground hover:text-foreground ${className}`}
        aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      >
        {muted ? (
          <VolumeX className={iconSize} />
        ) : (
          <Volume2 className={iconSize} />
        )}
      </Button>
    </motion.div>
  );
}
