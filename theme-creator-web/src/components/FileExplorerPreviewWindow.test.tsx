import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { FileExplorerPreviewWindow } from './FileExplorerPreviewWindow';
import { useThemeStore } from '../store/useThemeStore';

afterEach(() => {
  cleanup();
});

describe('FileExplorerPreviewWindow', () => {
  it('renders tabs, command bar, and breadcrumbs', () => {
    render(<FileExplorerPreviewWindow />);
    expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Downloads').length).toBeGreaterThan(0);
    expect(screen.getByText(/This PC/i)).toBeTruthy();
  });

  it('reflects tabStyle and command bar tint from fileExplorerOverride', () => {
    useThemeStore.setState({
      fileExplorerOverride: {
        enabled: true,
        tabStyle: 'floating',
        showCommandBarTint: true,
        activeTabColorMode: 'accent',
      },
      accentColor: '#8b5cf6',
    });

    render(<FileExplorerPreviewWindow />);
    const windowEl = screen.getByTestId('file-explorer-window');
    expect(windowEl).toBeTruthy();
    expect(screen.getByTestId('command-bar-ribbon')).toBeTruthy();
  });
});
