import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../shared/components';
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

function getTitle(correct: number): string {
  if (correct >= 15) return 'Niesamowite! 🔥';
  if (correct >= 7) return 'Świetna robota! 💪';
  return 'Dobra próba! 👍';
}

function AnimatedItem({ children, delay }: { children: React.ReactNode; delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, { toValue: 1, duration: 350, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 350, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

function StatCard({ value, label, color }: { value: string | number; label: string; color: string }) {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.statCard, { opacity, transform: [{ scale }] }]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
        style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.lg }]}
      />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

export function ResultsView({ stats, results, deckName, onPlayAgain, onHome }: ResultsViewProps) {
  const trophyScale = useRef(new Animated.Value(0)).current;
  const trophyRotate = useRef(new Animated.Value(-0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(trophyScale, { toValue: 1, tension: 60, friction: 5, delay: 100, useNativeDriver: true }),
      Animated.spring(trophyRotate, { toValue: 0, tension: 60, friction: 5, delay: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  const rotate = trophyRotate.interpolate({ inputRange: [-1, 1], outputRange: ['-30deg', '30deg'] });

  return (
    <View style={styles.container}>
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
        <Text style={styles.title}>{getTitle(stats.correctCount)}</Text>
        {deckName ? <Text style={styles.deckName}>{deckName}</Text> : null}
      </AnimatedItem>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatCard value={stats.correctCount} label="Dobrze" color={colors.success} />
        <StatCard value={stats.skippedCount} label="Pominięte" color={colors.warning} />
        <StatCard value={`${stats.accuracy}%`} label="Celność" color={colors.primaryLight} />
      </View>

      {/* Word list */}
      <AnimatedItem delay={500}>
        <ScrollView style={styles.wordList} showsVerticalScrollIndicator={false}>
          {results.map((result, i) => (
            <View key={result.word.id} style={styles.resultRow}>
              <LinearGradient
                colors={
                  result.wasCorrect
                    ? ['rgba(16,185,129,0.12)', 'rgba(16,185,129,0.04)']
                    : ['rgba(245,158,11,0.10)', 'rgba(245,158,11,0.03)']
                }
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              <Text style={result.wasCorrect ? styles.iconCorrect : styles.iconSkip}>
                {result.wasCorrect ? '✓' : '✕'}
              </Text>
              <Text style={styles.resultWord} numberOfLines={1}>{result.word.text}</Text>
            </View>
          ))}
        </ScrollView>
      </AnimatedItem>

      {/* Buttons */}
      <AnimatedItem delay={600}>
        <View style={styles.actions}>
          <Button label="Strona główna" onPress={onHome} variant="outline" style={styles.actionBtn} />
          <Button label="Zagraj ponownie" onPress={onPlayAgain} style={styles.actionBtn} />
        </View>
      </AnimatedItem>
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
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    marginTop: spacing.sm,
    letterSpacing: -0.3,
  },
  deckName: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(30,41,59,0.8)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
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
  wordList: {
    width: '100%',
    maxHeight: 200,
    marginBottom: spacing.sm,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 7,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  iconCorrect: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '800',
    width: 18,
    textAlign: 'center',
  },
  iconSkip: {
    fontSize: 14,
    color: colors.warning,
    fontWeight: '800',
    width: 18,
    textAlign: 'center',
  },
  resultWord: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    paddingBottom: spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
});
