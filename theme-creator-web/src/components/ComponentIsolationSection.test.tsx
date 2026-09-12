import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ComponentIsolationSection } from './ComponentIsolationSection';
import { useThemeStore } from '../store/useThemeStore';

afterEach(() => {
  cleanup();
  useThemeStore.setState({
    taskbarOverride: { enabled: false },
    startMenuOverride: { enabled: false },
    flyoutOverride: { enabled: false },
    materialStyle: 'fluent-acrylic',
    accentColor: '#0078D4',
  });
});

describe('ComponentIsolationSection', () => {
  it('renders component isolation tabs and toggles override', () => {
    render(<ComponentIsolationSection onOpenGradientEditor={() => {}} />);
    expect(screen.getByText('Taskbar')).toBeTruthy();
    expect(screen.getByText('Start Menu')).toBeTruthy();
    expect(screen.getByText('Flyouts')).toBeTruthy();
  });

  it('shows inheriting badge when override is disabled', () => {
    render(<ComponentIsolationSection onOpenGradientEditor={() => {}} />);
    expect(screen.getByText(/Inheriting global material, color, and blur settings\./i)).toBeTruthy();
    expect(screen.queryByLabelText(/Component Opacity/i)).toBeNull();
  });

  it('toggling override enables controls and updates store for active tab', () => {
    render(<ComponentIsolationSection onOpenGradientEditor={() => {}} />);
    const toggle = screen.getByLabelText(/Override Global Styling/i);
    expect(toggle).toBeTruthy();

    fireEvent.click(toggle);
    expect(useThemeStore.getState().taskbarOverride.enabled).toBe(true);
    expect(screen.queryByText(/Inheriting global material, color, and blur settings\./i)).toBeNull();
    expect(screen.getByLabelText(/Component Opacity/i)).toBeTruthy();
    expect(screen.getByLabelText(/Component Blur/i)).toBeTruthy();
  });

  it('switching tabs shows corresponding override state', () => {
    useThemeStore.setState({
      taskbarOverride: { enabled: true, materialStyle: 'mica' },
      startMenuOverride: { enabled: false },
    });

    render(<ComponentIsolationSection onOpenGradientEditor={() => {}} />);
    // In Taskbar tab (default), override is enabled
    expect(screen.queryByText(/Inheriting global material/i)).toBeNull();

    // Switch to Start Menu tab
    fireEvent.click(screen.getByText('Start Menu'));
    expect(screen.getByText(/Inheriting global material, color, and blur settings\./i)).toBeTruthy();

    // Switch to Flyouts tab
    fireEvent.click(screen.getByText('Flyouts'));
    expect(screen.getByText(/Inheriting global material, color, and blur settings\./i)).toBeTruthy();
  });

  it('selecting a material updates override in store', () => {
    useThemeStore.setState({
      taskbarOverride: { enabled: true },
    });

    render(<ComponentIsolationSection onOpenGradientEditor={() => {}} />);
    const micaBtn = screen.getByRole('button', { name: /^Mica$/i });
    fireEvent.click(micaBtn);
    expect(useThemeStore.getState().taskbarOverride.materialStyle).toBe('mica');

    const neonBtn = screen.getByRole('button', { name: /OLED Neon/i });
    fireEvent.click(neonBtn);
    expect(useThemeStore.getState().taskbarOverride.materialStyle).toBe('pure-black-neon');
  });

  it('changing opacity and blur updates override in store', () => {
    useThemeStore.setState({
      taskbarOverride: { enabled: true },
    });

    render(<ComponentIsolationSection onOpenGradientEditor={() => {}} />);
    const opacitySlider = screen.getByLabelText(/Component Opacity/i);
    fireEvent.change(opacitySlider, { target: { value: '80' } });
    expect(useThemeStore.getState().taskbarOverride.opacity).toBe(80);

    const blurSlider = screen.getByLabelText(/Component Blur/i);
    fireEvent.change(blurSlider, { target: { value: '45' } });
    expect(useThemeStore.getState().taskbarOverride.blur).toBe(45);
  });

  it('changing custom color updates override in store', () => {
    useThemeStore.setState({
      taskbarOverride: { enabled: true },
    });

    render(<ComponentIsolationSection onOpenGradientEditor={() => {}} />);
    const colorPicker = screen.getByLabelText(/Component Custom Color/i);
    fireEvent.change(colorPicker, { target: { value: '#ff5500' } });
    expect(useThemeStore.getState().taskbarOverride.customColor).toBe('#ff5500');
  });

  it('shows Edit Gradient button only when linear-gradient is selected and calls onOpenGradientEditor', () => {
    const onOpenGradientEditor = vi.fn();
    useThemeStore.setState({
      taskbarOverride: { enabled: true, materialStyle: 'linear-gradient' },
    });

    render(<ComponentIsolationSection onOpenGradientEditor={onOpenGradientEditor} />);
    const editBtn = screen.getByRole('button', { name: /Edit Gradient/i });
    expect(editBtn).toBeTruthy();

    fireEvent.click(editBtn);
    expect(onOpenGradientEditor).toHaveBeenCalledWith('taskbar');

    // Switch to startMenu and trigger for startMenu
    fireEvent.click(screen.getByText('Start Menu'));
    // Enable override on startMenu
    fireEvent.click(screen.getByLabelText(/Override Global Styling/i));
    fireEvent.click(screen.getByRole('button', { name: /Linear Gradient/i }));
    const editStartMenuBtn = screen.getByRole('button', { name: /Edit Gradient/i });
    fireEvent.click(editStartMenuBtn);
    expect(onOpenGradientEditor).toHaveBeenCalledWith('startMenu');
  });

  it('clicking Reset to Global sets enabled to false', () => {
    useThemeStore.setState({
      taskbarOverride: { enabled: true, materialStyle: 'mica', opacity: 70 },
    });

    render(<ComponentIsolationSection onOpenGradientEditor={() => {}} />);
    const resetBtn = screen.getByRole('button', { name: /Reset to Global/i });
    fireEvent.click(resetBtn);

    expect(useThemeStore.getState().taskbarOverride.enabled).toBe(false);
    expect(screen.getByText(/Inheriting global material, color, and blur settings\./i)).toBeTruthy();
  });
});
