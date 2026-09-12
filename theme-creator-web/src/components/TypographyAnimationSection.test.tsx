import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { TypographyAnimationSection } from './TypographyAnimationSection';
import { useThemeStore } from '../store/useThemeStore';

afterEach(() => {
  cleanup();
  useThemeStore.setState({
    typography: {
      fontFamily: 'Segoe UI Variable',
      fontWeight: '400',
      characterSpacing: 0,
    },
    animations: {
      speed: 'default',
      durationMs: 250,
      easing: 'fluent-spring',
    },
  });
});

describe('TypographyAnimationSection', () => {
  it('renders typography and animation controls', () => {
    render(<TypographyAnimationSection />);
    expect(screen.getByLabelText(/Font Family/i)).toBeTruthy();
    expect(screen.getByText(/Regular/i)).toBeTruthy();
    expect(screen.getByLabelText(/Character Spacing/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Default \(250ms\)/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Fluent Spring/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Preview Flyout Animation/i })).toBeTruthy();
  });

  it('updates font family when a preset is selected', () => {
    render(<TypographyAnimationSection />);
    const select = screen.getByLabelText(/Font Family/i);
    fireEvent.change(select, { target: { value: 'JetBrains Mono' } });
    expect(useThemeStore.getState().typography.fontFamily).toBe('JetBrains Mono');
  });

  it('shows custom text input when Custom... is selected and updates store', () => {
    render(<TypographyAnimationSection />);
    const select = screen.getByLabelText(/Font Family/i);
    fireEvent.change(select, { target: { value: 'custom' } });

    const customInput = screen.getByLabelText(/Custom Font Family/i);
    expect(customInput).toBeTruthy();

    fireEvent.change(customInput, { target: { value: 'Fira Sans' } });
    expect(useThemeStore.getState().typography.fontFamily).toBe('Fira Sans');
  });

  it('updates font weight when weight pills are clicked', () => {
    render(<TypographyAnimationSection />);
    const lightBtn = screen.getByRole('button', { name: /300 \(Light\)/i });
    fireEvent.click(lightBtn);
    expect(useThemeStore.getState().typography.fontWeight).toBe('300');

    const boldBtn = screen.getByRole('button', { name: /700 \(Bold\)/i });
    fireEvent.click(boldBtn);
    expect(useThemeStore.getState().typography.fontWeight).toBe('700');
  });

  it('updates character spacing slider and store', () => {
    render(<TypographyAnimationSection />);
    const slider = screen.getByLabelText(/Character Spacing/i);
    fireEvent.change(slider, { target: { value: '35' } });
    expect(useThemeStore.getState().typography.characterSpacing).toBe(35);
  });

  it('updates animation speed when speed pills are clicked', () => {
    render(<TypographyAnimationSection />);
    const instantBtn = screen.getByRole('button', { name: /Instant \(0ms\)/i });
    fireEvent.click(instantBtn);
    expect(useThemeStore.getState().animations.speed).toBe('instant');
    expect(useThemeStore.getState().animations.durationMs).toBe(0);

    const snappyBtn = screen.getByRole('button', { name: /Snappy \(150ms\)/i });
    fireEvent.click(snappyBtn);
    expect(useThemeStore.getState().animations.speed).toBe('snappy');
    expect(useThemeStore.getState().animations.durationMs).toBe(150);

    const smoothBtn = screen.getByRole('button', { name: /Smooth \(400ms\)/i });
    fireEvent.click(smoothBtn);
    expect(useThemeStore.getState().animations.speed).toBe('smooth');
    expect(useThemeStore.getState().animations.durationMs).toBe(400);
  });

  it('updates easing curve when easing pills are clicked', () => {
    render(<TypographyAnimationSection />);
    const decelBtn = screen.getByRole('button', { name: /Decelerate/i });
    fireEvent.click(decelBtn);
    expect(useThemeStore.getState().animations.easing).toBe('decelerate');

    const linearBtn = screen.getByRole('button', { name: /Linear/i });
    fireEvent.click(linearBtn);
    expect(useThemeStore.getState().animations.easing).toBe('linear');
  });

  it('calls onTestAnimation when Preview Flyout Animation button is clicked', () => {
    const onTestAnimation = vi.fn();
    render(<TypographyAnimationSection onTestAnimation={onTestAnimation} />);
    const testBtn = screen.getByRole('button', { name: /Preview Flyout Animation/i });
    fireEvent.click(testBtn);
    expect(onTestAnimation).toHaveBeenCalledTimes(1);
  });
});
