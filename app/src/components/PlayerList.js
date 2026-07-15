import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

export default function PlayerList({ players, hostId }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  return (
    <View style={styles.wrapper}>
      {sorted.map((player) => (
        <View key={player.id} style={styles.row}>
          <View style={styles.nameWrap}>
            <View style={[styles.dot, { backgroundColor: player.connected ? colors.correct : colors.textMuted }]} />
            <Text style={styles.name} numberOfLines={1}>
              {player.name}
              {player.id === hostId ? ' 👑' : ''}
            </Text>
          </View>
          <Text style={styles.score}>{player.score}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  nameWrap: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  name: { color: colors.text, fontSize: 16, fontWeight: '600', flexShrink: 1 },
  score: { color: colors.primary, fontSize: 18, fontWeight: '800' },
});
