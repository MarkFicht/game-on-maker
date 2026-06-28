import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { router } from '../navigation';
import { MuteButton } from './MuteButton';
import { colors, spacing, borderRadius } from '../theme';
import { useSettings } from '../../game/hooks/useSettings';
import { playClickSound } from '../sound/clickSound';
import { usePersistentHeaderConfig } from './HeaderConfig';

// Pre-baked PNGs — see scripts/generate-gradients.js. The title badge has
// no press state, so these are just two always-rendered static images.
const BADGE_BEVEL_IMG = require('../../../assets/gradients/badge_bevel.png');
const BADGE_DEPTH_TITLE_IMG = require('../../../assets/gradients/badge_depth_title.png');
// HeaderBtn's bevel/depth — same colors as MuteButton, shared images.
const CIRCLE_BEVEL_CONVEX_IMG = require('../../../assets/gradients/circle_bevel_convex.png');
const CIRCLE_BEVEL_CONCAVE_IMG = require('../../../assets/gradients/circle_bevel_concave.png');
const CIRCLE_DEPTH_CONVEX_IMG = require('../../../assets/gradients/circle_depth_convex.png');
const CIRCLE_DEPTH_CONCAVE_IMG = require('../../../assets/gradients/circle_depth_concave.png');
const IMAGE_FILL = { position: 'absolute', top: -1, left: -1, right: -1, bottom: -1 } as const;

interface PageHeaderProps {
  title?: string;
  /** shows ⚙️ on left → navigates to /settings (home screen only) */
  isHome?: boolean;
  /** shows ← on left via stack navigator */
  showBack?: boolean;
  /** custom back handler — also shows ← if provided */
  onBack?: () => void;
}

const BTN = 52;
// Bar's own height (excludes the safe-area top inset, which the persistent
// header and each screen's own SafeAreaView both add identically on top of
// this) — screens reserve this much space so their content starts right
// where the floating header ends.
export const HEADER_BAR_HEIGHT = BTN + spacing.md + spacing.sm;

function BackChevron() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18L9 12L15 6"
        stroke="white"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function HeaderBtn({ onPress, label }: { onPress: () => void; label: string }) {
  const { settings } = useSettings();
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

  return (
    <View style={styles.btnShadow}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.btnClip}
        accessibilityRole="button"
      >
        {/* btnClip (above) is the ONLY clip boundary for this whole button —
            documented Android RN bug: nested Views/Images that each repeat
            the same borderRadius render the circle as a faceted polygon.
            None of the layers below declare their own borderRadius/overflow. */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: convexOpacity }]}>
          <Image source={CIRCLE_BEVEL_CONVEX_IMG} resizeMode="stretch" style={IMAGE_FILL} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: pressAnim }]}>
          <Image source={CIRCLE_BEVEL_CONCAVE_IMG} resizeMode="stretch" style={IMAGE_FILL} />
        </Animated.View>
        <View style={styles.btnInner}>
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: convexOpacity }]}>
            <Image source={CIRCLE_DEPTH_CONVEX_IMG} resizeMode="stretch" style={IMAGE_FILL} />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: pressAnim }]}>
            <Image source={CIRCLE_DEPTH_CONCAVE_IMG} resizeMode="stretch" style={IMAGE_FILL} />
          </Animated.View>
          {label === '←' ? <BackChevron /> : <Text style={styles.btnLabel}>{label}</Text>}
        </View>
      </Pressable>
    </View>
  );
}

/**
 * Purely presentational — animates its title badge only when the `title`
 * text it receives actually changes. Mounted once at the app root via
 * `PersistentPageHeader` below; never remounts on navigation, so it has no
 * notion of focus, splash timing, or what any given screen is doing.
 */
export function PageHeader({ title = 'Dummy', isHome = false, showBack = false, onBack }: PageHeaderProps) {
  const titleOpacity  = useRef(new Animated.Value(1)).current;
  const titleSlide    = useRef(new Animated.Value(0)).current;
  const titleAnim     = useRef<Animated.CompositeAnimation | null>(null);
  const enterTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevTitleRef  = useRef(title);
  // What's actually drawn — lags behind `title` until the exit animation
  // finishes, so the OLD text is still what's visible while it slides away.
  const [displayTitle, setDisplayTitle] = useState(title);

  useEffect(() => {
    if (prevTitleRef.current === title) return;
    prevTitleRef.current = title;
    titleAnim.current?.stop();
    if (enterTimer.current) clearTimeout(enterTimer.current);

    // Exit: current title fades + slides up (mirror of the entrance).
    titleAnim.current = Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(titleSlide, { toValue: -18, duration: 150, useNativeDriver: true }),
    ]);
    titleAnim.current.start(({ finished }) => {
      if (!finished) return; // superseded by a newer title change — let that one finish the job
      setDisplayTitle(title);
      // One tick so React's re-render for the new displayTitle actually
      // commits+paints before the enter motion starts ramping opacity up.
      // setState here and Animated's native-driven enter both fire from
      // this same callback, but the *enter* motion runs on the native
      // thread immediately, independent of React's own render — without
      // this yield, a screen with heavy mount-time work competing for the
      // JS thread (e.g. game.tsx) could still be painting the *old* text
      // for the first few ms the badge is visibly fading back in.
      enterTimer.current = setTimeout(() => {
        titleAnim.current = Animated.parallel([
          // Fast opacity so the (mostly-opaque) badge covers the busy page
          // background quickly — only the slide should read as "slow".
          Animated.timing(titleOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
          Animated.spring(titleSlide, { toValue: 0, tension: 32, friction: 11, useNativeDriver: true }),
        ]);
        titleAnim.current.start();
      }, 1);
    });
    return () => {
      titleAnim.current?.stop();
      if (enterTimer.current) clearTimeout(enterTimer.current);
    };
  }, [title]);

  // Show left button when: home screen (gear), explicit showBack, or custom onBack provided
  const showLeft = isHome || showBack || !!onBack;

  const handleLeft = () => {
    if (isHome) router.push('/settings');
    else if (onBack) onBack();
    else router.back();
  };

  return (
    <View style={styles.header}>
      {/* Left slot — fixed width keeps center truly centered */}
      <View style={styles.sideSlot}>
        {showLeft && <HeaderBtn onPress={handleLeft} label={isHome ? '⚙️' : '←'} />}
      </View>

      {/* Center — title badge animates in from top only when title changes */}
      <View style={styles.centerSlot}>
        <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleSlide }] }}>
        <View style={styles.titleShadow}>
          {/* Title badge: subtle glass bevel — neutral light/shadow, no color accent */}
          <View style={styles.titleBevel}>
            <Image source={BADGE_BEVEL_IMG} resizeMode="stretch" style={IMAGE_FILL} />
            <View style={styles.titleInner}>
              <Image source={BADGE_DEPTH_TITLE_IMG} resizeMode="stretch" style={IMAGE_FILL} />
              <Text style={styles.titleText}>{displayTitle}</Text>
            </View>
          </View>
        </View>
        </Animated.View>
      </View>

      {/* Right slot — MuteButton always visible */}
      <View style={styles.sideSlot}>
        <MuteButton />
      </View>
    </View>
  );
}

/** Rendered exactly once, at the app root — see _layout.tsx. */
export function PersistentPageHeader() {
  const config = usePersistentHeaderConfig();
  if (config.visible === false) return null;
  return (
    <PageHeader
      title={config.title}
      isHome={config.isHome}
      showBack={config.showBack}
      onBack={config.onBack}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    minHeight: HEADER_BAR_HEIGHT,
  },

  // Fixed-width side slots — center is always truly centered
  sideSlot: {
    width: BTN,
    height: BTN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerSlot: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingTop: 4,
  },

  // ── Icon button (⚙️ / ←) ──────────────────────────────────
  btnShadow: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.40,
    shadowRadius: 6,
    // Android only honors `elevation` (shadowColor/Offset/Opacity/Radius are
    // iOS-only). Confirmed by direct A/B test (elevation:0 vs >0, identical
    // screenshot region otherwise): any non-zero elevation on this perfectly
    // circular view makes Android render its Material outline as a faceted
    // octagon instead of a smooth circle — not a clipping/Image issue at
    // all. 0 trades away the Android drop shadow for a correct circle;
    // iOS keeps its shadowXxx (unaffected, those are iOS-only already).
    elevation: 0,
  },
  btnClip: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    overflow: 'hidden',
  },
  // No borderRadius/overflow of its own — btnClip above is the single clip
  // boundary for the whole button (see comment at the JSX call site).
  btnInner: {
    width: BTN,
    height: BTN,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  btnLabel: {
    fontSize: 22,
    marginBottom: 2,
    color: colors.white,
  },

  // ── Title badge ───────────────────────────────────────────
  titleShadow: {
    borderRadius: borderRadius.lg,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.42,
    shadowRadius: 8,
    // No `elevation` at all — Android renders it as a separate native
    // Material surface that can flash white during a re-render (e.g. the
    // text swap mid-animation), independent of this view's own opacity.
    // iOS ignores `elevation` anyway and still gets the shadowXxx above.
    elevation: 0,
  },
  titleBevel: {
    borderRadius: borderRadius.lg,
    padding: 3, // thicker "chrome edge"
    overflow: 'hidden',
  },
  titleInner: {
    borderRadius: borderRadius.lg - 3,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(8,16,36,0.92)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
});
