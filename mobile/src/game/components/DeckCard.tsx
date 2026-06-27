import React, { useRef } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../shared/theme/colors';
import { spacing, borderRadius } from '../../shared/theme/spacing';
import { useSettings } from '../hooks/useSettings';
import { playClickSound } from '../../shared/sound/clickSound';
import type { Deck } from '../types';

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(79,70,229,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
}

// Bevel: top = color + 40% white, bottom = color × 60%  (matches web btn-3d formula)
function computeBevel(hex: string): [string, string] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return ['#9590EF', '#2F2A89'];
  return [
    `rgb(${Math.round(0.4 * 255 + 0.6 * r)},${Math.round(0.4 * 255 + 0.6 * g)},${Math.round(0.4 * 255 + 0.6 * b)})`,
    `rgb(${Math.round(0.6 * r)},${Math.round(0.6 * g)},${Math.round(0.6 * b)})`,
  ];
}

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'łatwy',
  medium: 'średni',
  hard: 'trudny',
};

interface DeckCardProps {
  deck: Deck;
  onSelect: (deck: Deck) => void;
  isLocked?: boolean;
  onUnlock?: () => void;
  showWordCount?: boolean;
}

export function DeckCard({ deck, onSelect, isLocked = false, onUnlock, showWordCount = true }: DeckCardProps) {
  const { settings } = useSettings();
  const pressAnim = useRef(new Animated.Value(0)).current;
  const tintColor = deck.color ?? colors.primary;
  const tintHigh = hexToRgba(tintColor, 0.18);
  const tintLow = hexToRgba(tintColor, 0.04);
  const [bevelTop, bevelBot] = computeBevel(tintColor);

  const handlePressIn = () => {
    if (settings.soundEnabled) playClickSound();
    Animated.spring(pressAnim, { toValue: 1, tension: 120, friction: 8, useNativeDriver: true }).start();
  };
  const handlePressOut = () =>
    Animated.spring(pressAnim, { toValue: 0, tension: 200, friction: 8, useNativeDriver: true }).start();

  const scale = pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] });

  const handlePress = () => {
    if (isLocked) onUnlock?.();
    else onSelect(deck);
  };

  return (
    <Animated.View style={[styles.shadow, { shadowColor: tintColor, transform: [{ scale }] }]}>
      {/* 3D bevel border — colored tints derived from deck's own color */}
      <LinearGradient
        colors={[bevelTop, bevelBot]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.bevel}
      >
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.card}
        >
          {/* Color tint gradient */}
          <LinearGradient
            colors={[tintHigh, tintLow]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Depth overlay */}
          <LinearGradient
            colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.12)']}
            locations={[0, 0.35, 0.65, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          {/* Lock overlay */}
          {isLocked && (
            <View style={styles.lockOverlay}>
              <Text style={styles.lockEmoji}>🔒</Text>
              <Text style={styles.lockLabel}>PREMIUM</Text>
            </View>
          )}

          <View style={[styles.content, isLocked && styles.contentLocked]}>
            {deck.image ? (
              <Image source={deck.image} style={styles.deckImage} />
            ) : (
              <Text style={styles.icon}>{deck.icon}</Text>
            )}
            <View style={styles.info}>
              <View style={styles.titleRow}>
                <Text style={styles.name} numberOfLines={1}>{deck.name}</Text>
                {deck.isPremium && (
                  <LinearGradient
                    colors={[colors.primary, '#7C3AED']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.proBadge}
                  >
                    <Text style={styles.proText}>PRO</Text>
                  </LinearGradient>
                )}
              </View>
              <Text style={styles.description} numberOfLines={2}>{deck.description}</Text>
              <View style={styles.meta}>
                {showWordCount && deck.words.length > 0 && (
                  <Text style={styles.metaText}>{deck.words.length} słów</Text>
                )}
                {deck.difficulty && (
                  <Text style={styles.metaText}>· {DIFFICULTY_LABEL[deck.difficulty] ?? deck.difficulty}</Text>
                )}
              </View>
            </View>
          </View>
        </Pressable>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: borderRadius.lg,
    backgroundColor: 'transparent',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: spacing.sm,
  },
  bevel: {
    borderRadius: borderRadius.lg,
    padding: 3,
  },
  card: {
    backgroundColor: 'rgba(30,41,59,0.95)',
    borderRadius: borderRadius.lg - 3,
    paddingTop: 4,
    paddingBottom: 0,
    paddingRight: spacing.md,
    paddingLeft: 4,
    overflow: 'hidden',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(10,14,26,0.65)',
    gap: 4,
  },
  lockEmoji: {
    fontSize: 26,
  },
  lockLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '800',
    letterSpacing: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  contentLocked: {
    opacity: 0.35,
  },
  icon: {
    fontSize: 36,
  },
  deckImage: {
    width: 100,
    height: 100,
    marginBottom: -2,
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  proBadge: {
    borderRadius: borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  proText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    gap: 4,
    marginTop: spacing.xs,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
