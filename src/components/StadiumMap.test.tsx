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

  it('contains the correct accessibility roles and attributes', () => {
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
    
    const svgElement = screen.getByRole('img', { name: /stadium blueprint map/i });
    expect(svgElement).toBeDefined();
    expect(svgElement.getAttribute('role')).toBe('img');
    expect(svgElement.getAttribute('aria-label')).toContain('stadium blueprint map');
  });

  it('handles zoom button click interactions', () => {
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

    const zoomInButton = screen.getByLabelText('Zoom In');
    const zoomOutButton = screen.getByLabelText('Zoom Out');
    const resetZoomButton = screen.getByLabelText('Reset Map view');

    expect(zoomInButton).toBeDefined();
    expect(zoomOutButton).toBeDefined();
    expect(resetZoomButton).toBeDefined();

    fireEvent.click(zoomInButton);
    fireEvent.click(zoomOutButton);
    fireEvent.click(resetZoomButton);
  });
});
