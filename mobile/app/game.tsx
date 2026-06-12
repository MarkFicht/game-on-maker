import React, { useEffect, useState, useRef, useMemo } from 'react';
import { makeEntranceAnim, startEntranceAll, entranceStyle } from '../src/shared/animation/entrance';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  SafeAreaView,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { TimerRing, WordCard, ResultsView } from '../src/game/components';
import { getDeckById } from '../src/game/decks';
import { useGame } from '../src/game/hooks/useGame';
import { useSettings } from '../src/game/hooks/useSettings';
import { Button, GradientBackground, MuteButton, PageHeader } from '../src/shared/components';
import { colors, spacing, borderRadius } from '../src/shared/theme';

type GamePhase = 'ready' | 'countdown' | 'playing';

export default function GameScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const { settings } = useSettings();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [gamePhase, setGamePhase] = useState<GamePhase>('ready');
  const [countdown, setCountdown] = useState(3);
  const countdownScale     = useRef(new Animated.Value(1)).current;
  const startPressAnim     = useRef(new Animated.Value(0)).current;
  const startConvexOpacity = useMemo(() => startPressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), []);

  const { state, currentWord, stats, startGame, pauseGame, resumeGame, markCorrect, markSkipped, endGame, reset, updateConfig } =
    useGame({ roundDuration: settings.roundDuration });

  const deck = deckId ? getDeckById(deckId) : null;

  useEffect(() => {
    updateConfig({ roundDuration: settings.roundDuration });
  }, [settings.roundDuration]);

  // Countdown animation
  useEffect(() => {
    if (!deck || gamePhase !== 'countdown') return;

    const tick = () => {
      Animated.sequence([
        Animated.timing(countdownScale, { toValue: 1.5, duration: 120, useNativeDriver: true }),
        Animated.timing(countdownScale, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start();
    };

    tick();

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGamePhase('playing');
          startGame(deck);
          return 0;
        }
        tick();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gamePhase, deck]);

  // Haptic tick on last 5 seconds (respects vibrationEnabled)
  const lastWarningRef = useRef(-1);
  const readyAnim = useMemo(() => makeEntranceAnim(), []);

  // Pause screen — same multi-value animation as Home
  const pauseEmojiScale  = useRef(new Animated.Value(0)).current;
  const pauseEmojiRotate = useRef(new Animated.Value(-0.3)).current;
  const pauseFade1  = useRef(new Animated.Value(0)).current;
  const pauseSlide1 = useRef(new Animated.Value(20)).current;
  const pauseFade2  = useRef(new Animated.Value(0)).current;
  const pauseSlide2 = useRef(new Animated.Value(20)).current;
  const pauseEmojiDeg = useMemo(
    () => pauseEmojiRotate.interpolate({ inputRange: [-1, 1], outputRange: ['-18deg', '18deg'] }),
    [],
  );

  useEffect(() => {
    if (gamePhase === 'ready') startEntranceAll([readyAnim]);
  }, [gamePhase]);

  useEffect(() => {
    if (state.status !== 'paused') return;
    pauseEmojiScale.setValue(0);
    pauseEmojiRotate.setValue(-0.3);
    pauseFade1.setValue(0);  pauseSlide1.setValue(20);
    pauseFade2.setValue(0);  pauseSlide2.setValue(20);
    Animated.parallel([
      Animated.spring(pauseEmojiScale,  { toValue: 1, tension: 120, friction: 7, useNativeDriver: true }),
      Animated.spring(pauseEmojiRotate, { toValue: 0, tension: 120, friction: 7, useNativeDriver: true }),
      Animated.timing(pauseFade1,  { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.spring(pauseSlide1, { toValue: 0, tension: 80,  friction: 7, useNativeDriver: true }),
      Animated.sequence([Animated.delay(90), Animated.timing(pauseFade2,  { toValue: 1, duration: 260, useNativeDriver: true })]),
      Animated.sequence([Animated.delay(90), Animated.spring(pauseSlide2, { toValue: 0, tension: 80, friction: 7, useNativeDriver: true })]),
    ]).start();
  }, [state.status]);
  useEffect(() => {
    if (state.status === 'playing' && state.timeRemaining <= 5 && state.timeRemaining > 0) {
      if (lastWarningRef.current !== state.timeRemaining) {
        lastWarningRef.current = state.timeRemaining;
        if (settings.vibrationEnabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    }
    if (state.status !== 'playing') lastWarningRef.current = -1;
  }, [state.timeRemaining, state.status, settings.vibrationEnabled]);

  const handleStartCountdown = () => {
    setGamePhase('countdown');
    setCountdown(3);
  };

  const handleCancel = () => {
    reset();
    router.back();
  };

  const handlePlayAgain = () => {
    reset();
    setGamePhase('ready');
    setCountdown(3);
  };

  const handleHome = () => {
    reset();
    router.push('/');
  };

  if (!deck) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safe}>
          <View style={styles.centered}>
            <Text style={styles.errorText}>Nie znaleziono talii</Text>
            <Button
              label="Wróć"
              onPress={() => router.back()}
              variant="outline"
              style={{ marginTop: spacing.lg }}
            />
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  // ── Ready ────────────────────────────────────────────────
  if (gamePhase === 'ready') {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safe}>
          <PageHeader title={deck.name} onBack={handleCancel} />
          <Animated.View style={[styles.centeredFull, entranceStyle(readyAnim)]}>
            <Text style={styles.deckEmoji}>{deck.icon}</Text>
            <Text style={styles.deckName}>{deck.name}</Text>
            <Text style={styles.deckMeta}>{deck.words.length} słów · {deck.difficulty}</Text>
            <View style={{ height: spacing.xl }} />
            <Pressable
              onPress={handleStartCountdown}
              onPressIn={() => Animated.timing(startPressAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start()}
              onPressOut={() => Animated.timing(startPressAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start()}
            >
              <View style={styles.startBevel}>
                <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.xl, opacity: startConvexOpacity }]}>
                  <LinearGradient colors={['#FBAB73', '#95450D']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.xl }]} />
                </Animated.View>
                <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.xl, opacity: startPressAnim }]}>
                  <LinearGradient colors={['#95450D', '#FBAB73']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.xl }]} />
                </Animated.View>
                <LinearGradient colors={['#F97316', '#E8650A']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.startInner}>
                  <Animated.View style={[StyleSheet.absoluteFill, { opacity: startConvexOpacity }]}>
                    <LinearGradient colors={['rgba(255,255,255,0.26)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.18)']} locations={[0, 0.38, 0.62, 1]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} pointerEvents="none" />
                  </Animated.View>
                  <Animated.View style={[StyleSheet.absoluteFill, { opacity: startPressAnim }]}>
                    <LinearGradient colors={['rgba(0,0,0,0.18)', 'rgba(0,0,0,0)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.26)']} locations={[0, 0.38, 0.62, 1]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} pointerEvents="none" />
                  </Animated.View>
                  <Text style={styles.startText}>🎮  Start</Text>
                </LinearGradient>
              </View>
            </Pressable>
          </Animated.View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  // ── Countdown ────────────────────────────────────────────
  if (gamePhase === 'countdown') {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safe}>
          <PageHeader title={deck.name} onBack={handleCancel} />
          <View style={styles.centeredFull}>
            <Text style={[styles.deckEmoji, { marginBottom: -10 }]}>{deck.icon}</Text>
            <Animated.Text
              style={[styles.countdownNumber, { transform: [{ scale: countdownScale }] }]}
            >
              {countdown}
            </Animated.Text>
            {/* "Przygotuj się!" — same dark badge as PageHeader title */}
            <View style={styles.getReadyShadow}>
              <LinearGradient
                colors={['rgba(255,255,255,0.22)', 'rgba(0,0,0,0.30)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.getReadyBevel}
              >
                <View style={styles.getReadyInner}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.14)']}
                    locations={[0, 0.38, 0.62, 1]}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                  />
                  <Text style={styles.getReadyText}>Przygotuj się!</Text>
                </View>
              </LinearGradient>
            </View>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  // ── Paused ───────────────────────────────────────────────
  if (gamePhase === 'playing' && state.status === 'paused') {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safe}>
          <PageHeader title="Gra wstrzymana" onBack={resumeGame} />
          <View style={styles.centeredFull}>
            <Animated.Text style={[styles.pauseEmoji, {
              transform: [{ scale: pauseEmojiScale }, { rotate: pauseEmojiDeg }],
            }]}>
              {deck?.icon ?? '⏸️'}
            </Animated.Text>
            <Animated.View style={{ opacity: pauseFade1, transform: [{ translateY: pauseSlide1 }] }}>
              <Text style={styles.pauseMeta}>{state.timeRemaining}s pozostało</Text>
            </Animated.View>
            <Animated.View style={[styles.pauseActions, {
              opacity: pauseFade2,
              transform: [{ translateY: pauseSlide2 }],
            }]}>
              <Button label="Wznów" onPress={resumeGame} size="lg" />
              <Button label="Zakończ grę" onPress={endGame} variant="danger" />
              <Button label="Strona główna" onPress={handleHome} variant="secondary" />
            </Animated.View>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  // ── Results ──────────────────────────────────────────────
  if (gamePhase === 'playing' && state.status === 'finished') {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safe}>
          <ResultsView
            stats={stats}
            results={state.results}
            deckName={deck.name}
            onPlayAgain={handlePlayAgain}
            onHome={handleHome}
          />
        </SafeAreaView>
      </GradientBackground>
    );
  }

  // ── Playing ──────────────────────────────────────────────
  // Layout: card fills padded area. Two non-blocking overlays:
  //   • hudTop  — timer ring centered at the top of the card
  //   • hudBottom — scores + controls centered at the bottom of the card
  // Both are pointerEvents="none/box-none" so taps pass through to the WordCard
  // tap zones (top half = correct, bottom half = skip).
  const timerSize = isLandscape ? 52 : 64;
  const timerStroke = isLandscape ? 5 : 6;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.playContainer}>
          {/* Word card — fills the padded container */}
          <WordCard
            word={currentWord}
            deckIcon={deck.icon}
            onCorrect={markCorrect}
            onSkip={markSkipped}
            fullscreen
            vibrationEnabled={settings.vibrationEnabled}
          />

          {/* Timer — centered top, passes all touches through */}
          <View style={styles.hudTop} pointerEvents="none">
            <TimerRing
              timeRemaining={state.timeRemaining}
              totalTime={state.totalTime}
              size={timerSize}
              strokeWidth={timerStroke}
            />
          </View>

          {/* Scores + controls — centered bottom */}
          <View
            style={[styles.hudBottom, isLandscape && styles.hudBottomLandscape]}
            pointerEvents="box-none"
          >
            <View style={styles.scoreRow} pointerEvents="none">
              <Text style={[styles.scoreNum, { color: colors.success }]}>
                ✓ {stats.correctCount}
              </Text>
              <Text style={styles.scoreSep}>·</Text>
              <Text style={[styles.scoreNum, { color: colors.warning }]}>
                ✗ {stats.skippedCount}
              </Text>
            </View>
            <View style={styles.hudButtons}>
              <MuteButton size="sm" />
              <MuteButton size="sm" icon="⏸️" onPress={pauseGame} accessibilityLabel="Pauza" />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  centeredFull: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    fontSize: 18,
    color: colors.textSecondary,
  },

  // ── Ready ────────────────────────────────────────────────
  deckEmoji: {
    fontSize: 80,
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(79,70,229,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  deckName: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  deckMeta: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  startBevel: {
    borderRadius: borderRadius.xl,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.58,
    shadowRadius: 10,
    elevation: 12,
  },
  startInner: {
    borderRadius: borderRadius.xl - 4,
    margin: 4,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
  },
  startText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.3,
  },

  // ── Countdown ────────────────────────────────────────────
  countdownNumber: {
    fontSize: 112,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -3,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  getReadyShadow: {
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.42,
    shadowRadius: 8,
    elevation: 5,
  },
  getReadyBevel: {
    borderRadius: borderRadius.lg,
    padding: 3,
  },
  getReadyInner: {
    borderRadius: borderRadius.lg - 3,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(8,16,36,0.92)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  getReadyText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.3,
  },

  // ── Paused ───────────────────────────────────────────────
  pauseEmoji: {
    fontSize: 56,
  },
  pauseMeta: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  pauseActions: {
    width: '100%',
    marginTop: spacing.xl,
    gap: spacing.md,
  },

  // ── Playing ──────────────────────────────────────────────
  playContainer: {
    flex: 1,
    padding: spacing.sm,  // breathing room from screen edges
  },

  // Timer centered at top of the card
  hudTop: {
    position: 'absolute',
    top: spacing.xl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  // Scores + buttons centered at bottom of the card
  hudBottom: {
    position: 'absolute',
    bottom: spacing.xl,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: spacing.sm,
  },
  hudBottomLandscape: {
    bottom: spacing.md,
    gap: spacing.xs,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  scoreNum: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scoreSep: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.30)',
  },
  hudButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
});
