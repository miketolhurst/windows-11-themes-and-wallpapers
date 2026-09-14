import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { TerminalPreviewWindow } from './TerminalPreviewWindow';
import { useThemeStore } from '../store/useThemeStore';

afterEach(() => {
  cleanup();
});

describe('TerminalPreviewWindow', () => {
  it('renders terminal window with tabs and prompt', () => {
    render(<TerminalPreviewWindow />);
    expect(screen.getByTestId('terminal-window')).toBeTruthy();
    expect(screen.getAllByText(/PowerShell/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/PS C:\\Users\\Windows11>/i).length).toBeGreaterThan(0);
  });

  it('applies custom typography from store', () => {
    useThemeStore.setState({
      typography: {
        fontFamily: 'Cascadia Code',
        fontWeight: '600',
        characterSpacing: 1,
      },
    });

    render(<TerminalPreviewWindow />);
    const term = screen.getByTestId('terminal-body');
    expect(term.style.fontFamily).toContain('Cascadia Code');
    expect(term.style.fontWeight).toBe('600');
  });
});
