import { Animated, InteractionManager, Platform } from 'react-native';

export type EntranceAnim = {
  opacity: Animated.Value;
  translateY: Animated.Value;
};

// InteractionManager.runAfterInteractions exists to dodge a *native*
// timing issue (expo-router's unstable useNavigation() re-rendering the
// screen ~300-400ms after mount — see app/settings.tsx). Web doesn't have
// that problem, and react-native-web's InteractionManager isn't tuned the
// same way — deferring through it there just adds a visible delay before
// content fades in, on top of an already-empty background. Run directly
// on web, defer on native.
export function deferEntrance(run: () => void): { cancel: () => void } {
  if (Platform.OS === 'web') {
    run();
    return { cancel: () => {} };
  }
  return InteractionManager.runAfterInteractions(run);
}

// ── Sway (continuous oscillation) ────────────────────────────────────────────
// Full-cycle sequence: 0 → +amp → -amp → 0
// Loop resets to the initial value (0) which equals the last value — no jump.

// Initialize to -amplitude so loop reset (→ initial value) lands at sequence end — no jump.
export function makeSwayAnim(amplitude = 10): Animated.Value {
  return new Animated.Value(-amplitude);
}

export function startSway(
  value: Animated.Value,
  delayMs = 0,
  amplitude = 10,
  halfPeriodMs = 1800,
): void {
  const run = () =>
    Animated.loop(
      Animated.sequence([
        Animated.timing(value, { toValue:  amplitude, duration: halfPeriodMs, useNativeDriver: true }),
        Animated.timing(value, { toValue: -amplitude, duration: halfPeriodMs, useNativeDriver: true }),
      ])
    ).start();
  if (delayMs > 0) setTimeout(run, delayMs);
  else run();
}

// Use as: const rot = useMemo(() => swayInterpolate(value), []);
// Do NOT call inside JSX — each call creates a new AnimatedInterpolation node.
export function swayInterpolate(
  value: Animated.Value,
  amplitude = 10,
): Animated.AnimatedInterpolation<string> {
  return value.interpolate({
    inputRange:  [-amplitude, amplitude],
    outputRange: [`-${amplitude}deg`, `${amplitude}deg`],
  });
}

export function makeEntranceAnim(): EntranceAnim {
  return {
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(24),
  };
}

function makeOne(anim: EntranceAnim, delay: number): Animated.CompositeAnimation {
  const fade = Animated.timing(anim.opacity, { toValue: 1, duration: 400, useNativeDriver: true });
  const slide = Animated.spring(anim.translateY, {
    toValue: 0,
    tension: 50,
    friction: 8,
    useNativeDriver: true,
  });
  if (delay <= 0) return Animated.parallel([fade, slide]);
  return Animated.parallel([
    Animated.sequence([Animated.delay(delay), fade]),
    Animated.sequence([Animated.delay(delay), slide]),
  ]);
}

// Returns the composite animation so a caller whose effect can re-fire more
// than once per logical event (e.g. useFocusEffect under expo-router's
// unstable useNavigation() — see app/settings.tsx) can .stop() a still-running
// previous play-through before starting a new one. Restarting via setValue()
// while the old animation is still mid-flight and driving the same values
// fights it instead of replacing it — looks like "some other animation".
export function startEntranceAll(anims: EntranceAnim[], delayBetween = 110): Animated.CompositeAnimation {
  anims.forEach(a => {
    a.opacity.setValue(0);
    a.translateY.setValue(24);
  });
  const composite = Animated.parallel(anims.map((anim, i) => makeOne(anim, i * delayBetween)));
  composite.start();
  return composite;
}

export function entranceStyle(anim: EntranceAnim): {
  opacity: Animated.Value;
  transform: [{ translateY: Animated.Value }];
} {
  return { opacity: anim.opacity, transform: [{ translateY: anim.translateY }] };
}
