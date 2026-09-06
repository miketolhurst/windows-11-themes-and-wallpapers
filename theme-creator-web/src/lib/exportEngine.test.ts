import { expect, test } from 'vitest';
import { generateRegFileString } from './exportEngine';
import { ThemeState } from '../store/useThemeStore';

test('generates correct registry string for taskbar blur', () => {
  const mockState = { taskbarBlur: 25, startMenuBlur: 15, notificationBlur: 15 } as ThemeState;
  const regString = generateRegFileString(mockState);
  expect(regString).toContain('windows-11-taskbar-styler');
  expect(regString).toContain('BlurAmount=\\"25\\"');
});
