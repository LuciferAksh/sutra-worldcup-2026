import React from 'react';
import { motion } from 'framer-motion';

export interface TestLogEntry {
  id: string;
  text: string;
}

interface TestConsoleProps {
  show: boolean;
  onClose: () => void;
  runSimulatedTests: () => void;
  isRunningTests: boolean;
  handleTriggerRandomIncident: () => void;
  testLogs: TestLogEntry[];
  clearLogs: () => void;
}

const BACKDROP_STYLE = { zIndex: 1000 } as const;
const CONTAINER_STYLE = { width: '100%', maxWidth: '600px', padding: '24px', gap: '16px', border: '1px solid var(--border-glow)', boxShadow: '0 0 35px rgba(0, 240, 255, 0.2)', maxHeight: '90vh', overflowY: 'auto' } as const;
const HEADER_STYLE = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' } as const;
const HEADER_TITLE_STYLE = { fontSize: '1.2rem', fontWeight: 900, fontFamily: 'Outfit', color: 'var(--neon-cyan)', letterSpacing: '0.5px' } as const;
const HEADER_SUBTITLE_STYLE = { fontSize: '0.72rem', color: 'var(--text-secondary)' } as const;
const GRID_STYLE = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } as const;
const ACTION_COLUMN_STYLE = { display: 'flex', flexDirection: 'column', gap: '12px' } as const;
const STAT_BOX_STYLE = { background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-muted)', padding: '12px', borderRadius: '10px', fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.4' } as const;
const TERMINAL_HEADER_STYLE = { fontSize: '0.75rem', fontWeight: 800, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } as const;
const TERMINAL_BOX_STYLE = { flex: 1, minHeight: '200px', background: '#04070c', border: '1px solid rgba(0, 240, 255, 0.1)', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '0.68rem', color: '#00ffaa', overflowY: 'auto', maxHeight: '220px', display: 'flex', flexDirection: 'column', gap: '4px' } as const;

export const TestConsole: React.FC<TestConsoleProps> = ({
  show,
  onClose,
  runSimulatedTests,
  isRunningTests,
  handleTriggerRandomIncident,
  testLogs,
  clearLogs
}) => {
  if (!show) return null;

  return (
    <div className="util-modal-backdrop" style={BACKDROP_STYLE}>
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="glass-panel util-flex-col"
        style={CONTAINER_STYLE}
      >
        <div style={HEADER_STYLE}>
          <div>
            <h3 style={HEADER_TITLE_STYLE}>
              🧪 SUTRA HARNESS & TELEMETRY
            </h3>
            <span style={HEADER_SUBTITLE_STYLE}>
              Visual sandbox to validate GenAI routing, RAG databases, and dispatches.
            </span>
          </div>
          <button 
            onClick={onClose}
            className="btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '0.7rem' }}
          >
            Close Console
          </button>
        </div>

        {/* Console operations */}
        <div style={GRID_STYLE}>
          
          {/* Actions list */}
          <div className="util-flex-col" style={ACTION_COLUMN_STYLE}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>HARNESS CONTROLS</div>
            
            <button 
              onClick={runSimulatedTests} 
              disabled={isRunningTests}
              className="btn-neon" 
              style={{ fontSize: '0.72rem', padding: '10px 14px', width: '100%', justifyContent: 'center' }}
            >
              {isRunningTests ? 'Executing tests...' : 'Run Integration Suite'}
            </button>

            <button 
              onClick={handleTriggerRandomIncident}
              className="btn-secondary" 
              style={{ fontSize: '0.72rem', padding: '10px 14px', width: '100%' }}
            >
              Simulate Incident Trigger
            </button>

            <div style={STAT_BOX_STYLE}>
              <strong>Harness stats:</strong><br />
              • Environment: Local JSDOM / Browser<br />
              • Telemetry buffer: 15 entries max<br />
              • State sync: Verified active
            </div>
          </div>

          {/* Log terminal */}
          <div className="util-flex-col" style={{ gap: '6px' }}>
            <div style={TERMINAL_HEADER_STYLE}>
              <span>REAL-TIME TELEMETRY FEED</span>
              <button 
                onClick={clearLogs}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.65rem', cursor: 'pointer' }}
              >
                Clear
              </button>
            </div>
            
            <div style={TERMINAL_BOX_STYLE}>
              {testLogs.map((log) => (
                <div 
                  key={log.id} 
                  style={{ 
                    color: log.text.includes('[PASS]') || log.text.includes('validated') ? '#00ffaa' : 
                           log.text.includes('[Running]') || log.text.includes('[Test]') ? 'var(--neon-cyan)' :
                           log.text.includes('[System]') ? 'var(--warning-amber)' : '#94a3b8'
                  }}
                >
                  {log.text}
                </div>
              ))}
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
