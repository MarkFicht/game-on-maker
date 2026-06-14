import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, useWindowDimensions, ViewStyle } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../shared/components';
import { BannerAd } from '../../core/ads/BannerAd';
import { makeSwayAnim, startSway, swayInterpolate } from '../../shared/animation/entrance';
import { colors } from '../../shared/theme/colors';
import { spacing, borderRadius } from '../../shared/theme/spacing';
import type { GameStats, RoundResult } from '../types';


interface ResultsViewProps {
  stats: GameStats;
  results: RoundResult[];
  deckName?: string;
  onPlayAgain: () => void;
  onHome: () => void;
}

function getTitle(accuracy: number): string {
  if (accuracy === 100) return 'Perfekcja! 🏆';
  if (accuracy >= 85)   return 'Świetna robota! 🌟';
  if (accuracy >= 65)   return 'Dobra próba! 🎉';
  if (accuracy >= 40)   return 'Całkiem nieźle! 😏';
  if (accuracy >= 20)   return 'Nie poddawaj się! 💪';
  return 'Następnym razem! 😬';
}

function AnimatedItem({ children, delay, style }: { children: React.ReactNode; delay: number; style?: ViewStyle }) {
  const anim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 260, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(delay),
        Animated.spring(translateY, { toValue: 0, tension: 80, friction: 6, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity: anim, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

function StatCard({ value, label, color }: { value: string | number; label: string; color: string }) {
  const scale = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.statCard, { transform: [{ scale }] }]}>
      <LinearGradient
        colors={['#777F8C', '#111926']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.lg }]}
      />
      <View style={styles.statFace}>
        <LinearGradient
          colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.18)']}
          locations={[0, 0.38, 0.62, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </Animated.View>
  );
}

export function ResultsView({ stats, results, deckName, onPlayAgain, onHome }: ResultsViewProps) {
  const { width } = useWindowDimensions();
  const trophyScale = useRef(new Animated.Value(0)).current;
  const trophyRotate = useRef(new Animated.Value(-0.5)).current;
  const titleSway = useRef(makeSwayAnim()).current;
  // Computed once — never call interpolate() inside JSX (creates new node every render)
  const emojiRotate = useMemo(() => swayInterpolate(titleSway), []);
  const [fireConfetti, setFireConfetti] = useState(false);

  useEffect(() => {
    if (stats.accuracy >= 70) {
      const t = setTimeout(() => setFireConfetti(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(trophyScale, { toValue: 1, tension: 60, friction: 5, delay: 100, useNativeDriver: true }),
      Animated.spring(trophyRotate, { toValue: 0, tension: 60, friction: 5, delay: 100, useNativeDriver: true }),
    ]).start();
    startSway(titleSway);
  }, []);

  const rotate = useMemo(() => trophyRotate.interpolate({ inputRange: [-1, 1], outputRange: ['-30deg', '30deg'] }), []);

  const fullTitle = getTitle(stats.accuracy);
  const lastSpace = fullTitle.lastIndexOf(' ');
  const titleText = fullTitle.slice(0, lastSpace);
  const titleEmoji = fullTitle.slice(lastSpace + 1);

  return (
    <View style={styles.container}>
      {fireConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: width / 2, y: 0 }}
          autoStart
          fadeOut
          explosionSpeed={400}
          fallSpeed={3000}
        />
      )}

      {/* Trophy */}
      <AnimatedItem delay={0}>
        <View style={styles.trophyContainer}>
          <Animated.Text style={[styles.trophy, { transform: [{ scale: trophyScale }, { rotate }] }]}>
            🏆
          </Animated.Text>
          <View style={styles.scoreBadge}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.scoreBadgeGradient}>
              <Text style={styles.scoreBadgeText}>{stats.correctCount}</Text>
            </LinearGradient>
          </View>
        </View>
      </AnimatedItem>

      <AnimatedItem delay={150}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{titleText} </Text>
          <Animated.Text style={[styles.titleEmoji, { transform: [{ rotate: emojiRotate }] }]}>
            {titleEmoji}
          </Animated.Text>
        </View>
        {deckName ? <Text style={styles.deckName}>{deckName}</Text> : null}
      </AnimatedItem>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatCard value={stats.correctCount} label="Dobrze" color={colors.success} />
        <StatCard value={stats.skippedCount} label="Pominięte" color={colors.warning} />
        <StatCard value={`${stats.accuracy}%`} label="Celność" color={colors.primaryLight} />
      </View>

      {/* Word list */}
      <AnimatedItem delay={500} style={styles.listAnimWrapper}>
        <View style={styles.listWrapper}>
          <ScrollView
            style={styles.wordList}
            contentContainerStyle={styles.wordListContent}
            showsVerticalScrollIndicator
            indicatorStyle="white"
          >
            {results.map((result) => (
              <View
                key={result.word.id}
                style={[styles.resultRow, result.wasCorrect ? styles.resultRowCorrect : styles.resultRowSkip]}
              >
                <View style={styles.iconWrap}>
                  <Text style={styles.iconMark}>
                    {result.wasCorrect ? '✓' : '✕'}
                  </Text>
                </View>
                <Text style={styles.resultWord}>{result.word.text}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </AnimatedItem>

      {/* Buttons */}
      <AnimatedItem delay={600}>
        <View style={styles.actions}>
          <Button label="Strona główna" onPress={onHome} variant="secondary" style={styles.actionBtn} />
          <Button label="Zagraj ponownie" onPress={onPlayAgain} style={styles.actionBtn} />
        </View>
      </AnimatedItem>

      {/* Banner ad — visible only for free users, null for premium */}
      <BannerAd />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  trophyContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  trophy: {
    fontSize: 64,
    textShadowColor: 'rgba(245,158,11,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  scoreBadge: {
    position: 'absolute',
    bottom: -8,
    right: -12,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  scoreBadgeGradient: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    minWidth: 30,
    alignItems: 'center',
  },
  scoreBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.white,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#F97316',
    textAlign: 'center',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(249,115,22,0.40)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  titleEmoji: {
    fontSize: 30,
  },
  deckName: {
    fontSize: 15,
    color: colors.white,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: spacing.md,
    letterSpacing: 0.2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    minHeight: 84,
    borderRadius: borderRadius.lg,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 8,
  },
  statFace: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: borderRadius.lg - 3,
    padding: spacing.md,
    alignItems: 'center',
    overflow: 'hidden',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 3,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listAnimWrapper: {
    flex: 1,
    width: '100%',
    marginBottom: spacing.md,
  },
  listWrapper: {
    flex: 1,
    backgroundColor: 'rgba(8,14,36,0.72)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.11)',
    overflow: 'hidden',
  },
  wordList: {
    flex: 1,
  },
  wordListContent: {
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: 8,
    alignItems: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
  },
  resultRowCorrect: {
    backgroundColor: 'rgba(16,185,129,0.88)',
    borderColor: 'rgba(16,185,129,1)',
  },
  resultRowSkip: {
    backgroundColor: 'rgba(245,158,11,0.85)',
    borderColor: 'rgba(245,158,11,1)',
  },
  iconWrap: {
    width: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconMark: {
    fontSize: 13,
    color: colors.white,
    fontWeight: '900',
    textAlign: 'center',
  },
  resultWord: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.lg,
    width: '100%',
    paddingBottom: spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
});
