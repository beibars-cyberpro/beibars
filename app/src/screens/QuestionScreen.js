import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';
import Timer from '../components/Timer';
import OptionButton from '../components/OptionButton';

export default function QuestionScreen({ question, onAnswer, myAnswerIndex }) {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setSelected(null);
  }, [question.index]);

  const handlePress = (index) => {
    if (selected !== null) return;
    setSelected(index);
    onAnswer(index);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.progress}>
          Вопрос {question.index + 1} / {question.total}
        </Text>
        <Text style={styles.topic}>{question.topic}</Text>
      </View>

      <Timer startedAt={question.startedAt} timeLimitMs={question.timeLimitMs} frozen={selected !== null} />

      <View style={styles.questionBox}>
        <Text style={styles.questionText}>{question.question}</Text>
      </View>

      <View style={styles.options}>
        {question.options.map((label, index) => (
          <OptionButton
            key={index}
            index={index}
            label={label}
            disabled={selected !== null}
            state={selected === index ? 'selected' : selected !== null ? 'muted' : 'idle'}
            onPress={() => handlePress(index)}
          />
        ))}
      </View>

      {selected !== null && <Text style={styles.waitingText}>Ответ отправлен, ждём соперника…</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  progress: { color: colors.textMuted, fontWeight: '600' },
  topic: { color: colors.primary, fontWeight: '700' },
  questionBox: { flex: 1, justifyContent: 'center', paddingVertical: spacing.lg },
  questionText: { color: colors.text, fontSize: 22, fontWeight: '700', textAlign: 'center', lineHeight: 30 },
  options: { marginBottom: spacing.md },
  waitingText: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
});
