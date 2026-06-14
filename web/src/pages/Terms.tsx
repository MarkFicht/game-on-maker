import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/PageHeader';
import { DelayedFadeIn } from '@/components/animated';

export default function Terms() {
  return (
    <PageLayout>
      <PageHeader title="Terms of Service" backTo="/settings" />

      <main className="flex-1 overflow-y-auto m-4 p-4 rounded-xl bg-muted/90">
        <DelayedFadeIn className="prose prose-invert max-w-none text-sm leading-relaxed">

          <p className="text-muted-foreground mb-6">
            Last updated: June 14, 2026
          </p>

          <p className="mb-4">
            These Terms of Service ("Terms") govern your use of WordRush, developed by Marek Ficht
            ("Developer"). By downloading or using the app, you agree to these Terms.
          </p>

          <h2 className="text-base font-semibold text-foreground mt-6 mb-2">1. License</h2>
          <p className="text-muted-foreground mb-4">
            The Developer grants you a personal, non-exclusive, non-transferable, revocable license
            to use WordRush for personal, non-commercial purposes on devices you own or control,
            subject to these Terms and the app store rules under which you obtained the app.
          </p>

          <h2 className="text-base font-semibold text-foreground mt-6 mb-2">2. In-App Purchases</h2>
          <p className="text-muted-foreground mb-4">
            WordRush offers a one-time Premium purchase that removes ads and unlocks additional
            content. All purchases are processed by Apple App Store or Google Play Store and are
            subject to their respective terms. Purchases are non-refundable except as required by
            applicable law or the store's own refund policy. Premium status is tied to your store
            account and can be restored on other devices using the "Restore Purchases" option.
          </p>

          <h2 className="text-base font-semibold text-foreground mt-6 mb-2">3. Acceptable Use</h2>
          <p className="text-muted-foreground mb-2">You agree not to:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
            <li>Reverse engineer, decompile, or disassemble the app</li>
            <li>Use the app for any unlawful purpose</li>
            <li>Attempt to bypass in-app purchase verification</li>
            <li>Copy or redistribute any content from the app</li>
          </ul>

          <h2 className="text-base font-semibold text-foreground mt-6 mb-2">4. Disclaimer of Warranties</h2>
          <p className="text-muted-foreground mb-4">
            WordRush is provided "as is" without warranties of any kind, either express or implied.
            The Developer does not warrant that the app will be uninterrupted, error-free, or free
            of viruses or other harmful components.
          </p>

          <h2 className="text-base font-semibold text-foreground mt-6 mb-2">5. Limitation of Liability</h2>
          <p className="text-muted-foreground mb-4">
            To the maximum extent permitted by applicable law, the Developer shall not be liable
            for any indirect, incidental, special, or consequential damages arising from your use
            of, or inability to use, the app.
          </p>

          <h2 className="text-base font-semibold text-foreground mt-6 mb-2">6. Changes to the App and Terms</h2>
          <p className="text-muted-foreground mb-4">
            The Developer reserves the right to modify, suspend, or discontinue the app or these
            Terms at any time. Continued use of the app after changes constitutes acceptance of
            the updated Terms.
          </p>

          <h2 className="text-base font-semibold text-foreground mt-6 mb-2">7. Governing Law</h2>
          <p className="text-muted-foreground mb-4">
            These Terms are governed by the laws of Poland. Any disputes shall be resolved in
            the competent courts of Poland.
          </p>

          <h2 className="text-base font-semibold text-foreground mt-6 mb-2">8. Contact</h2>
          <p className="text-muted-foreground mb-4">
            For questions about these Terms, contact:{' '}
            <a href="mailto:marekficht@gmail.com" className="text-primary underline">
              marekficht@gmail.com
            </a>
          </p>

        </DelayedFadeIn>
      </main>
    </PageLayout>
  );
}
