// Settings Page
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Volume2, Vibrate, Shield, RefreshCw, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useSettings } from '@/hooks/useSettings';
import { usePremium } from '@/hooks/usePremium';
import { toast } from 'sonner';

export default function Settings() {
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const { restore, status, loading: premiumLoading } = usePremium();
  
  const handleRestorePurchases = async () => {
    await restore();
    if (status.isActive) {
      toast.success('Purchases restored!');
    } else {
      toast.info('No purchases found.');
    }
  };
  
  if (settingsLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background safe-top safe-bottom safe-x">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 border-b border-border/50">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="font-display text-xl font-bold text-foreground">
          Settings
        </h1>
      </header>
      
      {/* Settings list */}
      <main className="flex-1 overflow-y-auto">
        {/* Game settings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Game
          </h2>
          
          {/* Round duration */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium text-foreground">Round Duration</p>
                <p className="text-sm text-muted-foreground">{settings.roundDuration} seconds</p>
              </div>
            </div>
            <Slider
              value={[settings.roundDuration]}
              onValueChange={([value]) => updateSettings({ roundDuration: value })}
              min={30}
              max={120}
              step={10}
              className="w-full"
            />
          </div>
        </motion.section>
        
        <Separator />
        
        {/* Sound & Haptics */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 space-y-4"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Sound & Haptics
          </h2>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Volume2 className="w-5 h-5 text-muted-foreground" />
              <p className="font-medium text-foreground">Sound Effects</p>
            </div>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Vibrate className="w-5 h-5 text-muted-foreground" />
              <p className="font-medium text-foreground">Vibration</p>
            </div>
            <Switch
              checked={settings.vibrationEnabled}
              onCheckedChange={(checked) => updateSettings({ vibrationEnabled: checked })}
            />
          </div>
        </motion.section>
        
        <Separator />
        
        {/* Purchases */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 space-y-4"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Purchases
          </h2>
          
          <Button
            variant="outline"
            onClick={handleRestorePurchases}
            disabled={premiumLoading}
            className="w-full justify-start"
          >
            <RefreshCw className="w-5 h-5 mr-4 text-muted-foreground" />
            Restore Purchases
          </Button>
          
          {status.isActive && (
            <div className="p-3 rounded-lg bg-success/10 border border-success/20">
              <p className="text-sm text-success font-medium">
                ✓ Premium active
              </p>
            </div>
          )}
        </motion.section>
        
        <Separator />
        
        {/* Legal */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 space-y-4"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Legal
          </h2>
          
          <Link to="/privacy">
            <Button variant="ghost" className="w-full justify-between">
              <div className="flex items-center gap-4">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span>Privacy Policy</span>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </Button>
          </Link>
        </motion.section>
        
        {/* Version */}
        <div className="p-4 text-center text-sm text-muted-foreground">
          <p>WordRush v1.0.0</p>
          <p className="text-xs mt-1">Made with ❤️</p>
        </div>
      </main>
    </div>
  );
}
