import { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { router } from '../src/shared/navigation';
import { Button, GradientBackground, useHeaderConfig, HEADER_BAR_HEIGHT } from '../src/shared/components';
import { usePaymentsContext } from '../src/core/payments/PaymentsProvider';
import { useAppReady } from '../src/core/AppReadyContext';
import { colors, spacing } from '../src/shared/theme';


export default function HomeScreen() {
  const { isPremium } = usePaymentsContext();
  const appReady = useAppReady();
  useHeaderConfig({ title: 'WordRushMF', isHome: true });

  const emojiScale  = useRef(new Animated.Value(0)).current;
  const emojiRotate = useRef(new Animated.Value(-0.3)).current;
  const fadeUp1     = useRef(new Animated.Value(0)).current;
  const slideUp1    = useRef(new Animated.Value(20)).current;
  const fadeUp2     = useRef(new Animated.Value(0)).current;
  const slideUp2    = useRef(new Animated.Value(20)).current;
  const playPulse    = useRef(new Animated.Value(1)).current;

  // Re-run entrance animation every time the home screen comes into focus.
  // Guarded by appReady so the animation fires only after the splash has
  // faded out — otherwise it would play hidden underneath the splash and
  // the home screen would appear unanimated.
  useFocusEffect(
    useCallback(() => {
      if (!appReady) return;

      emojiScale.setValue(0);
      emojiRotate.setValue(-0.3);
      fadeUp1.setValue(0);
      slideUp1.setValue(20);
      fadeUp2.setValue(0);
      slideUp2.setValue(20);
      playPulse.setValue(1);

      // Logo and subtitle appear together — no staggered wait
      const entrance = Animated.parallel([
        Animated.spring(emojiScale,  { toValue: 1, tension: 70, friction: 7, useNativeDriver: true }),
        Animated.spring(emojiRotate, { toValue: 0, tension: 70, friction: 7, useNativeDriver: true }),
        Animated.timing(fadeUp1,  { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(slideUp1, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(130),
          Animated.timing(fadeUp2,  { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(130),
          Animated.spring(slideUp2, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
        ]),
      ]);

      let pulseLoop: Animated.CompositeAnimation | null = null;

      entrance.start(() => {
        pulseLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(playPulse, { toValue: 1.04, duration: 1100, useNativeDriver: true }),
            Animated.timing(playPulse, { toValue: 1,    duration: 1100, useNativeDriver: true }),
          ]),
        );
        pulseLoop.start();
      });

      return () => {
        entrance.stop();
        pulseLoop?.stop();
      };
    }, [appReady])
  );

  const rotate = emojiRotate.interpolate({ inputRange: [-1, 1], outputRange: ['-18deg', '18deg'] });

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>

        {/* Space reserved for the persistent header rendered at the app root */}
        <View style={{ height: HEADER_BAR_HEIGHT }} />

        {/* Main content */}
        <View style={styles.main}>

          {/* Logo */}
          <View style={styles.logoSection}>
            <Animated.Image
              source={require('../assets/logo/logo_home.png')}
              style={[styles.logo, { transform: [{ scale: emojiScale }, { rotate }] }]}
              resizeMode="contain"
            />

            <Animated.View
              style={[styles.titleBlock, { opacity: fadeUp1, transform: [{ translateY: slideUp1 }] }]}
            >
              <Text style={styles.subtitle}>Odgadnij słowo zanim skończy się czas!</Text>
            </Animated.View>
          </View>

          {/* Buttons — same shared Button used everywhere else in the app */}
          <Animated.View
            style={[styles.actions, { opacity: fadeUp2, transform: [{ translateY: slideUp2 }] }]}
          >
            <Animated.View style={{ transform: [{ scale: playPulse }] }}>
              <Button label="🎮  Zagraj" variant="accent" size="lg" onPress={() => router.push('/decks')} />
            </Animated.View>

            <Button
              label={isPremium ? '👑  Masz Premium' : '👑  Zdobądź Premium'}
              variant={isPremium ? 'secondary' : 'primary'}
              size="lg"
              onPress={() => router.push('/store')}
            />
          </Animated.View>
        </View>

        <Text style={styles.footer}>Gra imprezowa dla znajomych ⚡</Text>

      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 48,
    gap: spacing.xl,
  },

  logoSection: {
    alignItems: 'center',
    gap: spacing.md,
  },
  logo: {
    width: 190,
    height: 190,
  },
  titleBlock: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  actions: {
    width: '100%',
    gap: spacing.lg,
  },

  footer: {
    textAlign: 'center',
    paddingBottom: spacing.lg,
    fontSize: 13,
    color: colors.white,
  },
});
