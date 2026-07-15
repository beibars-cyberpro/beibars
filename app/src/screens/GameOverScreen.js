import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

export default function GameOverScreen({ scores, playerId, onPlayAgain }) {
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const isTie = sorted.length > 1 && sorted[0].score === sorted[1].score;
  const iWon = !isTie && winner && winner.playerId === playerId;

  return (
    <View style={styles.container}>
      <Text style={styles.headline}>{isTie ? 'Ничья!' : iWon ? 'Вы победили! 🏆' : `${winner.name} побеждает! 🏆`}</Text>

      <View style={styles.board}>
        {sorted.map((s, i) => (
          <View key={s.playerId} style={styles.row}>
            <Text style={styles.rank}>{i + 1}</Text>
            <Text style={styles.name}>{s.name}</Text>
            <Text style={styles.score}>{s.score}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.button} onPress={onPlayAgain}>
        <Text style={styles.buttonText}>Новая игра</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
  headline: { color: colors.text, fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: spacing.xl },
  board: { backgroundColor: colors.surface, borderRadius: 14, padding: spacing.md, marginBottom: spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  rank: { color: colors.textMuted, width: 28, fontWeight: '700' },
  name: { color: colors.text, flex: 1, fontWeight: '700', fontSize: 16 },
  score: { color: colors.primary, fontWeight: '800', fontSize: 20 },
  button: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: '#001018', fontWeight: '800', fontSize: 16 },
});
