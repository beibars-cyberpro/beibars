import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Share } from 'react-native';
import { colors, spacing } from '../theme';
import PlayerList from '../components/PlayerList';
import { SERVER_URL } from '../config';

const QUESTION_COUNT_OPTIONS = [10, 15, 20];

export default function LobbyScreen({ room, playerId, onStart, error }) {
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [questionCount, setQuestionCount] = useState(10);

  const isHost = room.hostId === playerId;

  useEffect(() => {
    fetch(`${SERVER_URL}/topics`)
      .then((res) => res.json())
      .then((data) => setTopics(data.topics || []))
      .catch(() => setTopics([]));
  }, []);

  const toggleTopic = (topic) => {
    setSelectedTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.codeLabel}>Код комнаты</Text>
      <Pressable onPress={() => Share.share({ message: `Заходи в игру! Код комнаты: ${room.code}` })}>
        <Text style={styles.code}>{room.code}</Text>
      </Pressable>
      <Text style={styles.hint}>Отправьте этот код второму игроку</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Игроки ({room.players.length})</Text>
        <PlayerList players={room.players} hostId={room.hostId} />
      </View>

      {isHost && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Количество вопросов</Text>
            <View style={styles.chipRow}>
              {QUESTION_COUNT_OPTIONS.map((count) => (
                <Pressable
                  key={count}
                  style={[styles.chip, questionCount === count && styles.chipActive]}
                  onPress={() => setQuestionCount(count)}
                >
                  <Text style={[styles.chipText, questionCount === count && styles.chipTextActive]}>{count}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Темы (необязательно, по умолчанию — все)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {topics.map((topic) => (
                  <Pressable
                    key={topic}
                    style={[styles.chip, selectedTopics.includes(topic) && styles.chipActive]}
                    onPress={() => toggleTopic(topic)}
                  >
                    <Text style={[styles.chipText, selectedTopics.includes(topic) && styles.chipTextActive]}>
                      {topic}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={[styles.button, room.players.length < 2 && styles.buttonDisabled]}
            disabled={room.players.length < 2}
            onPress={() => onStart({ questionCount, topics: selectedTopics })}
          >
            <Text style={styles.buttonText}>
              {room.players.length < 2 ? 'Ждём второго игрока…' : 'Начать игру'}
            </Text>
          </Pressable>
        </>
      )}

      {!isHost && <Text style={styles.waiting}>Ждём, пока хост начнёт игру…</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  codeLabel: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg },
  code: { color: colors.primary, fontSize: 48, fontWeight: '900', textAlign: 'center', letterSpacing: 8 },
  hint: { color: colors.textMuted, textAlign: 'center', marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg },
  sectionTitle: { color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontWeight: '600' },
  chipTextActive: { color: '#001018' },
  button: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 'auto' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#001018', fontWeight: '800', fontSize: 16 },
  waiting: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
  error: { color: colors.incorrect, marginBottom: spacing.md, textAlign: 'center' },
});
