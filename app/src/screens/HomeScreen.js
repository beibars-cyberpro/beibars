import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing } from '../theme';

export default function HomeScreen({ onCreate, onJoin, busy, error }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState('create'); // 'create' | 'join'

  const canSubmit = name.trim().length > 0 && (mode === 'create' || code.trim().length === 4);

  const submit = () => {
    if (!canSubmit || busy) return;
    if (mode === 'create') onCreate(name.trim());
    else onJoin(name.trim(), code.trim().toUpperCase());
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>CFA Quiz Duel</Text>
      <Text style={styles.subtitle}>Дуэль на знание CFA Level 2 и макроэкономики</Text>

      <View style={styles.tabRow}>
        <Pressable style={[styles.tab, mode === 'create' && styles.tabActive]} onPress={() => setMode('create')}>
          <Text style={[styles.tabText, mode === 'create' && styles.tabTextActive]}>Создать комнату</Text>
        </Pressable>
        <Pressable style={[styles.tab, mode === 'join' && styles.tabActive]} onPress={() => setMode('join')}>
          <Text style={[styles.tabText, mode === 'join' && styles.tabTextActive]}>Войти по коду</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Ваше имя"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
        maxLength={20}
      />

      {mode === 'join' && (
        <TextInput
          style={[styles.input, styles.codeInput]}
          placeholder="КОД КОМНАТЫ"
          placeholderTextColor={colors.textMuted}
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase().slice(0, 4))}
          autoCapitalize="characters"
          maxLength={4}
        />
      )}

      {!!error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        style={[styles.button, (!canSubmit || busy) && styles.buttonDisabled]}
        onPress={submit}
        disabled={!canSubmit || busy}
      >
        {busy ? (
          <ActivityIndicator color="#001018" />
        ) : (
          <Text style={styles.buttonText}>{mode === 'create' ? 'Создать' : 'Присоединиться'}</Text>
        )}
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
  title: { color: colors.text, fontSize: 30, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xl },
  tabRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 12, padding: 4, marginBottom: spacing.lg },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontWeight: '700' },
  tabTextActive: { color: '#001018' },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  codeInput: { textAlign: 'center', fontSize: 24, fontWeight: '800', letterSpacing: 6 },
  error: { color: colors.incorrect, marginBottom: spacing.md, textAlign: 'center' },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#001018', fontWeight: '800', fontSize: 16 },
});
