import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StadiumMap } from './StadiumMap';

describe('StadiumMap Component', () => {
  const mockOnSelect = vi.fn();

  it('renders the stadium blueprint map header', () => {
    render(
      <StadiumMap 
        mode="wayfinding"
        selectedFeatureId={null}
        onSelectFeature={mockOnSelect}
        incidents={[]}
        accessibilityOnly={false}
        waypointStart="gate-a"
        waypointEnd="sec-102"
      />
    );
    
    expect(screen.getByText('STADIUM VIRTUAL CORE')).toBeDefined();
    expect(screen.getByText('📍 NEON WAYFINDING NAVIGATOR')).toBeDefined();
  });

  it('renders map legend entries correctly', () => {
    render(
      <StadiumMap 
        mode="wayfinding"
        selectedFeatureId={null}
        onSelectFeature={mockOnSelect}
        incidents={[]}
        accessibilityOnly={false}
        waypointStart="gate-a"
        waypointEnd="sec-102"
      />
    );
    
    expect(screen.getByText('GATEWAYS')).toBeDefined();
    expect(screen.getByText('ECO EATS')).toBeDefined();
    expect(screen.getByText('FIRST AID')).toBeDefined();
  });
});
