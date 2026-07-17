import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('triggers onSelectFeature when a gateway feature label is clicked', () => {
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
    
    const gateText = screen.getByText('GATE A');
    expect(gateText).toBeDefined();
    
    fireEvent.click(gateText);
    expect(mockOnSelect).toHaveBeenCalled();
  });
});
