import { render, cleanup, screen } from '@testing-library/react';
import { test, expect, afterEach } from 'vitest';
import PreviewCanvas from './PreviewCanvas';
import { useThemeStore } from '../store/useThemeStore';

afterEach(() => {
  cleanup();
  useThemeStore.getState().resetToDefaults();
});

test('disables backdrop blur and uses rgba gradient in gradient mode with secondary accent on left', () => {
  useThemeStore.setState({
    accentColor: '#ff007f', // [255, 0, 127]
    secondaryAccent: '#00f3ff', // [0, 243, 255]
    taskbarMode: 'gradient',
    taskbarOpacity: 80,
    activePane: 'start',
  });

  const { container } = render(<PreviewCanvas />);
  
  const taskbar = container.querySelector('.h-12.w-full') as HTMLElement;
  expect(taskbar).toBeTruthy();
  expect(taskbar.style.backdropFilter).toBe('none');
  expect(taskbar.style.background).toContain('linear-gradient(90deg, rgba(0, 243, 255, 0.8) 0%');

  // Verify weather widget is removed
  expect(container.textContent).not.toContain('22°C');
  expect(container.textContent).not.toContain('Mostly Sunny');

  // Start Menu flyout is positioned on the left with a gap above taskbar
  const startMenu = container.querySelector('.w-\\[580px\\]') as HTMLElement;
  expect(startMenu).toBeTruthy();
  expect(startMenu.className).toContain('absolute left-3 bottom-3');
  expect(startMenu.style.backdropFilter).toBe('none');
  expect(startMenu.style.background).toContain('linear-gradient');
  expect(startMenu.style.border).toContain('2px solid');
  expect(taskbar.style.borderTop).toContain('2px solid');
});

test('respects custom borderThickness across taskbar and flyouts', () => {
  useThemeStore.setState({
    accentColor: '#ff007f',
    borderThickness: 4,
    activePane: 'start',
  });

  const { container } = render(<PreviewCanvas />);
  const taskbar = container.querySelector('.h-12.w-full') as HTMLElement;
  const startMenu = container.querySelector('.w-\\[580px\\]') as HTMLElement;

  expect(taskbar.style.borderTop).toContain('4px solid');
  expect(startMenu.style.border).toContain('4px solid');
});

test('enables backdrop blur in blur mode', () => {
  useThemeStore.setState({
    taskbarMode: 'blur',
    taskbarBlur: 22,
    startMenuBlur: 18,
    activePane: 'start',
  });

  const { container } = render(<PreviewCanvas />);
  
  const taskbar = container.querySelector('.h-12.w-full') as HTMLElement;
  expect(taskbar).toBeTruthy();
  expect(taskbar.style.backdropFilter).toBe('blur(22px)');

  const startMenu = container.querySelector('.w-\\[580px\\]') as HTMLElement;
  expect(startMenu).toBeTruthy();
  expect(startMenu.style.backdropFilter).toBe('blur(18px)');
});

test('uses abstract wallpaper render by default when wallpaperUrl is null', () => {
  useThemeStore.setState({
    wallpaperUrl: null,
    isLightMode: false,
  });

  const { container } = render(<PreviewCanvas />);
  const canvasRoot = container.firstElementChild as HTMLElement;
  expect(canvasRoot.style.backgroundImage).toContain('/wallpapers/default-dark.jpg');

  useThemeStore.setState({
    wallpaperUrl: null,
    isLightMode: true,
  });

  const { container: lightContainer } = render(<PreviewCanvas />);
  const lightCanvasRoot = lightContainer.firstElementChild as HTMLElement;
  expect(lightCanvasRoot.style.backgroundImage).toContain('/wallpapers/default-light.jpg');
});

test('restricts secondaryAccent strictly to gradient tints and does not leak to calendar or buttons', () => {
  useThemeStore.setState({
    accentColor: '#123456',
    secondaryAccent: '#abcdef',
    activePane: 'quicksettings',
  });

  const { container } = render(<PreviewCanvas />);

  // Bluetooth button in Quick Settings uses primary accentColor
  const buttons = Array.from(container.querySelectorAll('button'));
  const bluetoothBtn = buttons.find((b) => b.textContent?.includes('Bluetooth'));
  expect(bluetoothBtn).toBeTruthy();
  expect(bluetoothBtn?.style.backgroundColor).toBe('rgb(18, 52, 86)'); // #123456

  cleanup();

  // Test Notification Center & Calendar
  useThemeStore.setState({
    accentColor: '#123456',
    secondaryAccent: '#abcdef',
    activePane: 'notifications',
  });

  const { container: notifContainer } = render(<PreviewCanvas />);
  const daySpans = Array.from(notifContainer.querySelectorAll('span'));
  const day7 = daySpans.find((s) => s.textContent === '7');
  const day15 = daySpans.find((s) => s.textContent === '15');

  expect(day7).toBeTruthy();
  expect(day7?.style.backgroundColor).toBe('rgb(18, 52, 86)');

  expect(day15).toBeTruthy();
  expect(day15?.style.backgroundColor).not.toBe('rgb(171, 205, 239)'); // not #abcdef
  expect(day15?.style.backgroundColor).toBe('');
});

test('renders separated Notification and Calendar cards when activePane is notifications', () => {
  useThemeStore.setState({
    activePane: 'notifications',
  });

  const { container } = render(<PreviewCanvas />);
  expect(container.textContent).toContain('Notifications');
  expect(container.textContent).toContain('Clear all');
  expect(container.textContent).toContain('September 2026');
  expect(container.textContent).toContain('Focus session');
});

test('renders desktop icons and mock window preview when enabled', () => {
  useThemeStore.setState({
    showDesktopIcons: true,
    showWindowPreview: true,
    activePane: null,
  });

  const { container } = render(<PreviewCanvas />);
  expect(container.textContent).toContain('Recycle Bin');
  expect(container.textContent).toContain('This PC');
  expect(container.textContent).toContain('Quick Access');
  expect(container.textContent).toContain('Search Home');
});

test('renders floating dock mode with island margin, pill radius, and border', () => {
  useThemeStore.setState({
    dockMode: true,
    dockMargin: 20,
    borderThickness: 2,
    accentColor: '#3b82f6',
  });

  const { container } = render(<PreviewCanvas />);
  const taskbar = container.querySelector('.h-12.w-full') as HTMLElement;

  expect(taskbar).toBeTruthy();
  expect(taskbar.style.margin).toBe('0px 20px 8px');
  expect(taskbar.style.width).toBe('calc(100% - 40px)');
  expect(taskbar.style.borderTop).toContain('2px solid rgb(59, 130, 246)');
});

test('renders different running indicator styles correctly', () => {
  // Test dot indicator
  useThemeStore.setState({
    runningIndicatorStyle: 'dot',
    accentColor: '#ff0055',
  });
  const { container: dotContainer } = render(<PreviewCanvas />);
  const dots = dotContainer.querySelectorAll('[data-testid="indicator-dot"]');
  expect(dots.length).toBe(3);

  cleanup();

  // Test glow indicator
  useThemeStore.setState({
    runningIndicatorStyle: 'glow',
    accentColor: '#00ffcc',
  });
  const { container: glowContainer } = render(<PreviewCanvas />);
  const glows = glowContainer.querySelectorAll('[data-testid="indicator-glow"]');
  expect(glows.length).toBe(3);

  cleanup();

  // Test hidden indicator
  useThemeStore.setState({
    runningIndicatorStyle: 'hidden',
  });
  const { container: hiddenContainer } = render(<PreviewCanvas />);
  expect(hiddenContainer.querySelector('[data-testid^="indicator-"]')).toBeNull();
});

test('renders pure-black-neon material with deep black surface and neon glow', () => {
  useThemeStore.setState({
    materialStyle: 'pure-black-neon',
    accentColor: '#00ff88',
    activePane: 'start',
    isLightMode: false,
  });

  const { container } = render(<PreviewCanvas />);
  const startMenu = container.querySelector('.w-\\[580px\\]') as HTMLElement;
  expect(startMenu).toBeTruthy();
  expect(startMenu.style.background).toBe('rgba(0, 0, 0, 0.98)');
  expect(startMenu.style.boxShadow).toContain('#00ff88');
});

test('allows user to interact with Quick Settings Volume and Brightness sliders', () => {
  useThemeStore.setState({
    activePane: 'quicksettings',
  });

  const { getByLabelText } = render(<PreviewCanvas />);
  const brightnessInput = getByLabelText(/Display Brightness/i) as HTMLInputElement;
  const volumeInput = getByLabelText(/System Volume/i) as HTMLInputElement;

  expect(brightnessInput.value).toBe('100');
  expect(volumeInput.value).toBe('75');

  // Change sliders
  brightnessInput.value = '50';
  brightnessInput.dispatchEvent(new Event('change', { bubbles: true }));

  volumeInput.value = '0';
  volumeInput.dispatchEvent(new Event('change', { bubbles: true }));
});

test('applies typography styles to the preview canvas root', () => {
  useThemeStore.getState().setTypography({ fontFamily: 'JetBrains Mono', fontWeight: '700', characterSpacing: 25 });
  render(<PreviewCanvas />);
  const canvas = screen.getByTestId('preview-canvas-root');
  expect(canvas.style.fontFamily).toContain('JetBrains Mono');
  expect(canvas.style.fontWeight).toBe('700');
  expect(canvas.style.letterSpacing).toBe('0.025em');
});

test('renders mica material styling on taskbar and start menu', () => {
  useThemeStore.getState().setMaterialStyle('mica');
  render(<PreviewCanvas />);
  const taskbar = screen.getByTestId('taskbar-container');
  expect(taskbar.style.backdropFilter).toContain('blur(40px)');
  expect(taskbar.style.backdropFilter).toContain('saturate(1.15)');

  const startMenu = screen.getByTestId('start-menu-container');
  expect(startMenu.style.backdropFilter).toContain('blur(40px)');
  expect(startMenu.style.backdropFilter).toContain('saturate(1.15)');
});

test('renders mica-alt material styling', () => {
  useThemeStore.getState().setMaterialStyle('mica-alt');
  render(<PreviewCanvas />);
  const taskbar = screen.getByTestId('taskbar-container');
  expect(taskbar.style.backdropFilter).toContain('blur(45px)');
});

test('applies taskbar component overrides when enabled', () => {
  useThemeStore.getState().setTaskbarOverride({
    enabled: true,
    materialStyle: 'pure-black-neon',
    customColor: '#FF0055',
    opacity: 80,
  });
  render(<PreviewCanvas />);
  const taskbar = screen.getByTestId('taskbar-container');
  expect(taskbar.style.backgroundColor).toContain('rgba(255, 0, 85, 0.8)');
});

test('applies start menu component overrides when enabled', () => {
  useThemeStore.getState().setStartMenuOverride({
    enabled: true,
    customColor: '#00FFCC',
    opacity: 50,
  });
  render(<PreviewCanvas />);
  const startMenu = screen.getByTestId('start-menu-container');
  expect(startMenu.style.backgroundColor).toContain('rgba(0, 255, 204, 0.5)');
});

test('applies flyout component overrides when enabled for quick settings and notifications', () => {
  useThemeStore.getState().setFlyoutOverride({
    enabled: true,
    materialStyle: 'mica',
    opacity: 90,
  });
  useThemeStore.setState({ activePane: 'quicksettings' });
  const { rerender } = render(<PreviewCanvas />);
  const quickSettings = screen.getByTestId('flyout-quicksettings');
  expect(quickSettings.style.backdropFilter).toContain('blur(40px)');

  useThemeStore.setState({ activePane: 'notifications' });
  rerender(<PreviewCanvas />);
  const notifications = screen.getByTestId('flyout-notifications');
  const notifCard = notifications.querySelector('.w-\\[360px\\]') as HTMLElement;
  expect(notifCard).toBeTruthy();
  expect(notifCard.style.backdropFilter).toContain('blur(40px)');
});

test('applies animation duration and easing to canvas CSS variables and flyouts', () => {
  useThemeStore.getState().setAnimations({
    speed: 'smooth',
    durationMs: 400,
    easing: 'decelerate',
  });
  render(<PreviewCanvas />);
  const canvas = screen.getByTestId('preview-canvas-root');
  expect(canvas.style.getPropertyValue('--flyout-duration')).toBe('400ms');
  expect(canvas.style.getPropertyValue('--flyout-easing')).toBe('cubic-bezier(0.0, 0.0, 0.2, 1)');

  const startMenu = screen.getByTestId('start-menu-container');
  expect(startMenu.style.transitionDuration).toBe('var(--flyout-duration)');
  expect(startMenu.style.transitionTimingFunction).toBe('var(--flyout-easing)');
});

test('sets flyout duration to 0ms when animation speed is instant', () => {
  useThemeStore.getState().setAnimations({
    speed: 'instant',
    durationMs: 250,
    easing: 'linear',
  });
  render(<PreviewCanvas />);
  const canvas = screen.getByTestId('preview-canvas-root');
  expect(canvas.style.getPropertyValue('--flyout-duration')).toBe('0ms');
  expect(canvas.style.getPropertyValue('--flyout-easing')).toBe('linear');
});

test('renders globalGradient when materialStyle is linear-gradient and globalGradient is configured', () => {
  useThemeStore.setState({
    taskbarMode: 'blur',
    materialStyle: 'linear-gradient',
    globalGradient: {
      type: 'linear',
      angle: 45,
      stops: [
        { id: '1', color: '#112233', offset: 0 },
        { id: '2', color: '#445566', offset: 100 },
      ],
    },
  });

  render(<PreviewCanvas />);
  const taskbar = screen.getByTestId('taskbar-container');
  expect(taskbar.style.background).toContain('linear-gradient(45deg');
  expect(taskbar.style.background).toContain('rgba(17, 34, 51');
  expect(taskbar.style.background).toContain('rgba(68, 85, 102');

  const startMenu = screen.getByTestId('start-menu-container');
  expect(startMenu.style.background).toContain('linear-gradient(45deg');
  expect(startMenu.style.background).toContain('rgba(17, 34, 51');
  expect(startMenu.style.background).toContain('rgba(68, 85, 102');
});

