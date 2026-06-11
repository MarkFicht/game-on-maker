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
import { useGame } from '../src/hooks/useGame';
import { useSettings } from '../src/hooks/useSettings';
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
  const countdownScale = useRef(new Animated.Value(1)).current;

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
  const pauseAnim = useMemo(() => makeEntranceAnim(), []);

  useEffect(() => {
    if (gamePhase === 'ready') startEntranceAll([readyAnim]);
  }, [gamePhase]);

  useEffect(() => {
    if (state.status === 'paused') startEntranceAll([pauseAnim]);
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
              style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
            >
              {/* Bevel: top = orange + 40% white (#FBAB73), bottom = orange × 60% (#95450D) */}
              <LinearGradient
                colors={['#FBAB73', '#95450D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.startBevel}
              >
                <LinearGradient
                  colors={['#F97316', '#E8650A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.startInner}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.26)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.18)']}
                    locations={[0, 0.38, 0.62, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                  />
                  <Text style={styles.startText}>🎮  Start</Text>
                </LinearGradient>
              </LinearGradient>
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
            <Text style={styles.deckEmoji}>{deck.icon}</Text>
            <Animated.Text
              style={[styles.countdownNumber, { transform: [{ scale: countdownScale }] }]}
            >
              {countdown}
            </Animated.Text>
            <View style={styles.getReadyBadge}>
              <Text style={styles.getReadyText}>Przygotuj się!</Text>
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
          <Animated.View style={[styles.centeredFull, entranceStyle(pauseAnim)]}>
            <Text style={styles.pauseEmoji}>⏸️</Text>
            <Text style={styles.pauseMeta}>{state.timeRemaining}s pozostało</Text>
            <View style={styles.pauseActions}>
              <Button label="Wznów" onPress={resumeGame} size="lg" style={{ marginBottom: spacing.sm }} />
              <Button label="Zakończ grę" onPress={endGame} variant="outline" />
              <Button
                label="Strona główna"
                onPress={handleHome}
                variant="ghost"
                style={{ marginTop: spacing.xs }}
              />
            </View>
          </Animated.View>
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
              <Button label="⏸" onPress={pauseGame} variant="outline" size="sm" />
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
    padding: 4,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.58,
    shadowRadius: 10,
    elevation: 12,
  },
  startInner: {
    borderRadius: borderRadius.xl - 4,
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
  getReadyBadge: {
    backgroundColor: 'rgba(79,70,229,0.45)',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1.5,
    borderColor: 'rgba(120,100,255,0.60)',
  },
  getReadyText: {
    fontSize: 21,
    fontWeight: '800',
    color: '#C4B5FD',
    letterSpacing: 0.8,
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
