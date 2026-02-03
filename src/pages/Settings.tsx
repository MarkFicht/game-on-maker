// Settings Page
import { Clock, Volume2, Vibrate, Shield, RefreshCw, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { PageHeader } from '@/components/PageHeader';
import { PageLayout } from '@/components/PageLayout';
import { SettingsSection } from '@/components/SettingsSection';
import { SettingRow } from '@/components/SettingRow';
import { CenteredState } from '@/components/CenteredState';
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
      <PageHeader title="Settings" backTo="/" playSound />
      
      {/* Settings list */}
      <main className="flex-1 overflow-y-auto">
        {/* Game settings */}
        <SettingsSection title="Game">
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
              onValueChange={([value]) => updateWithSound({ roundDuration: value })}
              min={30}
              max={120}
              step={10}
              className="w-full"
            />
          </div>
        </SettingsSection>
        
        {/* Sound & Haptics */}
        <SettingsSection title="Sound & Haptics" delay={0.1}>
          <SettingRow icon={Volume2} label="Sound Effects">
            <Switch checked={!soundMuted} onCheckedChange={handleSoundToggle} />
          </SettingRow>
          
          <SettingRow icon={Vibrate} label="Vibration">
            <Switch
              checked={settings.vibrationEnabled}
              onCheckedChange={(checked) => updateWithSound({ vibrationEnabled: checked })}
            />
          </SettingRow>
        </SettingsSection>
        
        {/* Purchases */}
        <SettingsSection title="Purchases" delay={0.2}>
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
        </SettingsSection>
        
        {/* Legal */}
        <SettingsSection title="Legal" delay={0.3} showSeparator={false}>
          <Link to="/privacy">
            <Button variant="ghost" className="w-full justify-between">
              <div className="flex items-center gap-4">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span>Privacy Policy</span>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </Button>
          </Link>
        </SettingsSection>
        
        {/* Version */}
        <div className="p-4 text-center text-sm text-muted-foreground">
          <p>WordRush v1.0.0</p>
          <p className="text-xs mt-1">Made with ❤️</p>
        </div>
      </main>
    </PageLayout>
  );
}
