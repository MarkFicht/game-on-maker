import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/PageHeader';
import { DelayedFadeIn } from '@/components/animated';

export default function Privacy() {
  return (
    <PageLayout>
      <PageHeader title="Privacy Policy" backTo="/settings" />

      <main className="flex-1 overflow-y-auto m-4 p-4 rounded-xl bg-muted/90">
        <DelayedFadeIn className="prose prose-invert max-w-none text-sm leading-relaxed">

          <p className="text-muted-foreground mb-6">
            Last updated: June 14, 2026
          </p>

          <p className="mb-4">
            WordRush ("we", "our", "the app") is developed by Marek Ficht. This Privacy Policy explains
            what information is collected, how it is used, and your rights regarding that information.
          </p>

          <h2 className="text-base font-semibold text-foreground mt-6 mb-2">1. Information We Collect</h2>
          <p className="text-muted-foreground mb-2">
            WordRush does not require account registration and does not collect personally identifiable
            information directly. The following data may be collected by third-party SDKs integrated in the app:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
            <li><strong>Device identifiers</strong> — used by Google AdMob to deliver and measure ads</li>
            <li><strong>Purchase history</strong> — managed exclusively by Apple App Store or Google Play Store; we do not access payment data</li>
            <li><strong>Anonymous usage data</strong> — collected by Firebase Analytics to understand how the app is used (no name, email, or location)</li>
            <li><strong>Game data</strong> (scores, settings) — stored locally on your device only, never transmitted</li>
          </ul>

          <h2 className="text-base font-semibold text-foreground mt-6 mb-2">2. Third-Party Services</h2>
          <p className="text-muted-foreground mb-2">
            The app uses the following third-party services, each governed by their own privacy policies:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
            <li><strong>Google AdMob</strong> — advertising (<a href="https://policies.google.com/privacy" className="text-primary underline" target="_blank" rel="noreferrer">Google Privacy Policy</a>)</li>
            <li><strong>Firebase / Google Analytics</strong> — anonymous analytics (<a href="https://policies.google.com/privacy" className="text-primary underline" target="_blank" rel="noreferrer">Google Privacy Policy</a>)</li>
            <li><strong>RevenueCat</strong> — in-app purchase management (<a href="https://www.revenuecat.com/privacy" className="text-primary underline" target="_blank" rel="noreferrer">RevenueCat Privacy Policy</a>)</li>
          </ul>

          <h2 className="text-base font-semibold text-foreground mt-6 mb-2">3. Advertising</h2>
          <p className="text-muted-foreground mb-4">
            The free version of WordRush displays advertisements provided by Google AdMob.
            Ads may be personalized based on your device settings and consent. You can opt out of
            personalized advertising in your device settings (iOS: Settings → Privacy → Tracking;
            Android: Settings → Google → Ads). Purchasing WordRush Premium removes all ads permanently.
          </p>

          <h2 className="text-base font-semibold text-foreground mt-6 mb-2">4. In-App Purchases</h2>
          <p className="text-muted-foreground mb-4">
            Premium purchases are processed entirely by Apple App Store or Google Play Store.
            We do not store or have access to any payment or credit card information.
            Purchase status is verified through RevenueCat using anonymous entitlement identifiers.
          </p>

          <h2 className="text-base font-semibold text-foreground mt-6 mb-2">5. Data Storage &amp; Retention</h2>
          <p className="text-muted-foreground mb-4">
            Game settings and scores are stored locally on your device using AsyncStorage and
            are deleted when you uninstall the app. We do not maintain user accounts or store
            personal data on our servers.
          </p>

          <h2 className="text-base font-semibold text-foreground mt-6 mb-2">6. Children's Privacy</h2>
          <p className="text-muted-foreground mb-4">
            WordRush is not directed at children under the age of 13. We do not knowingly collect
            personal information from children. If you believe a child has provided personal information
            through the app, please contact us and we will delete it promptly.
          </p>

          <h2 className="text-base font-semibold text-foreground mt-6 mb-2">7. Your Rights (GDPR)</h2>
          <p className="text-muted-foreground mb-2">
            If you are located in the European Economic Area, you have the right to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
            <li>Access the personal data we hold about you</li>
            <li>Request deletion of your data</li>
            <li>Opt out of personalized advertising (see Section 3)</li>
            <li>Withdraw consent at any time</li>
          </ul>
          <p className="text-muted-foreground mb-4">
            Since almost all data is stored locally on your device, exercising most of these rights
            can be done simply by uninstalling the app.
          </p>

          <h2 className="text-base font-semibold text-foreground mt-6 mb-2">8. Changes to This Policy</h2>
          <p className="text-muted-foreground mb-4">
            We may update this Privacy Policy from time to time. Changes will be posted on this page
            with an updated date. Continued use of the app after changes constitutes acceptance of
            the updated policy.
          </p>

          <h2 className="text-base font-semibold text-foreground mt-6 mb-2">9. Contact</h2>
          <p className="text-muted-foreground mb-4">
            For privacy questions or data requests, contact us at:{' '}
            <a href="mailto:marekficht@gmail.com" className="text-primary underline">
              marekficht@gmail.com
            </a>
          </p>

        </DelayedFadeIn>
      </main>
    </PageLayout>
  );
}
