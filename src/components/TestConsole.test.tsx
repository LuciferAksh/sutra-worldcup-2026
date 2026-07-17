import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TestConsole } from './TestConsole';

describe('TestConsole Component', () => {
  const defaultLogs = [
    { id: '1', text: '[System] Harness initialized.' },
    { id: '2', text: '[PASS] RAG index verification.' }
  ];

  it('renders title and test logs correctly', () => {
    const handleClose = vi.fn();
    const runTests = vi.fn();
    const handleIncident = vi.fn();
    const clearLogs = vi.fn();

    render(
      <TestConsole 
        show={true}
        onClose={handleClose}
        runSimulatedTests={runTests}
        isRunningTests={false}
        handleTriggerRandomIncident={handleIncident}
        testLogs={defaultLogs}
        clearLogs={clearLogs}
      />
    );

    expect(screen.getByText('🧪 SUTRA HARNESS & TELEMETRY')).toBeDefined();
    expect(screen.getByText('[System] Harness initialized.')).toBeDefined();
    expect(screen.getByText('[PASS] RAG index verification.')).toBeDefined();
  });

  it('triggers run automated tests and clear action triggers callbacks', () => {
    const handleClose = vi.fn();
    const runTests = vi.fn();
    const handleIncident = vi.fn();
    const clearLogs = vi.fn();

    render(
      <TestConsole 
        show={true}
        onClose={handleClose}
        runSimulatedTests={runTests}
        isRunningTests={false}
        handleTriggerRandomIncident={handleIncident}
        testLogs={defaultLogs}
        clearLogs={clearLogs}
      />
    );

    fireEvent.click(screen.getByText('Run Integration Suite'));
    expect(runTests).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Clear'));
    expect(clearLogs).toHaveBeenCalled();
  });
});
