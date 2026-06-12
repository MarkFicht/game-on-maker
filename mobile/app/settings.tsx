import React, { useMemo, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, Pressable, SafeAreaView, Linking, Animated } from 'react-native';
import { makeEntranceAnim, startEntranceAll, entranceStyle } from '../src/shared/animation/entrance';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings } from '../src/hooks/useSettings';
import { usePayments } from '../src/core/payments/usePayments';
import { GradientBackground, PageHeader, Button } from '../src/shared/components';
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


export default function SettingsScreen() {
  const { settings, updateSettings, loading } = useSettings();
  const { restore, isRestoring } = usePayments();

  const anims = useMemo(() => [
    makeEntranceAnim(), // Gra
    makeEntranceAnim(), // Dźwięk
    makeEntranceAnim(), // Zakupy
    makeEntranceAnim(), // Prawne
  ], []);

  useEffect(() => { startEntranceAll(anims); }, []);

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
          <Animated.View style={entranceStyle(anims[0])}>
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
                        ? ['#9590EF', '#2F2A89']
                        : ['rgba(149,144,239,0.22)', 'rgba(47,42,137,0.22)']}
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

          </Animated.View>

          {/* Sound & Haptics */}
          <Animated.View style={entranceStyle(anims[1])}>
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

          </Animated.View>

          {/* Purchases */}
          <Animated.View style={entranceStyle(anims[2])}>
          <GlassCard title="Zakupy" icon="💳">
            <Button
              label={isRestoring ? 'Przywracanie…' : 'Przywróć zakupy'}
              onPress={restore}
              disabled={isRestoring}
              loading={isRestoring}
              variant="secondary"
            />
          </GlassCard>

          </Animated.View>

          {/* Legal — mirrors web's Settings legal section */}
          <Animated.View style={entranceStyle(anims[3])}>
          <GlassCard title="Prawne" icon="📄">
            <Button
              label="Polityka prywatności"
              onPress={() => Linking.openURL('https://wordrush.app/privacy')}
              variant="secondary"
            />
            <Button
              label="Regulamin"
              onPress={() => Linking.openURL('https://wordrush.app/terms')}
              variant="secondary"
            />
          </GlassCard>

          </Animated.View>

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
    color: colors.white,
    marginTop: -2,
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
    padding: 3,
  },
  durationInner: {
    borderRadius: borderRadius.md - 3,
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
  version: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.white,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
});
