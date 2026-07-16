import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StaffDashboard } from './StaffDashboard';

describe('StaffDashboard Component', () => {
  const mockOnAdd = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnSelect = vi.fn();

  it('renders staff portal headers', () => {
    render(
      <StaffDashboard 
        incidents={[]}
        onAddIncident={mockOnAdd}
        onUpdateIncidentStatus={mockOnUpdate}
        selectedIncident={null}
        onSelectIncident={mockOnSelect}
      />
    );
    
    expect(screen.getByText('DISPATCH NEW REPORT PIN')).toBeDefined();
    expect(screen.getByText('STAFF TRANSLATOR RADAR')).toBeDefined();
  });

  it('shows no dispatch alert message when queue is empty', () => {
    render(
      <StaffDashboard 
        incidents={[]}
        onAddIncident={mockOnAdd}
        onUpdateIncidentStatus={mockOnUpdate}
        selectedIncident={null}
        onSelectIncident={mockOnSelect}
      />
    );
    
    expect(screen.getByText('NO INCIDENT FOCUS')).toBeDefined();
  });
});
