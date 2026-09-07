import { render, cleanup } from '@testing-library/react';
import { test, expect, afterEach } from 'vitest';
import PreviewCanvas from './PreviewCanvas';
import { useThemeStore } from '../store/useThemeStore';

afterEach(() => {
  cleanup();
});

test('disables backdrop blur and uses rgba gradient in gradient mode with secondary accent on left', () => {
  useThemeStore.setState({
    accentColor: '#ff007f', // [255, 0, 127]
    secondaryAccent: '#00f3ff', // [0, 243, 255]
    taskbarMode: 'gradient',
    taskbarOpacity: 80,
    activePane: 'start',
  });

  const { container } = render(<PreviewCanvas />);
  
  const taskbar = container.querySelector('.h-12.w-full') as HTMLElement;
  expect(taskbar).toBeTruthy();
  expect(taskbar.style.backdropFilter).toBe('none');
  expect(taskbar.style.background).toContain('linear-gradient(90deg, rgba(0, 243, 255, 0.8) 0%');

  // Verify weather widget is removed
  expect(container.textContent).not.toContain('22°C');
  expect(container.textContent).not.toContain('Mostly Sunny');

  // Start Menu flyout is positioned on the left with a gap above taskbar
  const startMenu = container.querySelector('.w-\\[580px\\]') as HTMLElement;
  expect(startMenu).toBeTruthy();
  expect(startMenu.className).toContain('absolute left-3 bottom-3');
  expect(startMenu.style.backdropFilter).toBe('none');
  expect(startMenu.style.background).toContain('linear-gradient');
  expect(startMenu.style.border).toContain('2px solid');
  expect(taskbar.style.borderTop).toContain('2px solid');
});

test('respects custom borderThickness across taskbar and flyouts', () => {
  useThemeStore.setState({
    accentColor: '#ff007f',
    borderThickness: 4,
    activePane: 'start',
  });

  const { container } = render(<PreviewCanvas />);
  const taskbar = container.querySelector('.h-12.w-full') as HTMLElement;
  const startMenu = container.querySelector('.w-\\[580px\\]') as HTMLElement;

  expect(taskbar.style.borderTop).toContain('4px solid');
  expect(startMenu.style.border).toContain('4px solid');
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
