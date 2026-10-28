import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';
import PlayerList from '../components/PlayerList';
import { SERVER_URL } from '../config';
import { shareRoomCode } from '../shareCode';

const QUESTION_COUNT_OPTIONS = [10, 15, 20];

const CFA_TOPICS = [
  'Quantitative Methods',
  'Economics',
  'Financial Statement Analysis',
  'Corporate Issuers',
  'Equity Investments',
  'Fixed Income',
  'Derivatives',
  'Alternative Investments',
  'Portfolio Management',
  'Ethics and Professional Standards',
  'Macro & Central Banks',
];

const ROW_PALETTE = [
  '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#10b981',
  '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#ec4899', '#f43f5e', '#84cc16',
];

function colorFor(index) {
  return ROW_PALETTE[index % ROW_PALETTE.length];
}

function TopicRow({ label, color, selected, badge, onPress }) {
  return (
    <Pressable
      style={[styles.row, { backgroundColor: color }, selected && styles.rowSelected, !selected && styles.rowDimmed]}
      onPress={onPress}
    >
      <Text style={styles.rowText} numberOfLines={2}>{label}</Text>
      <View style={styles.rowRight}>
        {!!badge && <Text style={styles.rowBadge}>{badge}</Text>}
        {selected && <Text style={styles.rowCheck}>✓</Text>}
      </View>
    </Pressable>
  );
}

export default function LobbyScreen({ room, playerId, onStart, error }) {
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [view, setView] = useState('settings'); // 'settings' | 'cfaSub' | 'ready'
  const [justCopied, setJustCopied] = useState(false);

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

  const handleShare = async () => {
    const result = await shareRoomCode(room.code);
    if (result === 'copied') {
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 2000);
    }
  };

  const cfaTopics = topics.filter((t) => CFA_TOPICS.includes(t));
  const otherTopics = topics.filter((t) => !CFA_TOPICS.includes(t));
  const cfaSelectedCount = selectedTopics.filter((t) => CFA_TOPICS.includes(t)).length;

  const canStart = room.players.length >= 2;

  return (
    <View style={styles.container}>
      <Text style={styles.codeLabel}>Код комнаты</Text>
      <Pressable onPress={handleShare}>
        <Text style={styles.code}>{room.code}</Text>
      </Pressable>
      <Text style={styles.hint}>{justCopied ? 'Код скопирован!' : 'Отправьте этот код второму игроку'}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Игроки ({room.players.length})</Text>
        <PlayerList players={room.players} hostId={room.hostId} />
      </View>

      {!isHost && <Text style={styles.waiting}>Ждём, пока хост начнёт игру…</Text>}

      {isHost && view === 'settings' && (
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

          <Text style={styles.sectionTitle}>Темы (необязательно, по умолчанию — все)</Text>
          <ScrollView style={styles.topicList} showsVerticalScrollIndicator={false}>
            <TopicRow
              label="CFA (финансы)"
              color={colorFor(0)}
              selected={cfaSelectedCount > 0}
              badge={cfaSelectedCount > 0 ? String(cfaSelectedCount) : null}
              onPress={() => setView('cfaSub')}
            />
            {otherTopics.map((topic, i) => (
              <TopicRow
                key={topic}
                label={topic}
                color={colorFor(i + 1)}
                selected={selectedTopics.includes(topic)}
                onPress={() => toggleTopic(topic)}
              />
            ))}
          </ScrollView>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={[styles.button, !canStart && styles.buttonDisabled]}
            disabled={!canStart}
            onPress={() => setView('ready')}
          >
            <Text style={styles.buttonText}>
              {!canStart ? 'Ждём второго игрока…' : 'Далее'}
            </Text>
          </Pressable>
        </>
      )}

      {isHost && view === 'cfaSub' && (
        <>
          <Pressable style={styles.backLink} onPress={() => setView('settings')}>
            <Text style={styles.backLinkText}>← Назад ко всем темам</Text>
          </Pressable>
          <Text style={styles.sectionTitle}>Темы CFA</Text>
          <ScrollView style={styles.topicList} showsVerticalScrollIndicator={false}>
            {cfaTopics.map((topic, i) => (
              <TopicRow
                key={topic}
                label={topic}
                color={colorFor(i)}
                selected={selectedTopics.includes(topic)}
                onPress={() => toggleTopic(topic)}
              />
            ))}
          </ScrollView>
          <Pressable style={styles.button} onPress={() => setView('settings')}>
            <Text style={styles.buttonText}>Готово</Text>
          </Pressable>
        </>
      )}

      {isHost && view === 'ready' && (
        <View style={styles.readyBox}>
          <Pressable style={styles.backLink} onPress={() => setView('settings')}>
            <Text style={styles.backLinkText}>← Изменить настройки</Text>
          </Pressable>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Вопросов</Text>
            <Text style={styles.summaryValue}>{questionCount}</Text>
            <Text style={styles.summaryLabel}>Темы</Text>
            <Text style={styles.summaryValue}>
              {selectedTopics.length === 0 ? 'Все темы' : selectedTopics.join(', ')}
            </Text>
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Pressable style={styles.goButton} onPress={() => onStart({ questionCount, topics: selectedTopics })}>
            <Text style={styles.goButtonText}>Поехали! 🚀</Text>
          </Pressable>
        </View>
      )}
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
  topicList: { flex: 1, marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  rowSelected: { borderWidth: 2, borderColor: '#ffffff' },
  rowDimmed: { opacity: 0.6 },
  rowText: { color: '#ffffff', fontWeight: '700', fontSize: 15, flex: 1, marginRight: 8 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowBadge: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  rowCheck: { color: '#ffffff', fontWeight: '900', fontSize: 16 },
  backLink: { marginBottom: spacing.sm },
  backLinkText: { color: colors.primary, fontWeight: '700' },
  button: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#001018', fontWeight: '800', fontSize: 16 },
  waiting: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
  error: { color: colors.incorrect, marginBottom: spacing.md, textAlign: 'center' },
  readyBox: { flex: 1, justifyContent: 'center' },
  summaryBox: { backgroundColor: colors.surface, borderRadius: 14, padding: spacing.lg, marginBottom: spacing.xl },
  summaryLabel: { color: colors.textMuted, fontWeight: '600', marginTop: spacing.sm },
  summaryValue: { color: colors.text, fontWeight: '800', fontSize: 18, marginTop: 2 },
  goButton: {
    backgroundColor: colors.correct,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  goButtonText: { color: '#001018', fontWeight: '900', fontSize: 22 },
});
