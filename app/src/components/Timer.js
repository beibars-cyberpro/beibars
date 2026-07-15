import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function Timer({ startedAt, timeLimitMs, frozen }) {
  const [remainingMs, setRemainingMs] = useState(timeLimitMs);

  useEffect(() => {
    if (frozen) return undefined;
    const tick = () => {
      const elapsed = Date.now() - startedAt;
      setRemainingMs(Math.max(0, timeLimitMs - elapsed));
    };
    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [startedAt, timeLimitMs, frozen]);

  const fraction = Math.max(0, Math.min(1, remainingMs / timeLimitMs));
  const seconds = Math.ceil(remainingMs / 1000);
  const barColor = fraction > 0.33 ? colors.primary : colors.incorrect;

  return (
    <View style={styles.wrapper}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${fraction * 100}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={styles.seconds}>{seconds}с</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  track: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 5 },
  seconds: { color: colors.text, fontVariant: ['tabular-nums'], width: 32, fontWeight: '600' },
});
