import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StartButtonAndIndicatorsSection } from './StartButtonAndIndicatorsSection';
import { useThemeStore } from '../store/useThemeStore';

afterEach(() => {
  cleanup();
});

describe('StartButtonAndIndicatorsSection', () => {
  beforeEach(() => {
    useThemeStore.getState().resetToDefaults();
  });

  it('renders start button mode selector buttons', () => {
    render(<StartButtonAndIndicatorsSection />);
    expect(screen.getByText('Start Button & Indicators')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Windows Default/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Vector Presets/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Upload Custom/i })).toBeTruthy();
  });

  it('changes vector preset from dropdown', () => {
    render(<StartButtonAndIndicatorsSection />);
    fireEvent.click(screen.getByRole('button', { name: /Vector Presets/i }));
    const dropdown = screen.getByLabelText(/Start Button Vector Preset/i);
    fireEvent.change(dropdown, { target: { value: 'cyberpunk-hex' } });
    expect(useThemeStore.getState().startButton.presetId).toBe('cyberpunk-hex');
    expect(useThemeStore.getState().startButton.type).toBe('preset');
  });

  it('changes color mode to secondary or custom HEX', () => {
    render(<StartButtonAndIndicatorsSection />);
    fireEvent.click(screen.getByRole('button', { name: /Vector Presets/i }));

    const secondaryPill = screen.getByRole('button', { name: /Start Icon Secondary Accent/i });
    fireEvent.click(secondaryPill);
    expect(useThemeStore.getState().startButton.colorMode).toBe('secondary');

    const customPill = screen.getByRole('button', { name: /Start Icon Custom HEX/i });
    fireEvent.click(customPill);
    expect(useThemeStore.getState().startButton.colorMode).toBe('custom');
  });

  it('changes running indicator style when style pills are clicked', () => {
    render(<StartButtonAndIndicatorsSection />);
    const dotButton = screen.getByRole('button', { name: /^Dot$/i });
    fireEvent.click(dotButton);
    expect(useThemeStore.getState().runningIndicator.style).toBe('dot');

    const pillButton = screen.getByRole('button', { name: /^Pill$/i });
    fireEvent.click(pillButton);
    expect(useThemeStore.getState().runningIndicator.style).toBe('pill');

    const glowButton = screen.getByRole('button', { name: /^Glow$/i });
    fireEvent.click(glowButton);
    expect(useThemeStore.getState().runningIndicator.style).toBe('glow');

    const offButton = screen.getByRole('button', { name: /^Off$/i });
    fireEvent.click(offButton);
    expect(useThemeStore.getState().runningIndicator.style).toBe('off');
  });

  it('updates indicator active and inactive color modes', () => {
    render(<StartButtonAndIndicatorsSection />);
    const whiteButton = screen.getByRole('button', { name: /Active Indicator White/i });
    fireEvent.click(whiteButton);
    expect(useThemeStore.getState().runningIndicator.activeColorMode).toBe('white');

    const inactiveSubtle = screen.getByRole('button', { name: /Inactive Indicator Subtle White/i });
    fireEvent.click(inactiveSubtle);
    expect(useThemeStore.getState().runningIndicator.inactiveColorMode).toBe('subtle-white');
  });
});
