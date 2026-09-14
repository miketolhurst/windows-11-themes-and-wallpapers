import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { test, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import Sidebar from '../Sidebar';
import { useThemeStore } from '../../store/useThemeStore';

afterEach(() => {
  cleanup();
  useThemeStore.setState({
    isSidebarCollapsed: false,
    dockMode: false,
    materialStyle: 'fluent-acrylic',
  });
});

test('renders all tabs and switches views correctly', () => {
  render(<Sidebar />);

  // Initial tab is 'all'
  expect(screen.getByRole('tab', { name: /^All$/i })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByText(/Primary Accent/i)).toBeTruthy();
  expect(screen.getByText(/Material Style/i)).toBeTruthy();
  expect(screen.getByRole('button', { name: /Component Isolation/i })).toBeTruthy();
  expect(screen.getByText(/My Saved Themes/i)).toBeTruthy();

  // Click Colors tab
  const colorsTab = screen.getByRole('tab', { name: /🎨 Colors/i });
  fireEvent.click(colorsTab);
  expect(colorsTab).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByText(/Primary Accent/i)).toBeTruthy();
  expect(screen.queryByText(/Material Style/i)).toBeNull();
  expect(screen.queryByRole('button', { name: /Component Isolation/i })).toBeNull();
  expect(screen.queryByText(/My Saved Themes/i)).toBeNull();

  // Click Shell tab
  const shellTab = screen.getByRole('tab', { name: /💻 Shell/i });
  fireEvent.click(shellTab);
  expect(shellTab).toHaveAttribute('aria-selected', 'true');
  expect(screen.queryByText(/Primary Accent/i)).toBeNull();
  expect(screen.getByText(/Material Style/i)).toBeTruthy();
  expect(screen.queryByRole('button', { name: /Component Isolation/i })).toBeNull();
  expect(screen.queryByText(/My Saved Themes/i)).toBeNull();

  // Click Components tab
  const compTab = screen.getByRole('tab', { name: /🧩 Components/i });
  fireEvent.click(compTab);
  expect(compTab).toHaveAttribute('aria-selected', 'true');
  expect(screen.queryByText(/Primary Accent/i)).toBeNull();
  expect(screen.queryByText(/Material Style/i)).toBeNull();
  expect(screen.getByRole('button', { name: /Component Isolation/i })).toBeTruthy();
  expect(screen.queryByText(/My Saved Themes/i)).toBeNull();

  // Click Library tab
  const libTab = screen.getByRole('tab', { name: /📦 Library/i });
  fireEvent.click(libTab);
  expect(libTab).toHaveAttribute('aria-selected', 'true');
  expect(screen.queryByText(/Primary Accent/i)).toBeNull();
  expect(screen.queryByText(/Material Style/i)).toBeNull();
  expect(screen.queryByRole('button', { name: /Component Isolation/i })).toBeNull();
  expect(screen.getByText(/My Saved Themes/i)).toBeTruthy();

  // Click back to All
  const allTab = screen.getByRole('tab', { name: /^All$/i });
  fireEvent.click(allTab);
  expect(allTab).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByText(/Primary Accent/i)).toBeTruthy();
  expect(screen.getByText(/Material Style/i)).toBeTruthy();
  expect(screen.getByRole('button', { name: /Component Isolation/i })).toBeTruthy();
  expect(screen.getByText(/My Saved Themes/i)).toBeTruthy();
});
