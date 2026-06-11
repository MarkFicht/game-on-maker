import React, { useEffect, useState, useRef } from 'react';
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

  // Countdown logic
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

  // Haptic on last 5 seconds
  const lastWarningRef = useRef(-1);
  useEffect(() => {
    if (state.status === 'playing' && state.timeRemaining <= 5 && state.timeRemaining > 0) {
      if (lastWarningRef.current !== state.timeRemaining) {
        lastWarningRef.current = state.timeRemaining;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
    if (state.status !== 'playing') lastWarningRef.current = -1;
  }, [state.timeRemaining, state.status]);

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
          {/* Everything centered together so Start is never at the bottom */}
          <View style={styles.centeredFull}>
            <Text style={styles.deckEmoji}>{deck.icon}</Text>
            <Text style={styles.deckName}>{deck.name}</Text>
            <Text style={styles.deckMeta}>{deck.words.length} słów · {deck.difficulty}</Text>
            <View style={{ height: spacing.xl }} />
            {/* Orange 3-layer button matching home "Zagraj" */}
            <Pressable
              onPress={handleStartCountdown}
              style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.42)', 'rgba(0,0,0,0.46)']}
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
          </View>
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
          <View style={styles.centeredFull}>
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
  const timerSize = isLandscape ? 56 : 72;
  const timerStroke = isLandscape ? 5 : 6;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          {/* Header: Timer + Scores + Pause + Mute */}
          <LinearGradient
            colors={['rgba(30,41,59,0.9)', 'rgba(15,23,42,0.85)']}
            style={[styles.header, isLandscape && styles.headerLandscape]}
          >
            <TimerRing
              timeRemaining={state.timeRemaining}
              totalTime={state.totalTime}
              size={timerSize}
              strokeWidth={timerStroke}
            />

            <View style={[styles.scoreBox, isLandscape && styles.scoreBoxLandscape]}>
              <View style={styles.scoreItem}>
                <Text style={[styles.scoreValue, { color: colors.success }, isLandscape && styles.scoreValueCompact]}>
                  {stats.correctCount}
                </Text>
                <Text style={styles.scoreLabel}>Dobrze</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreItem}>
                <Text style={[styles.scoreValue, { color: colors.warning }, isLandscape && styles.scoreValueCompact]}>
                  {stats.skippedCount}
                </Text>
                <Text style={styles.scoreLabel}>Pominięte</Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              <MuteButton size="sm" />
              <Button
                label={isLandscape ? '⏸' : 'Pauza'}
                onPress={pauseGame}
                variant="outline"
                size="sm"
              />
            </View>
          </LinearGradient>

          {/* Word card */}
          <View style={styles.cardContainer}>
            <WordCard
              word={currentWord}
              deckIcon={deck.icon}
              onCorrect={markCorrect}
              onSkip={markSkipped}
            />
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
  container: {
    flex: 1,
    padding: spacing.md,
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
  // Ready
  readyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
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
  readyActions: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  startBevel: {
    borderRadius: borderRadius.xl,
    padding: 3,
    minWidth: 200,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.65,
    shadowRadius: 18,
    elevation: 12,
  },
  startInner: {
    borderRadius: borderRadius.xl - 3,
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
  // Countdown
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
  // Paused
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
  // Playing header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  headerLandscape: {
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  scoreBoxLandscape: {
    gap: spacing.sm,
  },
  scoreItem: {
    alignItems: 'center',
    minWidth: 52,
  },
  scoreDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scoreValueCompact: {
    fontSize: 18,
  },
  scoreLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
  },
});
