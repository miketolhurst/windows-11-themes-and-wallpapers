import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { test, expect, afterEach } from 'vitest';
import Sidebar from './Sidebar';
import { useThemeStore } from '../store/useThemeStore';

afterEach(() => {
  cleanup();
});

test('renders sliders and updates store in blur mode', () => {
  useThemeStore.setState({ taskbarMode: 'blur' });
  render(<Sidebar />);
  const blurSlider = screen.getByLabelText(/Taskbar Blur/i) as HTMLInputElement;
  fireEvent.change(blurSlider, { target: { value: '20' } });
  expect(useThemeStore.getState().taskbarBlur).toBe(20);
});

test('renders opacity sliders and updates store in gradient mode', () => {
  useThemeStore.setState({ taskbarMode: 'gradient' });
  render(<Sidebar />);
  const opacitySlider = screen.getByLabelText(/Taskbar Opacity/i) as HTMLInputElement;
  fireEvent.change(opacitySlider, { target: { value: '75' } });
  expect(useThemeStore.getState().taskbarOpacity).toBe(75);
});
