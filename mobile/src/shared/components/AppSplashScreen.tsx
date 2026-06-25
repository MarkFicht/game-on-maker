import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Asset } from 'expo-asset';
import Svg, { Defs, Mask, Image as SvgImage, Rect, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const LOGO      = require('../../../assets/logo/logo_home.png');
const BG        = require('../../../assets/bg.jpg');
const LOGO_SIZE = 270;
const SCAN_W    = 22;
const BG_OVERLAY = ['rgba(8,12,22,0.38)', 'rgba(12,18,36,0.34)', 'rgba(18,10,32,0.40)'] as const;
const FALLBACK_BG = '#0d1220';
const IS_WEB = Platform.OS === 'web';

interface AppSplashScreenProps {
  isAuthReady: boolean;
  onDone: () => void;
}

export function AppSplashScreen({ isAuthReady, onDone }: AppSplashScreenProps) {
  const { width, height } = useWindowDimensions();

  const phase1DoneRef    = useRef(false);
  const phase2StartedRef = useRef(false);
  const isAuthReadyRef   = useRef(isAuthReady);
  const onDoneRef        = useRef(onDone);
  isAuthReadyRef.current = isAuthReady;
  onDoneRef.current      = onDone;

  const progress      = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const [percent, setPercent] = useState(0);
  const [scanX, setScanX] = useState(0);
  const [assetsReady, setAssetsReady] = useState(false);

  // Animated reveal width 0 → LOGO_SIZE (drives layer B's clip width)
  const revealWidth = progress.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, LOGO_SIZE],
  });

  // react-native-svg's <Mask> always computes and forwards a `maskType` prop
  // to its host component (even when we pass undefined — it falls back
  // internally to 'luminance'). On web that host is a real DOM <mask>
  // element, which logs a "does not recognize maskType" warning no matter
  // what we pass in. So on web we skip <Mask> entirely and mask the whole
  // <Svg> via CSS mask-image instead — a real DOM feature, not an SVG
  // element, so no warning is possible.
  const webMaskStyle = useMemo(() => {
    if (!IS_WEB) return null;
    const logoUri = Asset.fromModule(LOGO).uri;
    return {
      maskImage: `url(${logoUri})`,
      WebkitMaskImage: `url(${logoUri})`,
      maskSize: `${LOGO_SIZE}px ${LOGO_SIZE}px`,
      WebkitMaskSize: `${LOGO_SIZE}px ${LOGO_SIZE}px`,
      maskRepeat: 'no-repeat',
      WebkitMaskRepeat: 'no-repeat',
    } as Record<string, string>;
  }, []);

  // Preload bg + logo before showing/animating anything — otherwise the
  // loading screen itself pops in before its own background has loaded
  // (most visible on web, where these are fetched over HTTP). Asset.fromModule
  // + downloadAsync is the cross-platform Expo way to do this — react-native-web's
  // Image has no resolveAssetSource, so that can't be hand-rolled with Image.prefetch.
  useEffect(() => {
    Promise.all([Asset.fromModule(BG).downloadAsync(), Asset.fromModule(LOGO).downloadAsync()])
      .catch(() => {})
      .then(() => setAssetsReady(true));
  }, []);

  const startPhase2 = useCallback(() => {
    if (!phase1DoneRef.current || !isAuthReadyRef.current || phase2StartedRef.current) return;
    phase2StartedRef.current = true;

    Animated.timing(progress, {
      toValue: 1,
      duration: 380,
      easing: Easing.in(Easing.quad),
      useNativeDriver: false,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(screenOpacity, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }).start(() => onDoneRef.current());
      }, 180);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!assetsReady) return;

    const id = progress.addListener(({ value }) => {
      setPercent(Math.round(value * 100));
      setScanX(value * LOGO_SIZE);
    });

    Animated.timing(progress, {
      toValue: 0.85,
      duration: 2200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      phase1DoneRef.current = true;
      startPhase2();
    });

    return () => progress.removeListener(id);
  }, [assetsReady]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isAuthReady) startPhase2();
  }, [isAuthReady, startPhase2]);

  if (!assetsReady) {
    return <View style={[StyleSheet.absoluteFill, styles.root, { backgroundColor: FALLBACK_BG }]} />;
  }

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, { opacity: screenOpacity }]}>
      {/* Same background as every other screen */}
      <Image source={BG} style={{ position: 'absolute', top: 0, left: 0, width, height }} resizeMode="cover" />
      <LinearGradient colors={BG_OVERLAY} style={StyleSheet.absoluteFill} start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }} />

      <View style={styles.center}>

        {/*
         * Logo reveal container — three layers, all absolutely positioned:
         *
         *  A) Dim logo  — overflow:'visible' so resizeMode="contain" never
         *     clips the image on any device/aspect-ratio.
         *
         *  B) Bright logo inside revealMask — overflow:'hidden' so it is
         *     clipped to the animated reveal width (left → right sweep).
         *     The PNG's own alpha already shapes it to the circular badge.
         *
         *  C) Scanner drawn in an SVG, masked by the logo's own silhouette
         *     so the bar can only render where the logo is opaque — it
         *     follows the circular outline exactly at every x position.
         *     Native uses an SVG <Mask> (maskType="alpha"); web masks the
         *     whole <Svg> via CSS mask-image instead (see webMaskStyle) to
         *     avoid a console warning from react-native-svg's <Mask> on web.
         */}
        <View style={styles.logoOuter}>

          {/* A — dim base, always fully visible */}
          <Image
            source={LOGO}
            style={styles.logoDim}
            resizeMode="contain"
          />

          {/* B — bright logo, clipped to the sweeping reveal width */}
          <Animated.View style={[styles.revealMask, { width: revealWidth }]}>
            <Image
              source={LOGO}
              style={styles.logoBright}
              resizeMode="contain"
            />
          </Animated.View>

          {/* C — scanner */}
          <Svg
            width={LOGO_SIZE}
            height={LOGO_SIZE}
            style={[styles.scannerClip, webMaskStyle]}
            pointerEvents="none"
          >
            <Defs>
              {!IS_WEB && (
                <Mask id="logoMask" maskType="alpha">
                  <SvgImage href={LOGO} x={0} y={0} width={LOGO_SIZE} height={LOGO_SIZE} preserveAspectRatio="xMidYMid meet" />
                </Mask>
              )}
              <SvgLinearGradient id="scanGlow" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#bec4ff" stopOpacity={0.24} />
                <Stop offset="1" stopColor="#bec4ff" stopOpacity={0} />
              </SvgLinearGradient>
            </Defs>
            {/* Soft glow trailing to the right of the bright edge */}
            <Rect x={scanX} y={0} width={SCAN_W} height={LOGO_SIZE} fill="url(#scanGlow)" mask={IS_WEB ? undefined : 'url(#logoMask)'} />
            {/* Bright edge line */}
            <Rect x={scanX} y={0} width={2} height={LOGO_SIZE} fill="#ffffff" fillOpacity={0.95} mask={IS_WEB ? undefined : 'url(#logoMask)'} />
          </Svg>

        </View>

        <Text style={styles.percentText}>{percent}%</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { zIndex: 9999 },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },

  // Outer wrapper — overflow:'visible' so the dim image (layer A)
  // is never pixel-clipped on any device.
  logoOuter: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    overflow: 'visible',
  },

  // Layer A — dim base
  logoDim: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    opacity: 0.14,
  },

  // Layer B — bright reveal
  revealMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: LOGO_SIZE,
    overflow: 'hidden',
  },
  logoBright: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },

  // Layer C — scanner SVG (explicit px, not absoluteFill)
  scannerClip: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  percentText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.50)',
    letterSpacing: 2.5,
  },
});
