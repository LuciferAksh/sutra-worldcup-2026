import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ControlTower } from './ControlTower';

// Mock Recharts ResponsiveContainer to prevent width/height render issues in JSDOM
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children?: import('react').ReactNode }) => <div data-testid="recharts-container">{children}</div>
  };
});

describe('ControlTower Component', () => {
  const mockOnTrigger = vi.fn();
  const mockSetMultiplier = vi.fn();
  const mockOnSelect = vi.fn();

  it('renders control tower cards and alerts', () => {
    render(
      <ControlTower 
        incidents={[]}
        onTriggerRandomIncident={mockOnTrigger}
        crowdMultiplier={1.0}
        setCrowdMultiplier={mockSetMultiplier}
        onSelectIncident={mockOnSelect}
      />
    );
    
    expect(screen.getByText('LIVE ATTENDANCE')).toBeDefined();
    expect(screen.getByText('TREES PLANTED')).toBeDefined();
    expect(screen.getByText('PREDICTIVE AI RADAR ALERTS')).toBeDefined();
  });

  it('triggers onTriggerRandomIncident when sim trigger button clicked', () => {
    render(
      <ControlTower 
        incidents={[]}
        onTriggerRandomIncident={mockOnTrigger}
        crowdMultiplier={1.0}
        setCrowdMultiplier={mockSetMultiplier}
        onSelectIncident={mockOnSelect}
      />
    );
    
    const triggerBtn = screen.getByText('SIM TRIGGER');
    fireEvent.click(triggerBtn);
    expect(mockOnTrigger).toHaveBeenCalled();
  });

  it('triggers setCrowdMultiplier when crowd occupancy slider is changed', () => {
    render(
      <ControlTower 
        incidents={[]}
        onTriggerRandomIncident={mockOnTrigger}
        crowdMultiplier={1.0}
        setCrowdMultiplier={mockSetMultiplier}
        onSelectIncident={mockOnSelect}
      />
    );
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '1.5' } });
    expect(mockSetMultiplier).toHaveBeenCalledWith(1.5);
  });
});
