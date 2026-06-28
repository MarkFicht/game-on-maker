import React, { useMemo, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from '../src/shared/navigation';
import { makeEntranceAnim, startEntranceAll, entranceStyle, deferEntrance } from '../src/shared/animation/entrance';

// Pre-baked PNGs for the fixed (non-dynamic) gradients below — see
// scripts/generate-gradients.js. A bitmap blit is cheaper for the GPU to
// composite than computing a gradient shader, and this screen renders a
// lot of these at once. Re-run the script if these color stops change.
const GRAD = {
  durationActive: require('../assets/gradients/duration_active.png'),
  durationInactive: require('../assets/gradients/duration_inactive.png'),
  durationActivePressed: require('../assets/gradients/duration_active_pressed.png'),
  durationInactivePressed: require('../assets/gradients/duration_inactive_pressed.png'),
  durationDepthConvex: require('../assets/gradients/duration_depth_convex.png'),
  durationDepthConcave: require('../assets/gradients/duration_depth_concave.png'),
  switchOff: require('../assets/gradients/switch_off.png'),
  switchOn: require('../assets/gradients/switch_on.png'),
  switchSheen: require('../assets/gradients/switch_sheen.png'),
  // Fill + depth pre-composited — both shared the exact same absoluteFill
  // bounds in the thumb, so this is one fewer Image per switch for free.
  switchThumbCombined: require('../assets/gradients/switch_thumb_combined.png'),
} as const;
import { useSettings } from '../src/game/hooks/useSettings';
import { usePayments } from '../src/core/payments/usePayments';
import { GradientBackground, Button, useHeaderConfig, HEADER_BAR_HEIGHT } from '../src/shared/components';
import { playClickSound } from '../src/shared/sound/clickSound';
import { colors, spacing, borderRadius } from '../src/shared/theme';

const DURATIONS = [30, 60, 90, 120] as const;

// Like StyleSheet.absoluteFill, but overshoots every edge by 1px. Image's
// own borderRadius clipping anti-aliases very slightly differently from
// LinearGradient's, leaving a hairline gap of the dark background showing
// at the rounded corners otherwise — the parent's overflow:hidden crops
// this overscan away, so it's invisible everywhere except that seam.
const IMAGE_FILL = { position: 'absolute', top: -1, left: -1, right: -1, bottom: -1 } as const;

function GlassCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  // No LinearGradient here — the rgba(255,255,255,0.05→0.01) sheen this used
  // to render was almost imperceptible against the card's own background,
  // so it wasn't worth a GPU compositing pass on every one of these (×4).
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const SW_TRACK_W  = 52;
const SW_TRACK_H  = 32;
const SW_THUMB    = 22;
const SW_MARGIN   = 3;
const SW_BORDER   = 1.5;
// switchWrap's borderWidth eats into the area available to its absolutely
// positioned children (border-box sizing) — without subtracting it here,
// the thumb's cumulative rightward travel overshoots its intended resting
// margin, landing almost flush against the track's right edge.
const SW_TRAVEL   = SW_TRACK_W - SW_THUMB - SW_MARGIN * 2 - SW_BORDER * 2;

function CustomSwitch({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  const { settings } = useSettings();
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    Animated.spring(anim, { toValue: value ? 1 : 0, tension: 90, friction: 10, useNativeDriver: true }).start();
  }, [value]);

  const thumbX   = useMemo(() => anim.interpolate({ inputRange: [0, 1], outputRange: [0, SW_TRAVEL] }), []);
  const onAlpha  = anim;
  const offAlpha = useMemo(() => anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), []);

  const handlePress = () => {
    if (settings.soundEnabled) playClickSound();
    onValueChange(!value);
  };

  return (
    <Pressable onPress={handlePress} style={styles.switchWrap}>
      {/* OFF/ON — always mounted (not conditional on isAnimating/value): a
          freshly-mounted local Image needs a frame to decode before its
          first paint, which showed up as a flicker specifically on whichever
          track was mounting fresh mid-crossfade. Two extra Images at rest
          isn't worth that visual glitch. */}
      <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: SW_TRACK_H / 2, opacity: offAlpha, overflow: 'hidden' }]}>
        <Image source={GRAD.switchOff} resizeMode="stretch" style={IMAGE_FILL} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: SW_TRACK_H / 2, opacity: onAlpha, overflow: 'hidden' }]}>
        <Image source={GRAD.switchOn} resizeMode="stretch" style={IMAGE_FILL} />
      </Animated.View>
      {/* Convex sheen */}
      <View style={[StyleSheet.absoluteFill, { borderRadius: SW_TRACK_H / 2, overflow: 'hidden' }]}>
        <Image source={GRAD.switchSheen} resizeMode="stretch" style={IMAGE_FILL} />
      </View>
      {/* Thumb */}
      <Animated.View style={[styles.switchThumb, { transform: [{ translateX: thumbX }] }]}>
        <Image source={GRAD.switchThumbCombined} resizeMode="stretch" style={IMAGE_FILL} />
      </Animated.View>
    </Pressable>
  );
}

function DurationBtn({ duration, isActive, onPress }: { duration: number; isActive: boolean; onPress: () => void }) {
  const { settings } = useSettings();
  const pressAnim    = useRef(new Animated.Value(0)).current;
  const convexOpacity = useMemo(() => pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), []);
  // The "pressed" (concave) gradient layers only exist in the tree while
  // actually pressed — at rest (the vast majority of this screen's
  // lifetime, especially right after mount) there's nothing to crossfade,
  // so don't pay the GPU compositing cost for a layer nobody can see.
  const [isPressed, setIsPressed] = useState(false);
  const onPressIn    = () => {
    if (settings.soundEnabled) playClickSound();
    setIsPressed(true);
    Animated.timing(pressAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };
  const onPressOut   = () => {
    Animated.timing(pressAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setIsPressed(false));
  };

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={styles.durationBtn}>
      <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.md, opacity: convexOpacity, overflow: 'hidden' }]}>
        <Image source={isActive ? GRAD.durationActive : GRAD.durationInactive} resizeMode="stretch" style={IMAGE_FILL} />
      </Animated.View>
      {isPressed && (
        <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.md, opacity: pressAnim, overflow: 'hidden' }]}>
          <Image source={isActive ? GRAD.durationActivePressed : GRAD.durationInactivePressed} resizeMode="stretch" style={IMAGE_FILL} />
        </Animated.View>
      )}
      <View style={[styles.durationInner, isActive && styles.durationInnerActive, { overflow: 'hidden' }]}>
        {isActive && (
          <>
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: convexOpacity }]}>
              <Image source={GRAD.durationDepthConvex} resizeMode="stretch" style={IMAGE_FILL} />
            </Animated.View>
            {isPressed && (
              <Animated.View style={[StyleSheet.absoluteFill, { opacity: pressAnim }]}>
                <Image source={GRAD.durationDepthConcave} resizeMode="stretch" style={IMAGE_FILL} />
              </Animated.View>
            )}
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
  const { restore, isRestoring, isPremium, isLoading: paymentsLoading } = usePayments();
  console.log('[PERF] SettingsScreen render', JSON.stringify({ loading, roundDuration: settings.roundDuration, soundEnabled: settings.soundEnabled, isRestoring, isPremium, paymentsLoading }), Date.now());
  useHeaderConfig({ title: 'Ustawienia', showBack: true });

  const anims = useMemo(() => [
    makeEntranceAnim(), // Gra
    makeEntranceAnim(), // Dźwięk
    makeEntranceAnim(), // Zakupy
    makeEntranceAnim(), // Prawne
  ], []);

  useEffect(() => {
    console.log('[PERF] SettingsScreen mounted (useEffect)', Date.now());
    // expo-router's useNavigation() (used internally by useHeaderConfig's
    // useFocusEffect) returns an unstable reference that changes on *any*
    // navigation in the app — confirmed via its source in
    // node_modules/expo-router/build/useFocusEffect.js, deps array
    // [effect, navigation, optionalNavigation]. That causes a redundant
    // re-render of this screen ~300-400ms after mount (known, accepted,
    // unfixed expo-router issue: expo/expo#35383, #40443) — landing right
    // as "Gra" (the only section with delay:0) is mid-entrance-animation,
    // visible as a stutter. runAfterInteractions defers the animation start
    // until that settles, instead of guessing a fixed delay.
    const handle = deferEntrance(() => {
      startEntranceAll(anims);
    });
    return () => handle.cancel();
  }, []);

  // TEMP PERF: logs every onLayout call per section, including any *repeat*
  // calls after the first — a section re-laying-out after its first pass is
  // exactly what a "jump" would look like (position changing post-mount).
  const layoutCounts = useRef<Record<string, number>>({});
  const logLayout = (label: string) => (e: { nativeEvent: { layout: { y: number; height: number } } }) => {
    const n = (layoutCounts.current[label] ?? 0) + 1;
    layoutCounts.current[label] = n;
    const { y, height } = e.nativeEvent.layout;
    console.log(`[PERF] layout #${n} "${label}" y=${y} h=${height}`, Date.now());
  };

  if (loading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safe}>
          <View style={{ height: HEADER_BAR_HEIGHT }} />
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
        <View style={{ height: HEADER_BAR_HEIGHT }} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Game settings */}
          <Animated.View style={entranceStyle(anims[0])} onLayout={logLayout('Gra')}>
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
          <Animated.View style={entranceStyle(anims[1])} onLayout={logLayout('Dzwiek')}>
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
          <Animated.View style={entranceStyle(anims[2])} onLayout={logLayout('Zakupy')}>
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
          <Animated.View style={entranceStyle(anims[3])} onLayout={logLayout('Prawne')}>
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

          <Text style={styles.version}>WordRushMF v1.0.0{'\n'}Made with ❤️</Text>
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
    backgroundColor: 'transparent',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  switchThumb: {
    // Explicit absolute position (not flex flow + marginLeft) — mixed with
    // the absolutely-positioned OFF/ON/sheen siblings, the flex-flow
    // position wasn't landing at the same offset from each edge, leaving
    // the thumb's padding from the track border asymmetric between states.
    position: 'absolute',
    left: SW_MARGIN,
    // Same border-box correction as SW_TRAVEL — the track's effective
    // content height is SW_TRACK_H minus the border on top+bottom.
    top: (SW_TRACK_H - SW_BORDER * 2 - SW_THUMB) / 2,
    width: SW_THUMB,
    height: SW_THUMB,
    borderRadius: SW_THUMB / 2,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 5,
    elevation: 6,
  },
});
