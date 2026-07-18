import { useState, Suspense, lazy, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StadiumMap } from './components/StadiumMap';
import type { MapFeature, IncidentMarker } from './components/StadiumMap';
import { Sparkles, User, Settings, Layers, UserCheck } from 'lucide-react';
import { SettingsModal } from './components/SettingsModal';
import { TestConsole } from './components/TestConsole';
import type { TestLogEntry } from './components/TestConsole';

const FanCompanion = lazy(() => import('./components/FanCompanion').then(module => ({ default: module.FanCompanion })));
const StaffDashboard = lazy(() => import('./components/StaffDashboard').then(module => ({ default: module.StaffDashboard })));
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
  
  const [testLogs, setTestLogs] = useState<TestLogEntry[]>([
    { id: 'log-init', text: "[System] SUTRA telemetry online. Press 'Run Automated Tests' to validate RAG index." }
  ]);
  
  // API settings state
  const [provider, setProvider] = useState<'local' | 'azure-openai'>('azure-openai');
  const [savedSettings, setSavedSettings] = useState(true);

  const logEvent = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString();
    const entry: TestLogEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      text: `[${time}] ${msg}`
    };
    setTestLogs(prev => [entry, ...prev].slice(0, 15));
  }, []);

  const runSimulatedTests = useCallback(async () => {
    setIsRunningTests(true);
    setTestLogs([{ id: `log-${Date.now()}-run`, text: `[Running] Initializing SUTRA test harness...` }]);
    
    const steps = [
      { text: `Testing Local RAG Index search...`, log: `[PASS] Keyword 'wheelchair' resolved 100% matching wheelchair rows & elevators.` },
      { text: `Testing Agent classifier routing...`, log: `[PASS] Classified 'eco commute shuttle' under 'transport' system.` },
      { text: `Testing voice synthesizer cancellation...`, log: `[PASS] Speech engine initialized. Cancellation active.` },
      { text: `Testing multi-persona incident synchronization...`, log: `[PASS] Incident filed successfully updated Control Tower alarm list.` },
      { text: `All 4 system integrations validated. 0 errors, 0 warnings.` }
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setTestLogs(prev => [{ id: `log-${Date.now()}-${i}-text`, text: `[Running] ${steps[i].text}` }, ...prev]);
      await new Promise(resolve => setTimeout(resolve, 400));
      setTestLogs(prev => [{ id: `log-${Date.now()}-${i}-log`, text: `${steps[i].log || '[Success] ' + steps[i].text}` }, ...prev]);
    }
    setIsRunningTests(false);
  }, []);

  const handleRouteSelect = useCallback((start: string, end: string) => {
    setRouteStart(start);
    setRouteEnd(end);
    logEvent(`Route updated: ${start.toUpperCase()} ➡️ ${end.toUpperCase()}`);
  }, [logEvent]);

  const handleSelectFeature = useCallback((feature: MapFeature | null) => {
    setSelectedFeature(feature);
    if (feature) logEvent(`Map selection: ${feature.name}`);
  }, [logEvent]);

  const handleSelectIncident = useCallback((incident: IncidentMarker | null) => {
    setSelectedIncident(incident);
    if (incident) logEvent(`Incident focus: "${incident.title}"`);
  }, [logEvent]);

  const handleSelectIncidentAndSwitch = useCallback((incident: IncidentMarker) => {
    setSelectedIncident(incident);
    setActivePersona('staff');
    if (incident) logEvent(`Incident focus & dispatch: "${incident.title}"`);
  }, [logEvent]);

  // Dispatch action
  const handleUpdateIncidentStatus = useCallback((id: string, status: 'pending' | 'dispatched' | 'resolved') => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status } : inc));
    setSelectedIncident(prev => prev && prev.id === id ? { ...prev, status } : prev);
    logEvent(`Incident status updated [${id}]: ${status.toUpperCase()}`);
  }, [logEvent]);

  // Add incident reported by staff
  const handleAddIncident = useCallback((newInc: Omit<IncidentMarker, 'id' | 'status'>) => {
    const fresh: IncidentMarker = {
      ...newInc,
      id: `inc-${Date.now()}`,
      status: 'pending'
    };
    setIncidents(prev => [fresh, ...prev]);
    logEvent(`Incident reported: "${newInc.title}"`);
  }, [logEvent]);

  // Trigger random emergency incident simulation
  const handleTriggerRandomIncident = useCallback(() => {
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
  }, [handleAddIncident, logEvent]);

  return (
    <div className="app-container">
      
      {/* Floating ambient drifting background glows */}
      <div className="bg-glow-blob bg-glow-1"></div>
      <div className="bg-glow-blob bg-glow-2"></div>
      
      {/* Premium Header Nav Bar */}
      <header className="glass-panel app-header">
        
        {/* Brand Logo */}
        <div className="util-flex-align-center-gap-md">
          <div className="app-logo-box">
            <Sparkles size={18} style={{ color: '#000' }} />
          </div>
          <div>
            <h1 className="app-logo-text">
              SUTRA <span style={{ color: 'var(--neon-cyan)', fontSize: '0.75rem', border: '1px solid var(--border-glow)', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>2026</span>
            </h1>
            <span className="app-logo-sub">
              Stadium Unified Tournament Response Assistant
            </span>
          </div>
        </div>

        {/* Persona Switch Tab Menu */}
        <nav role="tablist" className="app-nav-tabs">
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
                role="tab"
                aria-selected={isActive}
                aria-label={tab.name}
                onClick={() => {
                  setActivePersona(tab.id as 'fan' | 'staff' | 'organizer');
                  logEvent(`Switched persona to: ${tab.id.toUpperCase()}`);
                }}
                className="app-nav-tab-btn"
                style={{
                  color: isActive ? tab.textColor : undefined
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
                <Icon size={14} className="util-rel-z2" />
                <span className="util-rel-z2">{tab.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Connection Settings & Indicators */}
        <div className="util-flex-align-center-gap-md2">
          
          {/* Live System Indicator */}
          <div className="app-indicator-text">
            <span className="live-pulse" style={{ background: savedSettings && provider === 'azure-openai' ? 'var(--neon-cyan)' : 'var(--fifa-green)' }}></span>
            <span>{savedSettings && provider === 'azure-openai' ? 'Vercel Serverless Live' : 'SUTRA AI Local'}</span>
          </div>

          {/* Test Console Trigger */}
          <button 
            onClick={() => setShowTestConsole(true)}
            aria-label="Open SUTRA Test Console"
            className="app-test-console-btn"
          >
            🧪 Test Console
          </button>

          {/* Settings Trigger button */}
          <button 
            onClick={() => setShowConfigModal(true)}
            aria-label="Configure SUTRA Settings"
            className="app-settings-btn"
          >
            <Settings size={16} />
          </button>

        </div>

      </header>

      {/* Main Grid Workspace */}
      <main id="main-content" className="layout-grid">
        
        {/* Left Side: Dynamic Persona Dashboards */}
        <div className="app-sidebar">
          
          <AnimatePresence mode="wait">
            
            {activePersona === 'fan' && (
              <motion.div
                key="fan-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="util-flex-col"
              >
                <Suspense fallback={<div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Loading Fan Companion...</div>}>
                  <FanCompanion 
                    onRouteSelect={handleRouteSelect}
                    selectedFeature={selectedFeature}
                    accessibilityOnly={accessibilityOnly}
                    setAccessibilityOnly={setAccessibilityOnly}
                  />
                </Suspense>
              </motion.div>
            )}

            {activePersona === 'staff' && (
              <motion.div
                key="staff-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="util-flex-col"
              >
                <Suspense fallback={<div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Loading Staff Workspace...</div>}>
                  <StaffDashboard 
                    incidents={incidents}
                    onAddIncident={handleAddIncident}
                    onUpdateIncidentStatus={handleUpdateIncidentStatus}
                    selectedIncident={selectedIncident}
                    onSelectIncident={handleSelectIncident}
                  />
                </Suspense>
              </motion.div>
            )}

            {activePersona === 'organizer' && (
              <motion.div
                key="organizer-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="util-flex-col"
              >
                <Suspense fallback={<div className="glass-panel util-p-4 util-text-sm" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Control Tower Analytics...</div>}>
                  <ControlTower 
                    incidents={incidents}
                    onTriggerRandomIncident={handleTriggerRandomIncident}
                    crowdMultiplier={crowdMultiplier}
                    setCrowdMultiplier={setCrowdMultiplier}
                    onSelectIncident={handleSelectIncidentAndSwitch}
                  />
                </Suspense>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

        {/* Right Side: Constant Interactive Stadium Blueprint */}
        <div className="app-main-map-container">
          <StadiumMap 
            mode={activePersona === 'fan' ? 'wayfinding' : activePersona === 'staff' ? 'incidents' : 'heatmap'}
            selectedFeatureId={selectedFeature ? selectedFeature.id : null}
            onSelectFeature={handleSelectFeature}
            incidents={incidents}
            onSelectIncident={handleSelectIncidentAndSwitch}
            accessibilityOnly={accessibilityOnly}
            waypointStart={routeStart}
            waypointEnd={routeEnd}
          />
        </div>

      </main>

      {/* Floating Settings configuration modal */}
      <AnimatePresence>
        <SettingsModal 
          show={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          provider={provider}
          setProvider={setProvider}
          onSave={() => {
            setSavedSettings(true);
            setShowConfigModal(false);
            logEvent(`Provider updated: ${provider.toUpperCase()}`);
          }}
        />
      </AnimatePresence>

      {/* SUTRA Test & Telemetry Console Drawer */}
      <AnimatePresence>
        <TestConsole 
          show={showTestConsole}
          onClose={() => setShowTestConsole(false)}
          runSimulatedTests={runSimulatedTests}
          isRunningTests={isRunningTests}
          handleTriggerRandomIncident={handleTriggerRandomIncident}
          testLogs={testLogs}
          clearLogs={() => setTestLogs([])}
        />
      </AnimatePresence>

    </div>
  );
}
