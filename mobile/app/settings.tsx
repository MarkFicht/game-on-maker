import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, Animated } from 'react-native';
import { router } from 'expo-router';
import { makeEntranceAnim, startEntranceAll, entranceStyle } from '../src/shared/animation/entrance';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings } from '../src/game/hooks/useSettings';
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

const SW_TRACK_W = 52;
const SW_TRACK_H = 30;
const SW_THUMB   = 22;
const SW_MARGIN  = 4;
const SW_TRAVEL  = SW_TRACK_W - SW_THUMB - SW_MARGIN * 2;

function CustomSwitch({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, { toValue: value ? 1 : 0, tension: 150, friction: 10, useNativeDriver: true }).start();
  }, [value]);

  const thumbX   = useMemo(() => anim.interpolate({ inputRange: [0, 1], outputRange: [0, SW_TRAVEL] }), []);
  const onAlpha  = anim;
  const offAlpha = useMemo(() => anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), []);

  return (
    <Pressable onPress={() => onValueChange(!value)} style={styles.switchWrap}>
      {/* OFF */}
      <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: SW_TRACK_H / 2, opacity: offAlpha }]}>
        <LinearGradient colors={['rgba(51,65,85,0.95)', 'rgba(15,23,42,0.95)']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: SW_TRACK_H / 2 }]} />
      </Animated.View>
      {/* ON */}
      <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: SW_TRACK_H / 2, opacity: onAlpha }]}>
        <LinearGradient colors={['#9590EF', '#4F46E5']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: SW_TRACK_H / 2 }]} />
      </Animated.View>
      {/* Convex sheen */}
      <LinearGradient
        colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.14)']}
        locations={[0, 0.4, 0.6, 1]}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: SW_TRACK_H / 2 }]}
        pointerEvents="none"
      />
      {/* Thumb */}
      <Animated.View style={[styles.switchThumb, { transform: [{ translateX: thumbX }] }]}>
        <LinearGradient colors={['#34D399', '#059669']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.20)']}
          locations={[0, 0.4, 0.6, 1]}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </Animated.View>
    </Pressable>
  );
}

function DurationBtn({ duration, isActive, onPress }: { duration: number; isActive: boolean; onPress: () => void }) {
  const pressAnim    = useRef(new Animated.Value(0)).current;
  const convexOpacity = useMemo(() => pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), []);
  const onPressIn    = () => Animated.timing(pressAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  const onPressOut   = () => Animated.timing(pressAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={styles.durationBtn}>
      <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.md, opacity: convexOpacity }]}>
        <LinearGradient
          colors={isActive ? ['#9590EF', '#2F2A89'] : ['rgba(149,144,239,0.22)', 'rgba(47,42,137,0.22)']}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.md }]}
        />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.md, opacity: pressAnim }]}>
        <LinearGradient
          colors={isActive ? ['#2F2A89', '#9590EF'] : ['rgba(47,42,137,0.22)', 'rgba(149,144,239,0.22)']}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.md }]}
        />
      </Animated.View>
      <View style={[styles.durationInner, isActive && styles.durationInnerActive, { overflow: 'hidden' }]}>
        {isActive && (
          <>
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: convexOpacity }]}>
              <LinearGradient colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.18)']} locations={[0, 0.38, 0.62, 1]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} pointerEvents="none" />
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: pressAnim }]}>
              <LinearGradient colors={['rgba(0,0,0,0.18)', 'rgba(0,0,0,0)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.22)']} locations={[0, 0.38, 0.62, 1]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} pointerEvents="none" />
            </Animated.View>
          </>
        )}
        <Text style={[styles.durationText, isActive && styles.durationTextActive]}>{duration}s</Text>
      </View>
    </Pressable>
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
              {DURATIONS.map(d => (
                <DurationBtn
                  key={d}
                  duration={d}
                  isActive={settings.roundDuration === d}
                  onPress={() => updateSettings({ roundDuration: d })}
                />
              ))}
            </View>
          </GlassCard>

          </Animated.View>

          {/* Sound & Haptics */}
          <Animated.View style={entranceStyle(anims[1])}>
          <GlassCard title="Dźwięk i haptyka" icon="🔔">
            <SettingRow label="Efekty dźwiękowe">
              <CustomSwitch value={settings.soundEnabled} onValueChange={v => updateSettings({ soundEnabled: v })} />
            </SettingRow>
            <View style={styles.rowDivider} />
            <SettingRow label="Wibracje">
              <CustomSwitch value={settings.vibrationEnabled} onValueChange={v => updateSettings({ vibrationEnabled: v })} />
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
              onPress={() => router.push('/privacy')}
              variant="secondary"
            />
            <Button
              label="Regulamin"
              onPress={() => router.push('/terms')}
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
  durationBtn: { flex: 1, borderRadius: borderRadius.md },
  durationInner: {
    borderRadius: borderRadius.md - 3,
    margin: 3,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: 'rgba(22,36,58,0.55)',
  },
  durationInnerActive: {
    backgroundColor: colors.primary,
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
  switchWrap: {
    width: SW_TRACK_W,
    height: SW_TRACK_H,
    borderRadius: SW_TRACK_H / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  switchThumb: {
    marginLeft: SW_MARGIN,
    width: SW_THUMB,
    height: SW_THUMB,
    borderRadius: SW_THUMB / 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 5,
    elevation: 6,
  },
});
