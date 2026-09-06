import { render, screen, fireEvent } from '@testing-library/react';
import { test, expect } from 'vitest';
import Sidebar from './Sidebar';
import { useThemeStore } from '../store/useThemeStore';

test('renders sliders and updates store', () => {
  render(<Sidebar />);
  const blurSlider = screen.getByLabelText(/Taskbar Blur/i) as HTMLInputElement;
  fireEvent.change(blurSlider, { target: { value: '20' } });
  expect(useThemeStore.getState().taskbarBlur).toBe(20);
});
