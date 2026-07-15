import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing } from '../theme';
import OptionButton from '../components/OptionButton';

function optionState(index, reveal) {
  return index === reveal.correctIndex ? 'correct' : 'muted';
}

export default function RevealScreen({ reveal, question, isHost, onNext }) {
  const isLast = question.index >= question.total - 1;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.questionText}>{question.question}</Text>

        <View style={styles.options}>
          {question.options.map((label, index) => (
            <OptionButton key={index} index={index} label={label} disabled state={optionState(index, reveal)} />
          ))}
        </View>

        {!!reveal.explanation && (
          <View style={styles.explanationBox}>
            <Text style={styles.explanationTitle}>Почему</Text>
            <Text style={styles.explanationText}>{reveal.explanation}</Text>
          </View>
        )}

        <View style={styles.resultsBox}>
          {reveal.results.map((r) => (
            <View key={r.playerId} style={styles.resultRow}>
              <Text style={[styles.resultName, r.correct ? styles.correctText : styles.incorrectText]}>
                {r.name}
              </Text>
              <Text style={styles.resultDetail}>
                {r.optionIndex === null ? 'не ответил' : r.correct ? `верно, ${(r.timeMs / 1000).toFixed(1)}с` : 'неверно'}
              </Text>
              {r.pointsAwarded > 0 && <Text style={styles.pointBadge}>+{r.pointsAwarded}</Text>}
            </View>
          ))}
        </View>

        <View style={styles.scoreBox}>
          <Text style={styles.scoreTitle}>Счёт</Text>
          {[...reveal.scores]
            .sort((a, b) => b.score - a.score)
            .map((s) => (
              <View key={s.playerId} style={styles.scoreRow}>
                <Text style={styles.scoreName}>{s.name}</Text>
                <Text style={styles.scoreValue}>{s.score}</Text>
              </View>
            ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isHost ? (
          <Pressable style={styles.button} onPress={onNext}>
            <Text style={styles.buttonText}>{isLast ? 'Результаты' : 'Дальше'}</Text>
          </Pressable>
        ) : (
          <Text style={styles.waitingText}>Ждём хоста…</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.md },
  questionText: { color: colors.textMuted, fontSize: 16, fontWeight: '600', marginBottom: spacing.md },
  options: { marginBottom: spacing.md },
  explanationBox: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginBottom: spacing.lg },
  explanationTitle: { color: colors.primary, fontWeight: '800', marginBottom: 4 },
  explanationText: { color: colors.text, lineHeight: 20 },
  resultsBox: { marginBottom: spacing.lg },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  resultName: { fontWeight: '700', flex: 1 },
  correctText: { color: colors.correct },
  incorrectText: { color: colors.incorrect },
  resultDetail: { color: colors.textMuted, marginRight: spacing.sm },
  pointBadge: {
    color: '#001018',
    backgroundColor: colors.primary,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  scoreBox: { backgroundColor: colors.surfaceAlt, borderRadius: 12, padding: spacing.md },
  scoreTitle: { color: colors.textMuted, fontWeight: '700', marginBottom: spacing.sm },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  scoreName: { color: colors.text, fontWeight: '600' },
  scoreValue: { color: colors.primary, fontWeight: '800' },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  button: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: '#001018', fontWeight: '800', fontSize: 16 },
  waitingText: { color: colors.textMuted, textAlign: 'center' },
});
