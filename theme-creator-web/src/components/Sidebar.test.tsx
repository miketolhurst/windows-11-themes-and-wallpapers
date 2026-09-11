import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { test, expect, afterEach } from 'vitest';
import Sidebar from './Sidebar';
import { useThemeStore } from '../store/useThemeStore';

afterEach(() => {
  cleanup();
  useThemeStore.setState({
    isSidebarCollapsed: false,
    dockMode: false,
    materialStyle: 'fluent-acrylic',
  });
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

test('renders Border Thickness slider and updates store', () => {
  render(<Sidebar />);
  const borderSlider = screen.getByLabelText(/Border Thickness/i) as HTMLInputElement;
  fireEvent.change(borderSlider, { target: { value: '4' } });
  expect(useThemeStore.getState().borderThickness).toBe(4);
});

test('renders Material Style label and sticky Download button', () => {
  render(<Sidebar />);
  expect(screen.getByText(/Material Style/i)).toBeTruthy();
  expect(screen.getByText(/Download Theme \(\.zip\)/i)).toBeTruthy();
});

test('toggles sidebar collapse and handles undo button', () => {
  useThemeStore.setState({ isSidebarCollapsed: false, past: [] });
  render(<Sidebar />);

  // Undo button should be disabled when past is empty
  const undoBtn = screen.getByTitle(/Undo \(Ctrl\+Z\)/i) as HTMLButtonElement;
  expect(undoBtn.disabled).toBe(true);

  // Collapse button
  const collapseBtn = screen.getByTitle(/Collapse sidebar/i);
  fireEvent.click(collapseBtn);
  expect(useThemeStore.getState().isSidebarCollapsed).toBe(true);
});

test('toggles floating dock mode and adjusts dock margin', () => {
  useThemeStore.setState({ dockMode: false, dockMargin: 12 });
  render(<Sidebar />);

  const dockCheckbox = screen.getByLabelText(/Floating Dock Mode/i) as HTMLInputElement;
  expect(dockCheckbox.checked).toBe(false);

  fireEvent.click(dockCheckbox);
  expect(useThemeStore.getState().dockMode).toBe(true);

  // Now dock margin slider should be visible
  const marginSlider = screen.getByLabelText(/Dock Margin/i) as HTMLInputElement;
  fireEvent.change(marginSlider, { target: { value: '24' } });
  expect(useThemeStore.getState().dockMargin).toBe(24);
});

test('updates running indicator style when indicator buttons are clicked', () => {
  useThemeStore.setState({ runningIndicatorStyle: 'standard' });
  render(<Sidebar />);

  const dotBtn = screen.getByLabelText(/Indicator Dot/i);
  fireEvent.click(dotBtn);
  expect(useThemeStore.getState().runningIndicatorStyle).toBe('dot');

  const glowBtn = screen.getByLabelText(/Indicator Glow/i);
  fireEvent.click(glowBtn);
  expect(useThemeStore.getState().runningIndicatorStyle).toBe('glow');
});

test('updates material style when material buttons are clicked', () => {
  useThemeStore.setState({ materialStyle: 'fluent-acrylic' });
  render(<Sidebar />);

  const neonBtn = screen.getByText(/OLED Neon/i);
  fireEvent.click(neonBtn);
  expect(useThemeStore.getState().materialStyle).toBe('pure-black-neon');
});

