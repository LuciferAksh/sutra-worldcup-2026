import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsModal } from './SettingsModal';

describe('SettingsModal Component', () => {
  it('renders correctly when show is true', () => {
    const handleClose = vi.fn();
    const handleSave = vi.fn();
    const setProvider = vi.fn();
    
    render(
      <SettingsModal 
        show={true}
        onClose={handleClose}
        provider="local"
        setProvider={setProvider}
        onSave={handleSave}
      />
    );
    
    expect(screen.getByText('SUTRA AI Engine Config')).toBeDefined();
    expect(screen.getByText('Save Configuration')).toBeDefined();
  });

  it('triggers save action on button click', () => {
    const handleClose = vi.fn();
    const handleSave = vi.fn();
    const setProvider = vi.fn();
    
    render(
      <SettingsModal 
        show={true}
        onClose={handleClose}
        provider="local"
        setProvider={setProvider}
        onSave={handleSave}
      />
    );
    
    fireEvent.click(screen.getByText('Save Configuration'));
    expect(handleSave).toHaveBeenCalled();
  });
});
