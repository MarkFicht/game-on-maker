import { Animated } from 'react-native';

export type EntranceAnim = {
  opacity: Animated.Value;
  translateY: Animated.Value;
};

export function makeEntranceAnim(): EntranceAnim {
  return {
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(24),
  };
}

function makeOne(anim: EntranceAnim, delay: number): Animated.CompositeAnimation {
  const fade = Animated.timing(anim.opacity, { toValue: 1, duration: 260, useNativeDriver: true });
  const slide = Animated.spring(anim.translateY, {
    toValue: 0,
    tension: 80,
    friction: 8,
    useNativeDriver: true,
  });
  if (delay <= 0) return Animated.parallel([fade, slide]);
  return Animated.parallel([
    Animated.sequence([Animated.delay(delay), fade]),
    Animated.sequence([Animated.delay(delay), slide]),
  ]);
}

export function startEntranceAll(anims: EntranceAnim[], delayBetween = 75): void {
  anims.forEach(a => {
    a.opacity.setValue(0);
    a.translateY.setValue(24);
  });
  Animated.parallel(anims.map((anim, i) => makeOne(anim, i * delayBetween))).start();
}

export function entranceStyle(anim: EntranceAnim): {
  opacity: Animated.Value;
  transform: [{ translateY: Animated.Value }];
} {
  return { opacity: anim.opacity, transform: [{ translateY: anim.translateY }] };
}
