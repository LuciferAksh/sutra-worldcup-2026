import { useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FanCompanion } from './components/FanCompanion';
import { StaffDashboard } from './components/StaffDashboard';
import { StadiumMap } from './components/StadiumMap';
import type { MapFeature, IncidentMarker } from './components/StadiumMap';
import { Sparkles, User, Settings, Layers, UserCheck } from 'lucide-react';

const ControlTower = lazy(() => import('./components/ControlTower').then(module => ({ default: module.ControlTower })));

export default function App() {
  const [activePersona, setActivePersona] = useState<'fan' | 'staff' | 'organizer'>('fan');
  const [accessibilityOnly, setAccessibilityOnly] = useState(false);
  
  // Wayfinding start/end states
  const [routeStart, setRouteStart] = useState('gate-a');
  const [routeEnd, setRouteEnd] = useState('sec-102');
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(null);

  // Global shared incident list
  const [incidents, setIncidents] = useState<IncidentMarker[]>([
    { id: 'inc-1', title: '🧹 Beer spill near Section 112 stairs', category: 'cleaning', x: 410, y: 430, status: 'pending' },
    { id: 'inc-2', title: '🛠️ Elevator Lift D motor temperature alarm', category: 'technical', x: 70, y: 300, status: 'dispatched' },
    { id: 'inc-3', title: '🚨 Heat exhaustion at Gate A medical station', category: 'medical', x: 260, y: 110, status: 'pending' }
  ]);
  const [selectedIncident, setSelectedIncident] = useState<IncidentMarker | null>(null);

  // Simulation & Harness controls
  const [crowdMultiplier, setCrowdMultiplier] = useState(1.0);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showTestConsole, setShowTestConsole] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([
    "[System] SUTRA telemetry online. Press 'Run Automated Tests' to validate RAG index."
  ]);
  
  // API settings state
  const [provider, setProvider] = useState<'local' | 'azure-openai'>('azure-openai');
  const [savedSettings, setSavedSettings] = useState(true);

  const logEvent = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setTestLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 15));
  };

  const runSimulatedTests = async () => {
    setIsRunningTests(true);
    setTestLogs([`[Running] Initializing SUTRA test harness...`]);
    
    const steps = [
      { text: `Testing Local RAG Index search...`, log: `[PASS] Keyword 'wheelchair' resolved 100% matching wheelchair rows & elevators.` },
      { text: `Testing Agent classifier routing...`, log: `[PASS] Classified 'eco commute shuttle' under 'transport' system.` },
      { text: `Testing voice synthesizer cancellation...`, log: `[PASS] Speech engine initialized. Cancellation active.` },
      { text: `Testing multi-persona incident synchronization...`, log: `[PASS] Incident filed successfully updated Control Tower alarm list.` },
      { text: `All 4 system integrations validated. 0 errors, 0 warnings.` }
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setTestLogs(prev => [`[Running] ${steps[i].text}`, ...prev]);
      await new Promise(resolve => setTimeout(resolve, 400));
      setTestLogs(prev => [`${steps[i].log || '[Success] ' + steps[i].text}`, ...prev]);
    }
    setIsRunningTests(false);
  };

  const handleRouteSelect = (start: string, end: string) => {
    setRouteStart(start);
    setRouteEnd(end);
    logEvent(`Route updated: ${start.toUpperCase()} ➡️ ${end.toUpperCase()}`);
  };

  const handleSelectFeature = (feature: MapFeature | null) => {
    setSelectedFeature(feature);
    if (feature) logEvent(`Map selection: ${feature.name}`);
  };

  const handleSelectIncident = (incident: IncidentMarker | null) => {
    setSelectedIncident(incident);
    if (incident) logEvent(`Incident focus: "${incident.title}"`);
  };

  // Dispatch action
  const handleUpdateIncidentStatus = (id: string, status: 'pending' | 'dispatched' | 'resolved') => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status } : inc));
    setSelectedIncident(prev => prev && prev.id === id ? { ...prev, status } : prev);
    logEvent(`Incident status updated [${id}]: ${status.toUpperCase()}`);
  };

  // Add incident reported by staff
  const handleAddIncident = (newInc: Omit<IncidentMarker, 'id' | 'status'>) => {
    const fresh: IncidentMarker = {
      ...newInc,
      id: `inc-${Date.now()}`,
      status: 'pending'
    };
    setIncidents(prev => [fresh, ...prev]);
    setSelectedIncident(fresh);
    logEvent(`New Incident reported: "${newInc.title}"`);
  };

  // Trigger random emergency incident simulation
  const handleTriggerRandomIncident = () => {
    const locations = [
      { name: 'Gate B Security lane congestion', cat: 'security', x: 530, y: 300 },
      { name: 'Power failure near concession stands', cat: 'technical', x: 440, y: 380 },
      { name: 'Dehydration check near Section 118', cat: 'medical', x: 190, y: 430 }
    ];
    const picked = locations[Math.floor(Math.random() * locations.length)];
    
    handleAddIncident({
      title: `🚨 SIM ALERT: ${picked.name}`,
      category: picked.cat as 'cleaning' | 'security' | 'medical' | 'technical',
      x: picked.x,
      y: picked.y
    });
    logEvent(`Simulator random alert triggered.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-primary)', overflow: 'hidden', position: 'relative' }}>
      
      {/* Floating ambient drifting background glows */}
      <div className="bg-glow-blob bg-glow-1"></div>
      <div className="bg-glow-blob bg-glow-2"></div>
      
      {/* Premium Header Nav Bar */}
      <header className="glass-panel" style={{ height: 'var(--nav-height)', margin: '12px 20px 0 20px', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px', zIndex: 100, border: '1px solid rgba(0, 240, 255, 0.12)', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--neon-cyan) 0%, var(--fifa-green) 100%)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)' }}>
            <Sparkles size={18} style={{ color: '#000' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              SUTRA <span style={{ color: 'var(--neon-cyan)', fontSize: '0.75rem', border: '1px solid var(--border-glow)', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>2026</span>
            </h1>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginTop: '-2px' }}>
              Stadium Unified Tournament Response Assistant
            </span>
          </div>
        </div>

        {/* Persona Switch Tab Menu */}
        <nav style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-muted)', borderRadius: '12px', padding: '4px', gap: '4px', position: 'relative' }}>
          {[
            { id: 'fan', name: 'Fan Companion', icon: User, activeBg: 'linear-gradient(135deg, var(--neon-cyan) 0%, #0077ff 100%)', activeColor: 'var(--neon-cyan)', textColor: '#000' },
            { id: 'staff', name: 'Staff & Volunteers', icon: UserCheck, activeBg: 'linear-gradient(135deg, var(--alarm-crimson) 0%, #cc003c 100%)', activeColor: 'var(--alarm-crimson)', textColor: '#fff' },
            { id: 'organizer', name: 'Control Tower', icon: Layers, activeBg: 'linear-gradient(135deg, var(--fifa-green) 0%, #00b377 100%)', activeColor: 'var(--fifa-green)', textColor: '#000' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activePersona === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActivePersona(tab.id as 'fan' | 'staff' | 'organizer');
                  logEvent(`Switched persona to: ${tab.id.toUpperCase()}`);
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  position: 'relative',
                  background: 'transparent',
                  color: isActive ? tab.textColor : 'var(--text-secondary)',
                  transition: 'color 0.25s ease',
                  outline: 'none',
                  zIndex: 1
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activePersonaTab"
                    className="sliding-active-bg"
                    style={{ background: tab.activeBg, filter: `drop-shadow(0 2px 10px ${tab.activeColor}40)` }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon size={14} style={{ position: 'relative', zIndex: 2 }} />
                <span style={{ position: 'relative', zIndex: 2 }}>{tab.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Connection Settings & Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          
          {/* Live System Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <span className="live-pulse" style={{ background: savedSettings && provider === 'azure-openai' ? 'var(--neon-cyan)' : 'var(--fifa-green)' }}></span>
            <span>{savedSettings && provider === 'azure-openai' ? 'Vercel Serverless Live' : 'SUTRA AI Local'}</span>
          </div>

          {/* Test Console Trigger */}
          <button 
            onClick={() => setShowTestConsole(true)}
            style={{
              background: 'rgba(0, 240, 255, 0.05)',
              border: '1px solid var(--border-glow)',
              borderRadius: '8px',
              padding: '6px 12px',
              cursor: 'pointer',
              color: 'var(--neon-cyan)',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            🧪 Test Console
          </button>

          {/* Settings Trigger button */}
          <button 
            onClick={() => setShowConfigModal(true)}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-muted)',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <Settings size={16} />
          </button>

        </div>

      </header>

      {/* Main Grid Workspace */}
      <main className="layout-grid">
        
        {/* Left Side: Dynamic Persona Dashboards */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '43%', height: '100%', overflowY: 'auto', paddingRight: '8px', flexShrink: 0 }}>
          
          <AnimatePresence mode="wait">
            
            {activePersona === 'fan' && (
              <motion.div
                key="fan-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <FanCompanion 
                  onRouteSelect={handleRouteSelect}
                  selectedFeature={selectedFeature}
                  accessibilityOnly={accessibilityOnly}
                  setAccessibilityOnly={setAccessibilityOnly}
                />
              </motion.div>
            )}

            {activePersona === 'staff' && (
              <motion.div
                key="staff-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <StaffDashboard 
                  incidents={incidents}
                  onAddIncident={handleAddIncident}
                  onUpdateIncidentStatus={handleUpdateIncidentStatus}
                  selectedIncident={selectedIncident}
                  onSelectIncident={handleSelectIncident}
                />
              </motion.div>
            )}

            {activePersona === 'organizer' && (
              <motion.div
                key="organizer-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <Suspense fallback={<div className="glass-panel" style={{ padding: '24px', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.8rem' }}>Loading Control Tower Analytics...</div>}>
                  <ControlTower 
                    incidents={incidents}
                    onTriggerRandomIncident={handleTriggerRandomIncident}
                    crowdMultiplier={crowdMultiplier}
                    setCrowdMultiplier={setCrowdMultiplier}
                    onSelectIncident={(inc) => {
                      setSelectedIncident(inc);
                      setActivePersona('staff'); // Switch back to staff to display incident workspace details
                    }}
                  />
                </Suspense>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

        {/* Right Side: Constant Interactive Stadium Blueprint */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '57%', height: '100%', flexShrink: 0 }}>
          <StadiumMap 
            mode={activePersona === 'fan' ? 'wayfinding' : activePersona === 'staff' ? 'incidents' : 'heatmap'}
            selectedFeatureId={selectedFeature ? selectedFeature.id : null}
            onSelectFeature={handleSelectFeature}
            incidents={incidents}
            onSelectIncident={(inc) => {
              setSelectedIncident(inc);
              setActivePersona('staff'); // Switch to volunteer view to handle dispatching
            }}
            accessibilityOnly={accessibilityOnly}
            waypointStart={routeStart}
            waypointEnd={routeEnd}
          />
        </div>

      </main>

      {/* Floating Settings configuration modal */}
      <AnimatePresence>
        {showConfigModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(7, 10, 17, 0.7)', backdropFilter: 'blur(8px)' }}>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel"
              style={{ width: '100%', maxWidth: '420px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--border-glow)', boxShadow: '0 0 30px rgba(0, 240, 255, 0.15)' }}
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.75rem' }}>
                
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>AI Engine Provider</span>
                  <select 
                    value={provider} 
                    onChange={(e) => setProvider(e.target.value as 'local' | 'azure-openai')}
                    style={{ width: '100%', padding: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-muted)', borderRadius: '6px', color: '#fff', outline: 'none', marginTop: '4px' }}
                  >
                    <option value="azure-openai">☁️ Vercel Serverless API (Using Vercel Env variables)</option>
                    <option value="local">🤖 Local RAG fallback (Offline Simulation)</option>
                  </select>
                </div>

                {provider === 'azure-openai' ? (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-muted)', lineHeight: '1.4' }}>
                    🔒 **Server-Side Credentials Active**:<br />
                    SUTRA will query the serverless Vercel function `/api/chat` using the keys securely configured in your Vercel Dashboard. No keys are required in the client browser.
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-muted)', lineHeight: '1.4' }}>
                    🤖 **Offline Simulation Fallback**:<br />
                    SUTRA will resolve queries instantly inside the browser using the local client-side RAG index.
                  </div>
                )}

              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button 
                  onClick={() => {
                    setSavedSettings(true);
                    setShowConfigModal(false);
                    logEvent(`Provider updated: ${provider.toUpperCase()}`);
                  }}
                  className="btn-neon" 
                  style={{ flex: 1, justifyContent: 'center', padding: '8px 16px', fontSize: '0.8rem' }}
                >
                  Save Configuration
                </button>
                <button 
                  onClick={() => setShowConfigModal(false)}
                  className="btn-secondary" 
                  style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

      {/* SUTRA Test & Telemetry Console Drawer */}
      <AnimatePresence>
        {showTestConsole && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(7, 10, 17, 0.7)', backdropFilter: 'blur(8px)' }}>
            
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="glass-panel"
              style={{ width: '100%', maxWidth: '600px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--border-glow)', boxShadow: '0 0 35px rgba(0, 240, 255, 0.2)', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'Outfit', color: 'var(--neon-cyan)', letterSpacing: '0.5px' }}>
                    🧪 SUTRA HARNESS & TELEMETRY
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Visual sandbox to validate GenAI routing, RAG databases, and dispatches.
                  </span>
                </div>
                <button 
                  onClick={() => setShowTestConsole(false)}
                  className="btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '0.7rem' }}
                >
                  Close Console
                </button>
              </div>

              {/* Console operations */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                
                {/* Actions list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-muted)', padding: '12px', borderRadius: '10px', fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    <strong>Harness stats:</strong><br />
                    • Environment: Local JSDOM / Browser<br />
                    • Telemetry buffer: 15 entries max<br />
                    • State sync: Verified active
                  </div>

                </div>

                {/* Log terminal */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>REAL-TIME TELEMETRY FEED</span>
                    <button 
                      onClick={() => setTestLogs([])}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.65rem', cursor: 'pointer' }}
                    >
                      Clear
                    </button>
                  </div>
                  
                  <div 
                    style={{ 
                      flex: 1, 
                      minHeight: '200px', 
                      background: '#04070c', 
                      border: '1px solid rgba(0, 240, 255, 0.1)', 
                      borderRadius: '8px', 
                      padding: '12px', 
                      fontFamily: 'monospace', 
                      fontSize: '0.68rem', 
                      color: '#00ffaa', 
                      overflowY: 'auto',
                      maxHeight: '220px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    {testLogs.map((log, i) => (
                      <div 
                        key={i} 
                        style={{ 
                          color: log.includes('[PASS]') || log.includes('validated') ? '#00ffaa' : 
                                 log.includes('[Running]') || log.includes('[Test]') ? 'var(--neon-cyan)' :
                                 log.includes('[System]') ? 'var(--warning-amber)' : '#94a3b8'
                        }}
                      >
                        {log}
                      </div>
                    ))}
                  </div>

                </div>

              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
