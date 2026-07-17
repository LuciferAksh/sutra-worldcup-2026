import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('triggers onAddIncident when submitting new incident', () => {
    render(
      <StaffDashboard 
        incidents={[]}
        onAddIncident={mockOnAdd}
        onUpdateIncidentStatus={mockOnUpdate}
        selectedIncident={null}
        onSelectIncident={mockOnSelect}
      />
    );
    
    const inputEl = screen.getByPlaceholderText('e.g. Water puddle on Section 112 steps');
    fireEvent.change(inputEl, { target: { value: 'Water puddle near section 104' } });
    
    const submitBtn = screen.getByText('Broadcast Supervisor Alert');
    fireEvent.click(submitBtn);
    
    expect(mockOnAdd).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Water puddle near section 104',
      category: 'cleaning'
    }));
  });

  it('displays incident details and triggers status updates when incident is focused', () => {
    const mockIncident = { id: 'inc-99', title: 'Medical spill', category: 'medical' as const, x: 100, y: 100, status: 'pending' as const };
    render(
      <StaffDashboard 
        incidents={[mockIncident]}
        onAddIncident={mockOnAdd}
        onUpdateIncidentStatus={mockOnUpdate}
        selectedIncident={mockIncident}
        onSelectIncident={mockOnSelect}
      />
    );
    
    expect(screen.getByText('SUTRA AI triage matrix', { exact: false })).toBeDefined();
    
    const dispatchBtn = screen.getByText('DISPATCH FIELD VOLUNTEER');
    fireEvent.click(dispatchBtn);
    expect(mockOnUpdate).toHaveBeenCalledWith('inc-99', 'dispatched');
  });
});
