// Settings Page
import { Clock, Volume2, Vibrate, Shield, RefreshCw, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { PageHeader } from '@/components/PageHeader';
import { PageLayout } from '@/components/PageLayout';
import { SettingRow } from '@/components/SettingRow';
import { CenteredState } from '@/components/CenteredState';
import { FadeInUp } from '@/components/animated';
import { withAudioAsync } from '@/lib/audio-helpers';
import { useSettings } from '@/hooks/useSettings';
import { usePremium } from '@/hooks/usePremium';
import { useAudioMuted } from '@/hooks/useAudioMuted';
import { audioService } from '@/services/audio';
import { toast } from 'sonner';

export default function Settings() {
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const { restore, status, loading: premiumLoading } = usePremium();
  const soundMuted = useAudioMuted();
  
  const updateWithSound = (updates: Partial<typeof settings>) => {
    audioService.play('tap');
    updateSettings(updates);
  };
  
  const handleSoundToggle = (enabled: boolean) => {
    audioService.setMuted(!enabled);
    if (enabled) audioService.play('tap');
  };
  
  const handleRestorePurchases = withAudioAsync('tap', async () => {
    await restore();
    if (status.isActive) {
      audioService.play('unlock');
      toast.success('Purchases restored!');
    } else {
      toast.info('No purchases found.');
    }
  });
  
  if (settingsLoading) return <CenteredState message="Loading..." />;
  
  return (
    <PageLayout>
      <PageHeader title="Settings" backTo="/" />
      
      {/* Settings list */}
      <main className="flex-1 p-4 space-y-4">
        {/* Game settings */}
        <FadeInUp delay={0} className="rounded-xl bg-muted/90 p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground">Game</h2>
          {/* Round duration */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Clock className="w-5 h-5 text-white" />
              <div className="flex-1">
                <p className="font-medium text-foreground">Round Duration</p>
                <p className="text-sm text-white">{settings.roundDuration} seconds</p>
              </div>
            </div>
            <Slider
              value={[settings.roundDuration]}
              onValueChange={([value]) => updateWithSound({ roundDuration: value })}
              min={30}
              max={120}
              step={10}
              className="w-full"
            />
          </div>
        </FadeInUp>
        
        {/* Sound & Haptics */}
        <FadeInUp delay={0.1} className="rounded-xl bg-muted/90 p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground">Sound & Haptics</h2>
          <SettingRow icon={Volume2} label="Sound Effects">
            <Switch checked={!soundMuted} onCheckedChange={handleSoundToggle} />
          </SettingRow>
          
          <SettingRow icon={Vibrate} label="Vibration">
            <Switch
              checked={settings.vibrationEnabled}
              onCheckedChange={(checked) => updateWithSound({ vibrationEnabled: checked })}
            />
          </SettingRow>
        </FadeInUp>
        
        {/* Purchases */}
        <FadeInUp delay={0.2} className="rounded-xl bg-muted/90 p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground">Purchases</h2>
          <Button
            variant="outline"
            onClick={handleRestorePurchases}
            disabled={premiumLoading}
            className="w-full h-12 text-base px-6 rounded-lg btn-3d hover:bg-accent/75"

          >
            <RefreshCw className="w-5 h-5 mr-1 text-white" />
            Restore Purchases
          </Button>
          
          {status.isActive && (
            <div className="w-full h-12 rounded-lg bg-success/10 label-3d flex items-center justify-center">
              <p className="text-base text-success font-medium text-center">
                <span className='mr-2'>✓</span> Premium active
              </p>
            </div>
          )}
        </FadeInUp>
        
        {/* Legal */}
        <FadeInUp delay={0.3} className="rounded-xl bg-muted/90 p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground mb-4">Legal</h2>
          <Link to="/privacy">
            <Button variant="ghost" className="w-full justify-between text-base btn-3d">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-white" />
                <span className="font-medium">Privacy Policy</span>
              </div>
              <ExternalLink className="w-4 h-4 text-white" />
            </Button>
          </Link>
        </FadeInUp>
        
        {/* Version */}
        <FadeInUp delay={0.4} className="p-4 text-center text-sm text-white">
          <p>WordRush v1.0.0</p>
          <p className="text-xs mt-1">Made with ❤️</p>
        </FadeInUp>
      </main>
    </PageLayout>
  );
}
