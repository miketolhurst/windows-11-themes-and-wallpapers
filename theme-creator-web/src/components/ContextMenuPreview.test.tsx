import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { ContextMenuPreview } from './ContextMenuPreview';
import { useThemeStore } from '../store/useThemeStore';

afterEach(() => {
  cleanup();
});

describe('ContextMenuPreview', () => {
  it('renders modern WinUI 3 context menu by default', () => {
    render(<ContextMenuPreview />);
    expect(screen.getByTestId('context-menu-popover')).toBeTruthy();
    expect(screen.getByText('View')).toBeTruthy();
    expect(screen.getByText('Sort by')).toBeTruthy();
    expect(screen.getByText('Open in Terminal')).toBeTruthy();
    expect(screen.getByText('Show more options')).toBeTruthy();
  });

  it('renders classic Windows 10 menu when enableClassicMenu is true', () => {
    useThemeStore.setState({
      contextMenuOverride: {
        enabled: true,
        enableClassicMenu: true,
        itemHoverAccent: true,
      },
    });

    render(<ContextMenuPreview />);
    expect(screen.getByTestId('classic-context-menu')).toBeTruthy();
    expect(screen.getByText('Personalize')).toBeTruthy();
    expect(screen.getByText('Display settings')).toBeTruthy();
  });
});
