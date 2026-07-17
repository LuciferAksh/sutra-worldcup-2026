import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FanCompanion } from './FanCompanion';

// Mock scrollIntoView in jsdom environment
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('FanCompanion Component', () => {
  const mockOnRouteSelect = vi.fn();
  const mockSetAccessibilityOnly = vi.fn();

  it('renders chat concierge title', () => {
    render(
      <FanCompanion 
        onRouteSelect={mockOnRouteSelect}
        selectedFeature={null}
        accessibilityOnly={false}
        setAccessibilityOnly={mockSetAccessibilityOnly}
      />
    );
    
    expect(screen.getByText('SUTRA CORE CONCIERGE')).toBeDefined();
  });

  it('renders transit loop schedules', () => {
    render(
      <FanCompanion 
        onRouteSelect={mockOnRouteSelect}
        selectedFeature={null}
        accessibilityOnly={false}
        setAccessibilityOnly={mockSetAccessibilityOnly}
      />
    );
    
    expect(screen.getByText('LIVE TRANSIT RADAR')).toBeDefined();
    expect(screen.getByText('EVERY 4 MINS')).toBeDefined();
  });

  it('triggers accessibility toggle when clicked', () => {
    render(
      <FanCompanion 
        onRouteSelect={mockOnRouteSelect}
        selectedFeature={null}
        accessibilityOnly={false}
        setAccessibilityOnly={mockSetAccessibilityOnly}
      />
    );
    
    const accBtn = screen.getByText(/ACCESSIBLE/i);
    fireEvent.click(accBtn);
    expect(mockSetAccessibilityOnly).toHaveBeenCalledWith(true);
  });

  it('calculates carbon offset and updates eco log when commute distance logged', () => {
    render(
      <FanCompanion 
        onRouteSelect={mockOnRouteSelect}
        selectedFeature={null}
        accessibilityOnly={false}
        setAccessibilityOnly={mockSetAccessibilityOnly}
      />
    );
    
    const distInput = screen.getByPlaceholderText('km');
    fireEvent.change(distInput, { target: { value: '25' } });
    
    const logBtn = screen.getByText('LOG');
    fireEvent.click(logBtn);
    
    expect(screen.getByText(/Offset 2.5kg CO2 via TRAIN/i)).toBeDefined();
  });
});
