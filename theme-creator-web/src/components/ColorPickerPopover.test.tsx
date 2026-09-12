import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { ColorPickerPopover } from './ColorPickerPopover';

describe('ColorPickerPopover', () => {
  const onChangeMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders trigger swatch and HEX code input field', () => {
    render(<ColorPickerPopover value="#FF007F" onChange={onChangeMock} label="Primary Accent" />);
    const trigger = screen.getByRole('button', { name: /Open color picker/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveStyle({ backgroundColor: 'rgb(255, 0, 127)' });

    const hexInput = screen.getByRole('textbox', { name: /Primary Accent/i });
    expect(hexInput).toHaveValue('#FF007F');
  });

  it('opens and closes popout dialog when trigger or close buttons are clicked', () => {
    render(<ColorPickerPopover value="#0078D4" onChange={onChangeMock} label="Accent" />);
    const trigger = screen.getByRole('button', { name: /Open color picker/i });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: /Accent Color Popout/i })).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /Close color picker/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('updates color when editing the trigger HEX code input', () => {
    render(<ColorPickerPopover value="#0078D4" onChange={onChangeMock} label="Accent" />);
    const hexInput = screen.getByRole('textbox', { name: /^Accent$/i });

    fireEvent.change(hexInput, { target: { value: '#10B981' } });
    expect(onChangeMock).toHaveBeenCalledWith('#10B981');
  });

  it('updates color when typing in the popout HEX input field', () => {
    render(<ColorPickerPopover value="#0078D4" onChange={onChangeMock} label="Accent" />);
    const trigger = screen.getByRole('button', { name: /Open color picker/i });
    fireEvent.click(trigger);

    const popoutHexInput = screen.getByRole('textbox', { name: /HEX code input/i });
    fireEvent.change(popoutHexInput, { target: { value: 'FF5500' } });
    expect(onChangeMock).toHaveBeenCalledWith('#FF5500');
  });

  it('updates hue via range slider', () => {
    render(<ColorPickerPopover value="#FF0000" onChange={onChangeMock} label="Accent" />);
    fireEvent.click(screen.getByRole('button', { name: /Open color picker/i }));

    const hueSlider = screen.getByRole('slider', { name: /Hue Slider/i });
    fireEvent.change(hueSlider, { target: { value: '180' } });
    expect(onChangeMock).toHaveBeenCalled();
  });

  it('selects preset swatch when clicked in popout', () => {
    render(
      <ColorPickerPopover
        value="#0078D4"
        onChange={onChangeMock}
        quickSwatches={['#00F3FF', '#FF007F']}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Open color picker/i }));

    const cyanSwatch = screen.getByTitle('#00F3FF');
    fireEvent.click(cyanSwatch);
    expect(onChangeMock).toHaveBeenCalledWith('#00F3FF');
  });

  it('closes dialog on Escape key', () => {
    render(<ColorPickerPopover value="#0078D4" onChange={onChangeMock} />);
    fireEvent.click(screen.getByRole('button', { name: /Open color picker/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('handles eyedropper API if available in window', async () => {
    const openMock = vi.fn().mockResolvedValue({ sRGBHex: '#123456' });
    class MockEyeDropper {
      open = openMock;
    }
    (window as unknown as { EyeDropper: unknown }).EyeDropper = MockEyeDropper;

    render(<ColorPickerPopover value="#0078D4" onChange={onChangeMock} />);
    fireEvent.click(screen.getByRole('button', { name: /Open color picker/i }));

    const dropperBtn = screen.getByRole('button', { name: /Pick color from screen/i });
    expect(dropperBtn).not.toBeDisabled();
    fireEvent.click(dropperBtn);

    await vi.waitFor(() => {
      expect(openMock).toHaveBeenCalled();
      expect(onChangeMock).toHaveBeenCalledWith('#123456');
    });

    delete (window as unknown as { EyeDropper?: unknown }).EyeDropper;
  });
});
