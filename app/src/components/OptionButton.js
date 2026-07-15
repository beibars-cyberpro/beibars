import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function OptionButton({ index, label, onPress, disabled, state }) {
  // state: 'idle' | 'selected' | 'correct' | 'incorrect' | 'muted'
  const baseColor = colors.optionColors[index];
  let backgroundColor = baseColor;
  let opacity = 1;

  if (state === 'correct') backgroundColor = colors.correct;
  else if (state === 'incorrect') backgroundColor = colors.incorrect;
  else if (state === 'muted') opacity = 0.35;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, opacity: pressed && !disabled ? 0.8 : opacity },
        state === 'selected' && styles.selectedBorder,
      ]}
    >
      <Text style={styles.letter}>{LETTERS[index]}</Text>
      <Text style={styles.label} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 12,
    minHeight: 64,
  },
  selectedBorder: {
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  letter: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 18,
    width: 28,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
});
