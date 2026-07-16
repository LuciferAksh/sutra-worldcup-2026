import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
