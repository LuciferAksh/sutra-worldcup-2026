import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("SUTRA Uncaught Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#060913',
          color: '#fff',
          fontFamily: 'Outfit, sans-serif',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div className="glass-panel" style={{
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '480px',
            border: '1px solid rgba(255, 26, 83, 0.3)',
            boxShadow: '0 0 30px rgba(255, 26, 83, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(255, 26, 83, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--alarm-crimson, #ff1a53)'
            }}>
              <ShieldAlert size={32} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>System Recovery Mode</h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, margin: 0 }}>
              SUTRA telemetry detected an unexpected rendering state: 
              <br />
              <code style={{ color: '#ff1a53', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', display: 'inline-block', marginTop: '8px' }}>
                {this.state.error?.message || 'Unknown render exception'}
              </code>
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '12px',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #00f0ff 0%, #0077ff 100%)',
                color: '#000',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={16} />
              Re-initialize SUTRA Core
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
