import { render, cleanup } from '@testing-library/react';
import { test, expect, afterEach } from 'vitest';
import PreviewCanvas from './PreviewCanvas';
import { useThemeStore } from '../store/useThemeStore';

afterEach(() => {
  cleanup();
});

test('disables backdrop blur and uses rgba gradient in gradient mode', () => {
  useThemeStore.setState({
    taskbarMode: 'gradient',
    taskbarOpacity: 80,
    activePane: 'start',
  });

  const { container } = render(<PreviewCanvas />);
  
  const taskbar = container.querySelector('.h-12.w-full') as HTMLElement;
  expect(taskbar).toBeTruthy();
  expect(taskbar.style.backdropFilter).toBe('none');
  expect(taskbar.style.background).toContain('linear-gradient');
  expect(taskbar.style.background).toContain('rgba(');

  const startMenu = container.querySelector('.w-\\[580px\\]') as HTMLElement;
  expect(startMenu).toBeTruthy();
  expect(startMenu.style.backdropFilter).toBe('none');
  expect(startMenu.style.background).toContain('linear-gradient');
});

test('enables backdrop blur in blur mode', () => {
  useThemeStore.setState({
    taskbarMode: 'blur',
    taskbarBlur: 22,
    startMenuBlur: 18,
    activePane: 'start',
  });

  const { container } = render(<PreviewCanvas />);
  
  const taskbar = container.querySelector('.h-12.w-full') as HTMLElement;
  expect(taskbar).toBeTruthy();
  expect(taskbar.style.backdropFilter).toBe('blur(22px)');

  const startMenu = container.querySelector('.w-\\[580px\\]') as HTMLElement;
  expect(startMenu).toBeTruthy();
  expect(startMenu.style.backdropFilter).toBe('blur(18px)');
});
