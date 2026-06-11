import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MuteButton } from './MuteButton';
import { colors, spacing, borderRadius } from '../theme';

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
const BTN_INNER = BTN - 6; // 3 px bevel on each side

// Identical structure to MuteButton so both buttons look the same
function HeaderBtn({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    // Shadow wrapper — no overflow so shadow shows on iOS
    <View style={styles.btnShadow}>
      {/* Clip wrapper — clips LinearGradient to circle on Android */}
      <TouchableOpacity onPress={onPress} style={styles.btnClip} accessibilityRole="button">
        <LinearGradient
          colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.12)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.btnBevel}
        >
          {/* Explicit inner circle — mirrors MuteButton's inner View */}
          <View style={styles.btnInner}>
            <LinearGradient
              colors={['rgba(255,255,255,0.24)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.20)']}
              locations={[0, 0.38, 0.62, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <Text style={styles.btnLabel}>{label}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

export function PageHeader({ title = 'Dummy', isHome = false, showBack = false, onBack }: PageHeaderProps) {
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

      {/* Center — title badge wraps to text width only */}
      <View style={styles.centerSlot}>
        <View style={styles.titleShadow}>
          <LinearGradient
            colors={['rgba(255,255,255,0.32)', 'rgba(0,0,0,0.42)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.titleBevel}
          >
            <View style={styles.titleInner}>
              <LinearGradient
                colors={['rgba(255,255,255,0.20)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.24)']}
                locations={[0, 0.38, 0.62, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Right slot — MuteButton always visible */}
      <View style={styles.sideSlot}>
        <MuteButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
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
  },

  // ── Icon button (⚙️ / ←) ──────────────────────────────────
  btnShadow: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.40,
    shadowRadius: 6,
    elevation: 5,
  },
  btnClip: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    overflow: 'hidden',
  },
  btnBevel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  // Explicit circular inner — identical to MuteButton's inner View
  btnInner: {
    width: BTN_INNER,
    height: BTN_INNER,
    borderRadius: BTN_INNER / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(22,36,58,0.82)',
    overflow: 'hidden',
  },
  btnLabel: {
    fontSize: 22,
    color: colors.white,
  },

  // ── Title badge ───────────────────────────────────────────
  titleShadow: {
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.42,
    shadowRadius: 8,
    elevation: 5,
  },
  titleBevel: {
    borderRadius: borderRadius.lg,
    padding: 3, // thicker "chrome edge"
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
  },
});
