import React from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';

interface SettingsModalProps {
  show: boolean;
  onClose: () => void;
  provider: 'local' | 'azure-openai';
  setProvider: (prov: 'local' | 'azure-openai') => void;
  onSave: () => void;
}

const BACKDROP_STYLE = { zIndex: 1000 } as const;
const CONTAINER_STYLE = { width: '100%', maxWidth: '420px', padding: '24px', gap: '16px', border: '1px solid var(--border-glow)', boxShadow: '0 0 30px rgba(0, 240, 255, 0.15)' } as const;
const FORM_WRAPPER_STYLE = { gap: '12px', fontSize: '0.75rem' } as const;
const SELECT_STYLE = { width: '100%', padding: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-muted)', borderRadius: '6px', color: '#fff', outline: 'none', marginTop: '4px' } as const;
const NOTE_BOX_STYLE = { color: 'var(--text-secondary)', fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-muted)', lineHeight: '1.4' } as const;
const ACTION_BAR_STYLE = { display: 'flex', gap: '10px', marginTop: '4px' } as const;

export const SettingsModal: React.FC<SettingsModalProps> = ({
  show,
  onClose,
  provider,
  setProvider,
  onSave
}) => {
  if (!show) return null;

  return (
    <div className="util-modal-backdrop" style={BACKDROP_STYLE}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-panel util-flex-col"
        style={CONTAINER_STYLE}
      >
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={18} style={{ color: 'var(--neon-cyan)' }} />
            SUTRA AI Engine Config
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
            Configure your server-side OpenAI credentials.
          </span>
        </div>

        <div className="util-flex-col" style={FORM_WRAPPER_STYLE}>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>AI Engine Provider</span>
            <select 
              aria-label="AI Engine Provider"
              value={provider} 
              onChange={(e) => setProvider(e.target.value as 'local' | 'azure-openai')}
              style={SELECT_STYLE}
            >
              <option value="azure-openai">☁️ Vercel Serverless API (Using Vercel Env variables)</option>
              <option value="local">🤖 Local RAG fallback (Offline Simulation)</option>
            </select>
          </div>

          {provider === 'azure-openai' ? (
            <div style={NOTE_BOX_STYLE}>
              🔒 **Server-Side Credentials Active**:<br />
              SUTRA will query the serverless Vercel function `/api/chat` using the keys securely configured in your Vercel Dashboard. No keys are required in the client browser.
            </div>
          ) : (
            <div style={NOTE_BOX_STYLE}>
              🤖 **Offline Simulation Fallback**:<br />
              SUTRA will resolve queries instantly inside the browser using the local client-side RAG index.
            </div>
          )}
        </div>

        <div style={ACTION_BAR_STYLE}>
          <button 
            onClick={onSave}
            className="btn-neon" 
            style={{ flex: 1, justifyContent: 'center', padding: '8px 16px', fontSize: '0.8rem' }}
          >
            Save Configuration
          </button>
          <button 
            onClick={onClose}
            className="btn-secondary" 
            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};
