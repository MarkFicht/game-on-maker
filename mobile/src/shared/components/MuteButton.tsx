import { useRef, useMemo } from 'react';
import { View, Pressable, Text, StyleSheet, Animated, Image } from 'react-native';
import { useSettings } from '../../game/hooks/useSettings';
import { playClickSound } from '../sound/clickSound';

// Pre-baked PNGs — see scripts/generate-gradients.js. Same colors as
// PageHeader's HeaderBtn, shared images.
const CIRCLE_BEVEL_CONVEX_IMG = require('../../../assets/gradients/circle_bevel_convex.png');
const CIRCLE_BEVEL_CONCAVE_IMG = require('../../../assets/gradients/circle_bevel_concave.png');
const CIRCLE_DEPTH_CONVEX_IMG = require('../../../assets/gradients/circle_depth_convex.png');
const CIRCLE_DEPTH_CONCAVE_IMG = require('../../../assets/gradients/circle_depth_concave.png');
const IMAGE_FILL = { position: 'absolute', top: -1, left: -1, right: -1, bottom: -1 } as const;

interface MuteButtonProps {
  size?: 'sm' | 'md';
  icon?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
}

const SIZES = {
  md: { outer: 52, icon: 22 },
  sm: { outer: 40, icon: 17 },
};

export function MuteButton({ size = 'md', icon, onPress, accessibilityLabel }: MuteButtonProps) {
  const { settings, updateSettings } = useSettings();
  const isMuted = !settings.soundEnabled;
  const s = SIZES[size];

  const pressAnim = useRef(new Animated.Value(0)).current;
  const convexOpacity = useMemo(
    () => pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
    [],
  );

  const onPressIn = () => {
    if (settings.soundEnabled) playClickSound();
    Animated.timing(pressAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };
  const onPressOut = () => Animated.timing(pressAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();

  const handlePress = onPress ?? (() => updateSettings({ soundEnabled: !settings.soundEnabled }));
  const displayIcon = icon ?? (isMuted ? '🔇' : '🔊');
  const a11yLabel   = accessibilityLabel ?? (isMuted ? 'Włącz dźwięk' : 'Wycisz');

  return (
    <View style={[styles.shadow, { width: s.outer, height: s.outer, borderRadius: s.outer / 2 }]}>
      <Pressable
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.clip, { width: s.outer, height: s.outer, borderRadius: s.outer / 2 }]}
        accessibilityLabel={a11yLabel}
      >
        {/* styles.clip (above) is the ONLY clip boundary for this whole
            button — nested Views/Images each repeating the same borderRadius
            is a documented Android RN bug (renders the circle as a faceted
            polygon). None of the layers below declare their own
            borderRadius/overflow. */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: convexOpacity }]}>
          <Image source={CIRCLE_BEVEL_CONVEX_IMG} resizeMode="stretch" style={IMAGE_FILL} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: pressAnim }]}>
          <Image source={CIRCLE_BEVEL_CONCAVE_IMG} resizeMode="stretch" style={IMAGE_FILL} />
        </Animated.View>
        <View style={[styles.inner, { width: s.outer, height: s.outer }]}>
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: convexOpacity }]}>
            <Image source={CIRCLE_DEPTH_CONVEX_IMG} resizeMode="stretch" style={IMAGE_FILL} />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: pressAnim }]}>
            <Image source={CIRCLE_DEPTH_CONCAVE_IMG} resizeMode="stretch" style={IMAGE_FILL} />
          </Animated.View>
          <Text style={{ fontSize: s.icon, marginBottom: 2 }}>{displayIcon}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.40,
    shadowRadius: 6,
    // Android only honors `elevation`. Confirmed by direct A/B test on the
    // identical PageHeader icon button: any non-zero elevation on a
    // perfectly circular view makes Android render its Material outline as
    // a faceted octagon instead of a smooth circle. 0 trades away the
    // Android drop shadow for a correct circle; iOS keeps shadowXxx above.
    elevation: 0,
  },
  clip: {
    overflow: 'hidden',
  },
  // No overflow/borderRadius of its own — `clip` above is the single clip
  // boundary for the whole button (see comment at the JSX call site).
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
