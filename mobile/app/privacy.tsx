import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground, PageHeader } from '../src/shared/components';
import { colors, spacing, borderRadius } from '../src/shared/theme';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <Text style={styles.body}>{children}</Text>;
}

function Li({ children }: { children: string }) {
  return (
    <View style={styles.liRow}>
      <Text style={styles.bullet}>•</Text>
      <Text style={[styles.body, styles.liText]}>{children}</Text>
    </View>
  );
}

export default function PrivacyScreen() {
  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <PageHeader title="Polityka prywatności" showBack />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.updated}>Ostatnia aktualizacja: 14 czerwca 2026</Text>

          <P>
            WordRushMF jest aplikacją stworzoną przez Marka Fichta. Ta polityka prywatności
            wyjaśnia, jakie dane są zbierane, jak są wykorzystywane oraz jakie masz prawa.
          </P>

          <Section title="1. Zbierane dane">
            <P>
              WordRushMF nie wymaga rejestracji i nie zbiera danych osobowych bezpośrednio.
              Poniższe dane mogą być zbierane przez zintegrowane usługi zewnętrzne:
            </P>
            <Li>Identyfikatory urządzenia — używane przez Google AdMob do wyświetlania reklam</Li>
            <Li>Historia zakupów — zarządzana wyłącznie przez App Store lub Google Play</Li>
            <Li>Anonimowe dane użytkowania — Firebase Analytics (bez imienia, e-maila ani lokalizacji)</Li>
            <Li>Dane gry (wyniki, ustawienia) — przechowywane lokalnie na urządzeniu, nigdy nie wysyłane</Li>
          </Section>

          <Section title="2. Usługi zewnętrzne">
            <P>Aplikacja korzysta z następujących usług, z których każda ma własną politykę prywatności:</P>
            <Li>Google AdMob — reklamy (policies.google.com/privacy)</Li>
            <Li>Firebase / Google Analytics — anonimowe statystyki (policies.google.com/privacy)</Li>
            <Li>RevenueCat — zarządzanie zakupami (revenuecat.com/privacy)</Li>
          </Section>

          <Section title="3. Reklamy">
            <P>
              Darmowa wersja WordRushMF wyświetla reklamy dostarczane przez Google AdMob.
              Reklamy mogą być spersonalizowane na podstawie ustawień urządzenia i udzielonej zgody.
              Możesz zrezygnować ze spersonalizowanych reklam w ustawieniach systemu
              (iOS: Ustawienia → Prywatność → Śledzenie; Android: Ustawienia → Google → Reklamy).
              Zakup WordRushMF Premium trwale usuwa wszystkie reklamy.
            </P>
          </Section>

          <Section title="4. Zakupy w aplikacji">
            <P>
              Zakupy premium są przetwarzane wyłącznie przez App Store lub Google Play.
              Nie mamy dostępu do danych płatniczych. Status premium jest weryfikowany przez
              RevenueCat przy użyciu anonimowych identyfikatorów.
            </P>
          </Section>

          <Section title="5. Przechowywanie danych">
            <P>
              Ustawienia i wyniki gry są przechowywane lokalnie na urządzeniu i usuwane
              po odinstalowaniu aplikacji. Nie prowadzimy kont użytkowników ani nie
              przechowujemy danych osobowych na naszych serwerach.
            </P>
          </Section>

          <Section title="6. Prywatność dzieci">
            <P>
              WordRushMF nie jest skierowany do dzieci poniżej 13. roku życia. Nie zbieramy
              świadomie danych osobowych od dzieci. Jeśli uważasz, że dziecko podało takie
              dane, skontaktuj się z nami — niezwłocznie je usuniemy.
            </P>
          </Section>

          <Section title="7. Twoje prawa (RODO)">
            <P>Jeśli przebywasz na terenie EOG, masz prawo do:</P>
            <Li>Dostępu do danych, które przechowujemy</Li>
            <Li>Żądania usunięcia swoich danych</Li>
            <Li>Rezygnacji ze spersonalizowanych reklam (patrz sekcja 3)</Li>
            <Li>Wycofania zgody w dowolnym momencie</Li>
            <P>
              Ponieważ niemal wszystkie dane są przechowywane lokalnie, odinstalowanie
              aplikacji jest najszybszym sposobem na skorzystanie z większości tych praw.
            </P>
          </Section>

          <Section title="8. Zmiany polityki">
            <P>
              Możemy aktualizować tę politykę. Zmiany zostaną opublikowane w aplikacji
              z nową datą. Dalsze korzystanie z aplikacji po zmianach oznacza akceptację
              zaktualizowanej polityki.
            </P>
          </Section>

          <Section title="9. Kontakt">
            <P>W sprawach prywatności napisz na: marekficht@gmail.com</P>
          </Section>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  updated: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  body: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  liRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingLeft: spacing.xs,
  },
  bullet: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  liText: {
    flex: 1,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
