import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground, PageHeader } from '../src/shared/components';
import { colors, spacing } from '../src/shared/theme';

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

export default function TermsScreen() {
  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <PageHeader title="Regulamin" showBack />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.updated}>Ostatnia aktualizacja: 14 czerwca 2026</Text>

          <P>
            Niniejszy Regulamin ("Regulamin") określa zasady korzystania z aplikacji WordRushMF,
            stworzonej przez Marka Fichta ("Deweloper"). Pobierając lub używając aplikacji,
            akceptujesz niniejszy Regulamin.
          </P>

          <Section title="1. Licencja">
            <P>
              Deweloper udziela Ci osobistej, niewyłącznej, niezbywalnej i odwoływalnej licencji
              na korzystanie z WordRushMF do celów osobistych, niekomercyjnych, na urządzeniach
              będących Twoją własnością lub pod Twoją kontrolą — zgodnie z niniejszym Regulaminem
              i zasadami sklepu, z którego pobrano aplikację.
            </P>
          </Section>

          <Section title="2. Zakupy w aplikacji">
            <P>
              WordRushMF oferuje jednorazowy zakup Premium, który usuwa reklamy i odblokowuje
              dodatkową zawartość. Wszystkie zakupy są przetwarzane przez App Store lub Google Play
              i podlegają ich regulaminom.
            </P>
            <P>
              Zakupy są bezzwrotne, chyba że obowiązujące prawo lub polityka sklepu stanowi inaczej.
              Status Premium jest powiązany z kontem sklepu i można go przywrócić na innych
              urządzeniach opcją "Przywróć zakupy".
            </P>
          </Section>

          <Section title="3. Dozwolone użytkowanie">
            <P>Zobowiązujesz się nie:</P>
            <Li>Dokonywać inżynierii wstecznej, dekompilować ani dezasemblować aplikacji</Li>
            <Li>Używać aplikacji do celów niezgodnych z prawem</Li>
            <Li>Próbować obejść weryfikację zakupów w aplikacji</Li>
            <Li>Kopiować ani rozpowszechniać jakichkolwiek treści z aplikacji</Li>
          </Section>

          <Section title="4. Wyłączenie gwarancji">
            <P>
              WordRushMF jest dostarczany "tak jak jest", bez jakichkolwiek gwarancji, wyraźnych
              ani dorozumianych. Deweloper nie gwarantuje, że aplikacja będzie działać
              nieprzerwanie, bezbłędnie ani bez wirusów czy innych szkodliwych komponentów.
            </P>
          </Section>

          <Section title="5. Ograniczenie odpowiedzialności">
            <P>
              W maksymalnym zakresie dozwolonym przez obowiązujące prawo, Deweloper nie ponosi
              odpowiedzialności za jakiekolwiek pośrednie, przypadkowe, szczególne ani wynikowe
              szkody powstałe w związku z korzystaniem lub niemożnością korzystania z aplikacji.
            </P>
          </Section>

          <Section title="6. Zmiany aplikacji i Regulaminu">
            <P>
              Deweloper zastrzega sobie prawo do modyfikacji, zawieszenia lub zakończenia
              działania aplikacji lub niniejszego Regulaminu w dowolnym czasie. Dalsze
              korzystanie z aplikacji po zmianach oznacza akceptację zaktualizowanego Regulaminu.
            </P>
          </Section>

          <Section title="7. Prawo właściwe">
            <P>
              Niniejszy Regulamin podlega prawu polskiemu. Wszelkie spory będą rozstrzygane przez
              właściwe sądy w Polsce.
            </P>
          </Section>

          <Section title="8. Kontakt">
            <P>W sprawach dotyczących Regulaminu napisz na: marekficht@gmail.com</P>
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
