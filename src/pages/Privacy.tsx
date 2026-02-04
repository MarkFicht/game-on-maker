// Privacy Policy Page - Placeholder
import { motion } from 'framer-motion';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { DelayedFadeIn } from '@/components/animated';
import { SectionHeading } from '@/components/ui/section-heading';

export default function Privacy() {
  return (
    <PageLayout>
      {/* Header */}
      <header className="flex items-center gap-4 p-4 border-b border-border/50 overlay-dark">
        <BackButton to="/settings" />
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-xl font-bold text-gradient-primary"
        >
          Privacy Policy
        </motion.h1>
      </header>
      
      {/* Content */}
      <main className="flex-1 overflow-y-auto m-4 p-4 rounded-xl bg-muted/85">
        <DelayedFadeIn className="prose prose-invert max-w-none">
          <p className="text-muted-foreground text-sm mb-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <SectionHeading>1. Information We Collect</SectionHeading>
          <p className="text-muted-foreground mb-4">
            WordRush collects minimal data to provide our services:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
            <li>Game statistics (scores, gameplay time) - stored locally on your device</li>
            <li>Purchase history - managed by app stores (Apple/Google)</li>
            <li>Anonymous analytics - for improving the app experience</li>
          </ul>
          
          <SectionHeading>2. Advertising</SectionHeading>
          <p className="text-muted-foreground mb-4">
            Our app may display advertisements. We use advertising partners who may collect 
            information to show personalized ads. You can opt out of personalized advertising 
            in your device settings.
          </p>
          
          <SectionHeading>3. In-App Purchases</SectionHeading>
          <p className="text-muted-foreground mb-4">
            Purchases are processed through Apple App Store or Google Play Store. 
            We do not have access to your payment information.
          </p>
          
          <SectionHeading>4. Data Storage</SectionHeading>
          <p className="text-muted-foreground mb-4">
            All game data is stored locally on your device. We do not maintain 
            user accounts or store personal data on our servers.
          </p>
          
          <SectionHeading>5. Children's Privacy</SectionHeading>
          <p className="text-muted-foreground mb-4">
            WordRush is suitable for all ages. We do not knowingly collect 
            personal information from children under 13.
          </p>
          
          <SectionHeading>6. Contact</SectionHeading>
          <p className="text-muted-foreground mb-4">
            For privacy questions, contact us at: privacy@example.com
          </p>
          
          <div className="mt-8 p-4 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-warning text-sm font-medium">
              ⚠️ This is a placeholder privacy policy. Before publishing your app, 
              replace this with a real privacy policy that complies with GDPR, CCPA, 
              and app store requirements.
            </p>
          </div>
        </DelayedFadeIn>
      </main>
    </PageLayout>
  );
}
