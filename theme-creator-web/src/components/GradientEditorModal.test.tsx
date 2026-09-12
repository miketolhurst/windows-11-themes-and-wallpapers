import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { GradientEditorModal } from './GradientEditorModal';
import { GradientConfig } from '../store/useThemeStore';

describe('GradientEditorModal', () => {
  afterEach(() => {
    cleanup();
  });

  const mockGradient: GradientConfig = {
    type: 'linear',
    angle: 90,
    stops: [
      { id: '1', color: '#0078D4', offset: 0 },
      { id: '2', color: '#8B5CF6', offset: 100 },
    ],
  };

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <GradientEditorModal
        isOpen={false}
        title="Edit Taskbar Gradient"
        initialGradient={mockGradient}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders title, visual track, angle, and presets when open', () => {
    render(
      <GradientEditorModal
        isOpen={true}
        title="Edit Taskbar Gradient"
        initialGradient={mockGradient}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('Edit Taskbar Gradient')).toBeInTheDocument();
    expect(screen.getByText('Linear')).toBeInTheDocument();
    expect(screen.getByText('Radial')).toBeInTheDocument();
    expect(screen.getByText('Presets')).toBeInTheDocument();
  });

  it('calls onSave with updated gradient when Apply to Theme is clicked', () => {
    const onSave = vi.fn();
    render(
      <GradientEditorModal
        isOpen={true}
        title="Edit Taskbar Gradient"
        initialGradient={mockGradient}
        onSave={onSave}
        onClose={vi.fn()}
      />
    );
    // Switch to radial
    fireEvent.click(screen.getByText('Radial'));
    fireEvent.click(screen.getByText('Apply to Theme'));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'radial',
      })
    );
  });

  it('adds a new stop when clicking Add Stop', () => {
    render(
      <GradientEditorModal
        isOpen={true}
        title="Edit Taskbar Gradient"
        initialGradient={mockGradient}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );
    const initialPins = screen.getAllByRole('slider', { name: /stop/i });
    expect(initialPins.length).toBe(2);

    fireEvent.click(screen.getByText('Add Stop'));
    const updatedPins = screen.getAllByRole('slider', { name: /stop/i });
    expect(updatedPins.length).toBe(3);
  });

  it('applies a preset gradient when clicked', () => {
    const onSave = vi.fn();
    render(
      <GradientEditorModal
        isOpen={true}
        title="Edit Taskbar Gradient"
        initialGradient={mockGradient}
        onSave={onSave}
        onClose={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText('Cyber Horizon'));
    fireEvent.click(screen.getByText('Apply to Theme'));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        stops: expect.arrayContaining([
          expect.objectContaining({ color: expect.stringMatching(/#00[eE]5[fF]{2}|#00E5FF/i) }),
        ]),
      })
    );
  });

  it('allows deleting an active stop down to minimum 2 stops', () => {
    render(
      <GradientEditorModal
        isOpen={true}
        title="Edit Taskbar Gradient"
        initialGradient={{
          type: 'linear',
          angle: 90,
          stops: [
            { id: '1', color: '#0078D4', offset: 0 },
            { id: '2', color: '#00FF00', offset: 50 },
            { id: '3', color: '#8B5CF6', offset: 100 },
          ],
        }}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getAllByRole('slider', { name: /stop/i }).length).toBe(3);
    const deleteBtn = screen.getByRole('button', { name: /delete stop/i });
    expect(deleteBtn).not.toBeDisabled();
    fireEvent.click(deleteBtn);

    expect(screen.getAllByRole('slider', { name: /stop/i }).length).toBe(2);
    // When 2 stops remain, Delete Stop should be disabled
    expect(screen.getByRole('button', { name: /delete stop/i })).toBeDisabled();
  });

  it('updates stop color and offset via inputs', () => {
    const onSave = vi.fn();
    render(
      <GradientEditorModal
        isOpen={true}
        title="Edit Taskbar Gradient"
        initialGradient={mockGradient}
        onSave={onSave}
        onClose={vi.fn()}
      />
    );

    const colorInput = screen.getByLabelText(/stop color hex/i);
    fireEvent.change(colorInput, { target: { value: '#FF0055' } });

    const offsetInput = screen.getByLabelText(/stop position percent/i);
    fireEvent.change(offsetInput, { target: { value: '25' } });

    fireEvent.click(screen.getByText('Apply to Theme'));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        stops: expect.arrayContaining([
          expect.objectContaining({ color: '#FF0055', offset: 25 }),
        ]),
      })
    );
  });

  it('updates angle when clicking quick-snap chips', () => {
    const onSave = vi.fn();
    render(
      <GradientEditorModal
        isOpen={true}
        title="Edit Taskbar Gradient"
        initialGradient={mockGradient}
        onSave={onSave}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '180°' }));
    fireEvent.click(screen.getByText('Apply to Theme'));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        angle: 180,
      })
    );
  });

  it('hides or disables angle controls when radial is selected', () => {
    render(
      <GradientEditorModal
        isOpen={true}
        title="Edit Taskbar Gradient"
        initialGradient={mockGradient}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Radial'));
    expect(screen.queryByRole('button', { name: '180°' })).not.toBeInTheDocument();
  });

  it('closes modal when Cancel button is clicked', () => {
    const onClose = vi.fn();
    render(
      <GradientEditorModal
        isOpen={true}
        title="Edit Taskbar Gradient"
        initialGradient={mockGradient}
        onSave={vi.fn()}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes modal on Escape key press', () => {
    const onClose = vi.fn();
    render(
      <GradientEditorModal
        isOpen={true}
        title="Edit Taskbar Gradient"
        initialGradient={mockGradient}
        onSave={vi.fn()}
        onClose={onClose}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes modal on backdrop click', () => {
    const onClose = vi.fn();
    render(
      <GradientEditorModal
        isOpen={true}
        title="Edit Taskbar Gradient"
        initialGradient={mockGradient}
        onSave={vi.fn()}
        onClose={onClose}
      />
    );

    const backdrop = screen.getByTestId('gradient-modal-backdrop');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close modal when clicking inside dialog body', () => {
    const onClose = vi.fn();
    render(
      <GradientEditorModal
        isOpen={true}
        title="Edit Taskbar Gradient"
        initialGradient={mockGradient}
        onSave={vi.fn()}
        onClose={onClose}
      />
    );

    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('adjusts stop offset with keyboard arrow keys', () => {
    const onSave = vi.fn();
    render(
      <GradientEditorModal
        isOpen={true}
        title="Edit Taskbar Gradient"
        initialGradient={mockGradient}
        onSave={onSave}
        onClose={vi.fn()}
      />
    );

    const pins = screen.getAllByRole('slider', { name: /stop/i });
    // First pin at offset 0
    fireEvent.keyDown(pins[0], { key: 'ArrowRight' });
    fireEvent.click(screen.getByText('Apply to Theme'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        stops: expect.arrayContaining([
          expect.objectContaining({ id: '1', offset: 1 }),
        ]),
      })
    );
  });

  it('selects a stop when clicking its pin', () => {
    render(
      <GradientEditorModal
        isOpen={true}
        title="Edit Taskbar Gradient"
        initialGradient={mockGradient}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const pins = screen.getAllByRole('slider', { name: /stop/i });
    fireEvent.click(pins[1]);

    const hexInput = screen.getByLabelText(/stop color hex/i);
    expect(hexInput).toHaveValue('#8B5CF6');
  });

  it('applies all available presets properly', () => {
    const onSave = vi.fn();
    render(
      <GradientEditorModal
        isOpen={true}
        title="Edit Taskbar Gradient"
        initialGradient={mockGradient}
        onSave={onSave}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Sunset Glow'));
    expect(screen.getByText('Sunset Glow')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Deep Nebula'));
    expect(screen.getByText('Deep Nebula')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Aurora Borealis'));
    expect(screen.getByText('Aurora Borealis')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Subtle Fluent Sheen'));
    expect(screen.getByText('Subtle Fluent Sheen')).toBeInTheDocument();
  });
});

