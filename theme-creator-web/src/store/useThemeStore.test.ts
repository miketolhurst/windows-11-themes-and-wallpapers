import { expect, test } from 'vitest';
import { useThemeStore } from './useThemeStore';

test('store initializes with default values', () => {
  const state = useThemeStore.getState();
  expect(state.accentColor).toBe('#0078D4');
  expect(state.taskbarBlur).toBe(10);
});

test('can update accent color', () => {
  useThemeStore.getState().setAccentColor('#FF0000');
  expect(useThemeStore.getState().accentColor).toBe('#FF0000');
});

test('can update borderThickness', () => {
  expect(useThemeStore.getState().borderThickness).toBe(2);
  useThemeStore.getState().setBorderThickness(4);
  expect(useThemeStore.getState().borderThickness).toBe(4);
});
