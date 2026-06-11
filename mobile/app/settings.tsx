import React from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, Pressable, SafeAreaView, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings } from '../src/hooks/useSettings';
import { usePayments } from '../src/core/payments/usePayments';
import { GradientBackground, PageHeader } from '../src/shared/components';
import { colors, spacing, borderRadius } from '../src/shared/theme';

const DURATIONS = [30, 60, 90, 120] as const;

function GlassCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)']}
        style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.lg }]}
      />
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {children}
    </View>
  );
}

// Reusable link row with 3D bevel
function LinkRow({ icon, label, url }: { icon: string; label: string; url: string }) {
  return (
    <Pressable
      onPress={() => Linking.openURL(url)}
      style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.16)', 'rgba(0,0,0,0.14)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.linkBevel}
      >
        <View style={styles.linkInner}>
          <LinearGradient
            colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.10)']}
            locations={[0, 0.38, 0.62, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <Text style={styles.linkIcon}>{icon}</Text>
          <Text style={styles.linkLabel}>{label}</Text>
          <Text style={styles.linkArrow}>↗</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { settings, updateSettings, loading } = useSettings();
  const { restore, isRestoring } = usePayments();

  if (loading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safe}>
          <View style={styles.centered}>
            <Text style={styles.loadingText}>Ładowanie…</Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <PageHeader title="Ustawienia" showBack />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Game settings */}
          <GlassCard title="Gra" icon="🎮">
            <Text style={styles.durationLabel}>
              Czas rundy: <Text style={styles.durationValue}>{settings.roundDuration}s</Text>
            </Text>
            <View style={styles.durationRow}>
              {DURATIONS.map(d => {
                const isActive = settings.roundDuration === d;
                return (
                  <Pressable
                    key={d}
                    onPress={() => updateSettings({ roundDuration: d })}
                    style={({ pressed }) => [styles.durationBtn, pressed && { opacity: 0.8 }]}
                  >
                    <LinearGradient
                      colors={isActive
                        ? ['rgba(255,255,255,0.48)', 'rgba(0,0,0,0.40)']
                        : ['rgba(255,255,255,0.18)', 'rgba(0,0,0,0.16)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={styles.durationBevel}
                    >
                      {isActive ? (
                        <LinearGradient
                          colors={[colors.primary, '#7C3AED']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.durationInner}
                        >
                          <LinearGradient
                            colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.18)']}
                            locations={[0, 0.38, 0.62, 1]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={StyleSheet.absoluteFill}
                            pointerEvents="none"
                          />
                          <Text style={[styles.durationText, styles.durationTextActive]}>{d}s</Text>
                        </LinearGradient>
                      ) : (
                        <View style={styles.durationInner}>
                          <Text style={styles.durationText}>{d}s</Text>
                        </View>
                      )}
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          {/* Sound & Haptics */}
          <GlassCard title="Dźwięk i haptyka" icon="🔔">
            <SettingRow label="Efekty dźwiękowe">
              <Switch
                value={settings.soundEnabled}
                onValueChange={v => updateSettings({ soundEnabled: v })}
                trackColor={{ false: colors.surfaceElevated, true: colors.primary }}
                thumbColor={colors.white}
              />
            </SettingRow>
            <View style={styles.rowDivider} />
            <SettingRow label="Wibracje">
              <Switch
                value={settings.vibrationEnabled}
                onValueChange={v => updateSettings({ vibrationEnabled: v })}
                trackColor={{ false: colors.surfaceElevated, true: colors.primary }}
                thumbColor={colors.white}
              />
            </SettingRow>
          </GlassCard>

          {/* Purchases */}
          <GlassCard title="Zakupy" icon="💳">
            <Pressable
              onPress={restore}
              disabled={isRestoring}
              style={({ pressed }) => [{ opacity: pressed || isRestoring ? 0.7 : 1 }]}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.22)', 'rgba(0,0,0,0.20)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.restoreBevel}
              >
                <View style={styles.restoreInner}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.12)']}
                    locations={[0, 0.38, 0.62, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                  />
                  <Text style={styles.restoreText}>
                    {isRestoring ? 'Przywracanie…' : '↺  Przywróć zakupy'}
                  </Text>
                </View>
              </LinearGradient>
            </Pressable>
          </GlassCard>

          {/* Legal — mirrors web's Settings legal section */}
          <GlassCard title="Prawne" icon="📄">
            <LinkRow
              icon="🛡"
              label="Polityka prywatności"
              url="https://wordrush.app/privacy"
            />
            <View style={styles.rowDivider} />
            <LinkRow
              icon="📋"
              label="Regulamin"
              url="https://wordrush.app/terms"
            />
          </GlassCard>

          <Text style={styles.version}>WordRush v1.0.0{'\n'}Made with ❤️</Text>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  container: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  card: {
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: -spacing.xs,
  },
  cardIcon: { fontSize: 16 },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  durationLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  durationValue: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  durationRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  durationBtn: { flex: 1 },
  durationBevel: {
    borderRadius: borderRadius.md,
    padding: 2,
  },
  durationInner: {
    borderRadius: borderRadius.md - 2,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: 'rgba(22,36,58,0.55)',
    overflow: 'hidden',
  },
  durationText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  durationTextActive: { color: colors.white },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: 15,
    color: colors.text,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: -spacing.xs,
  },
  restoreBevel: {
    borderRadius: borderRadius.md,
    padding: 2,
  },
  restoreInner: {
    borderRadius: borderRadius.md - 2,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: 'rgba(30,41,59,0.60)',
    overflow: 'hidden',
  },
  restoreText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  // Legal link rows
  linkBevel: {
    borderRadius: borderRadius.md,
    padding: 2,
  },
  linkInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(22,36,58,0.50)',
    borderRadius: borderRadius.md - 2,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  linkIcon: { fontSize: 16 },
  linkLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  linkArrow: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    color: 'rgba(255,255,255,0.60)',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
});
