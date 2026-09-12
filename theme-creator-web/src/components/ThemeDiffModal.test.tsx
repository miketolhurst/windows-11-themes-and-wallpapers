import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { ThemeDiffModal } from './ThemeDiffModal';
import { useThemeStore, DEFAULT_THEME_STATE } from '../store/useThemeStore';

describe('ThemeDiffModal', () => {
  beforeEach(() => {
    useThemeStore.setState(DEFAULT_THEME_STATE);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ThemeDiffModal isOpen={false} incomingConfig={null} onClose={vi.fn()} onApply={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders diff table and highlights changed rows', () => {
    useThemeStore.setState({ accentColor: '#0078D4' });
    render(
      <ThemeDiffModal
        isOpen={true}
        incomingConfig={{ accentColor: '#FF0055', cornerRadius: 16 }}
        onClose={vi.fn()}
        onApply={vi.fn()}
      />
    );
    expect(screen.getByText('Theme Inspector & Diff')).toBeInTheDocument();
    expect(screen.getByText('#0078D4')).toBeInTheDocument();
    expect(screen.getByText('#FF0055')).toBeInTheDocument();
  });

  it('calls onApply with incoming configuration when Apply Changes is clicked', () => {
    const onApply = vi.fn();
    const incoming = { accentColor: '#FF0055' };
    render(
      <ThemeDiffModal
        isOpen={true}
        incomingConfig={incoming}
        onClose={vi.fn()}
        onApply={onApply}
      />
    );
    fireEvent.click(screen.getByText('Apply Changes'));
    expect(onApply).toHaveBeenCalledWith(incoming);
  });

  it('calls onClose when Cancel button or close icon is clicked', () => {
    const onClose = vi.fn();
    render(
      <ThemeDiffModal
        isOpen={true}
        incomingConfig={{ accentColor: '#FF0055' }}
        onClose={onClose}
        onApply={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);

    const closeButton = screen.getByTitle('Close modal');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('closes when backdrop is clicked or Escape key is pressed', () => {
    const onClose = vi.fn();
    render(
      <ThemeDiffModal
        isOpen={true}
        incomingConfig={{ accentColor: '#FF0055' }}
        onClose={onClose}
        onApply={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('diff-modal-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('displays changes detected badge and "No changes detected" correctly', () => {
    const { rerender } = render(
      <ThemeDiffModal
        isOpen={true}
        incomingConfig={{ accentColor: '#FF0055', cornerRadius: 16 }}
        onClose={vi.fn()}
        onApply={vi.fn()}
      />
    );
    expect(screen.getByText('2 changes detected')).toBeInTheDocument();

    rerender(
      <ThemeDiffModal
        isOpen={true}
        incomingConfig={null}
        onClose={vi.fn()}
        onApply={vi.fn()}
      />
    );
    expect(screen.getByText('No changes detected')).toBeInTheDocument();
  });

  it('filters rows based on search input', () => {
    render(
      <ThemeDiffModal
        isOpen={true}
        incomingConfig={{ accentColor: '#FF0055', cornerRadius: 16 }}
        onClose={vi.fn()}
        onApply={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText(/filter settings/i);
    expect(screen.getByText('Accent Color')).toBeInTheDocument();
    expect(screen.getByText('Corner Radius')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Corner' } });
    expect(screen.getByText('Corner Radius')).toBeInTheDocument();
    expect(screen.queryByText('Accent Color')).not.toBeInTheDocument();
  });

  it('toggles filter to only show changed settings', () => {
    render(
      <ThemeDiffModal
        isOpen={true}
        incomingConfig={{ accentColor: '#FF0055' }}
        onClose={vi.fn()}
        onApply={vi.fn()}
      />
    );

    // Light / Dark Mode hasn't changed
    expect(screen.getByText('Light / Dark Mode')).toBeInTheDocument();

    const changedOnlyToggle = screen.getByRole('checkbox', { name: /only changed/i });
    fireEvent.click(changedOnlyToggle);

    expect(screen.getByText('Accent Color')).toBeInTheDocument();
    expect(screen.queryByText('Light / Dark Mode')).not.toBeInTheDocument();
  });

  it('resets search filter and changed-only toggle when reopened', () => {
    const { rerender } = render(
      <ThemeDiffModal
        isOpen={true}
        incomingConfig={{ accentColor: '#FF0055' }}
        onClose={vi.fn()}
        onApply={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText(/filter settings/i) as HTMLInputElement;
    const changedOnlyToggle = screen.getByRole('checkbox', { name: /only changed/i }) as HTMLInputElement;

    fireEvent.change(searchInput, { target: { value: 'Accent' } });
    fireEvent.click(changedOnlyToggle);
    expect(searchInput.value).toBe('Accent');
    expect(changedOnlyToggle.checked).toBe(true);

    // Close modal
    rerender(
      <ThemeDiffModal
        isOpen={false}
        incomingConfig={{ accentColor: '#FF0055' }}
        onClose={vi.fn()}
        onApply={vi.fn()}
      />
    );

    // Reopen modal
    rerender(
      <ThemeDiffModal
        isOpen={true}
        incomingConfig={{ accentColor: '#FF0055' }}
        onClose={vi.fn()}
        onApply={vi.fn()}
      />
    );

    const reopenedSearchInput = screen.getByPlaceholderText(/filter settings/i) as HTMLInputElement;
    const reopenedChangedOnlyToggle = screen.getByRole('checkbox', { name: /only changed/i }) as HTMLInputElement;
    expect(reopenedSearchInput.value).toBe('');
    expect(reopenedChangedOnlyToggle.checked).toBe(false);
  });
});
