import { useMemo, memo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';
import { ShieldAlert, Cpu, Leaf, Users, ChevronRight, Activity } from 'lucide-react';
import type { IncidentMarker } from './StadiumMap';

interface ControlTowerProps {
  incidents: IncidentMarker[];
  onTriggerRandomIncident: () => void;
  crowdMultiplier: number;
  setCrowdMultiplier: (val: number) => void;
  onSelectIncident: (incident: IncidentMarker) => void;
}

const SUSTAINABILITY_DATA = [
  { category: 'Compost (Food)', Recycled: 4.8, Landfill: 0.2 },
  { category: 'Plastics (PET)', Recycled: 8.2, Landfill: 0.9 },
  { category: 'Alu Cans', Recycled: 6.5, Landfill: 0.1 },
  { category: 'Paper/Card', Recycled: 3.1, Landfill: 2.4 },
];

const PREDICTIVE_ALERTS = [
  { id: 'pa-1', title: '🚨 GATE C CROWD DENSITY PEAK', desc: 'Predictive flows indicate queue times at Gate C will exceed 24 mins by 20:45. Recommendation: Broadcast alternate route advisories to Fan portals.', time: '2m ago', severity: 'high' },
  { id: 'pa-2', title: '⚡ LOT SILVER EV OVERLOAD', desc: 'EV charging stations drawing high grid power load (85kW). Activating solar backer grids.', time: '12m ago', severity: 'moderate' },
  { id: 'pa-3', title: '♿ LIFT MOTOR TEMPERATURE WARN', desc: 'West elevator lift motor thermal sensors at 78C. Dispatching engineering tech team.', time: '18m ago', severity: 'low' },
];

export const ControlTower: React.FC<ControlTowerProps> = memo(({
  incidents,
  onTriggerRandomIncident,
  crowdMultiplier,
  setCrowdMultiplier,
  onSelectIncident
}) => {
  const flowData = useMemo(() => [
    { hour: '16:00', GateA: 1200 * crowdMultiplier, GateB: 800 * crowdMultiplier, GateC: 1500 * crowdMultiplier, GateD: 400 * crowdMultiplier },
    { hour: '17:00', GateA: 2400 * crowdMultiplier, GateB: 1600 * crowdMultiplier, GateC: 3100 * crowdMultiplier, GateD: 900 * crowdMultiplier },
    { hour: '18:00', GateA: 4800 * crowdMultiplier, GateB: 3500 * crowdMultiplier, GateC: 6200 * crowdMultiplier, GateD: 2100 * crowdMultiplier },
    { hour: '19:00', GateA: 8200 * crowdMultiplier, GateB: 7100 * crowdMultiplier, GateC: 9800 * crowdMultiplier, GateD: 4300 * crowdMultiplier },
    { hour: '20:00', GateA: 9500 * crowdMultiplier, GateB: 8400 * crowdMultiplier, GateC: 11200 * crowdMultiplier, GateD: 5900 * crowdMultiplier },
    { hour: '20:30 (Live)', GateA: 10400 * crowdMultiplier, GateB: 9200 * crowdMultiplier, GateC: 12500 * crowdMultiplier, GateD: 6400 * crowdMultiplier },
  ], [crowdMultiplier]);

  return (
    <div className="util-flex-col-gap-xl">
      
      {/* Metrics Row */}
      <div className="util-grid-4">
        
        {/* Occupancy card */}
        <div className="glass-panel util-flex-col-gap-sm" style={{ borderLeft: '3px solid var(--neon-cyan)', padding: '14px 18px' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.5px' }}>LIVE ATTENDANCE</span>
          <div className="util-flex-between-baseline">
            <span style={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: 'Outfit', color: 'var(--neon-cyan)', textShadow: '0 0 10px rgba(0, 240, 255, 0.2)' }}>
              {Math.round(62400 * crowdMultiplier).toLocaleString()}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--fifa-green)', fontWeight: 800 }}>82% CAP</span>
          </div>
          <div className="util-progress-bar-track">
            <div style={{ width: `${Math.min(82 * crowdMultiplier, 100)}%`, height: '100%', background: 'var(--neon-cyan)', boxShadow: '0 0 8px var(--neon-cyan)' }}></div>
          </div>
        </div>

        {/* Cleanliness rating */}
        <div className="glass-panel util-flex-col-gap-sm" style={{ borderLeft: '3px solid var(--fifa-green)', padding: '14px 18px' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.5px' }}>GRID EFFICIENCY</span>
          <div className="util-flex-between-baseline">
            <span style={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: 'Outfit', color: 'var(--fifa-green)', textShadow: '0 0 10px rgba(0, 255, 170, 0.2)' }}>
              89.4%
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 800 }}>SOLAR LOAD</span>
          </div>
          <div className="util-progress-bar-track">
            <div style={{ width: '89.4%', height: '100%', background: 'var(--fifa-green)', boxShadow: '0 0 8px var(--fifa-green)' }}></div>
          </div>
        </div>

        {/* Shuttles Active */}
        <div className="glass-panel util-flex-col-gap-sm" style={{ borderLeft: '3px solid var(--neon-cyan)', padding: '14px 18px' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.5px' }}>ACTIVE SHUTTLES</span>
          <div className="util-flex-between-baseline">
            <span style={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: 'Outfit', color: '#fff' }}>
              14 / 16
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--fifa-green)', fontWeight: 800 }}>ECO-BUS</span>
          </div>
          <div className="util-progress-bar-track">
            <div style={{ width: '87.5%', height: '100%', background: 'var(--neon-cyan)' }}></div>
          </div>
        </div>

        {/* Carbon Offset */}
        <div className="glass-panel util-flex-col-gap-sm" style={{ borderLeft: '3px solid var(--warning-amber)', padding: '14px 18px' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.5px' }}>TREES PLANTED</span>
          <div className="util-flex-between-baseline">
            <span style={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: 'Outfit', color: 'var(--warning-amber)', textShadow: '0 0 10px rgba(255, 170, 0, 0.2)' }}>
              4,129
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--fifa-green)', fontWeight: 800 }}>+140 LIVE</span>
          </div>
          <div className="util-progress-bar-track">
            <div style={{ width: '70%', height: '100%', background: 'var(--warning-amber)', boxShadow: '0 0 8px var(--warning-amber)' }}></div>
          </div>
        </div>

      </div>

      {/* Analytics Charts Area */}
      <div className="util-grid-1-2-to-1">
        
        {/* Ingress Flow area */}
        <div className="glass-panel util-chart-panel">
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} style={{ color: 'var(--neon-cyan)' }} />
            INGRESS FLOW INDEX RATES (FANS / HR)
          </h4>
          <div className="util-flex-1 util-text-xs" style={{ opacity: 0.9 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flowData}>
                <defs>
                  <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--neon-cyan)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--neon-cyan)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--alarm-crimson)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--alarm-crimson)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="hour" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontWeight: 600 }} />
                <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontWeight: 600 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-muted)', color: '#fff', borderRadius: '8px', fontSize: '11px', fontFamily: 'Plus Jakarta Sans' }} />
                <Area type="monotone" dataKey="GateA" stroke="var(--neon-cyan)" strokeWidth={2} fillOpacity={1} fill="url(#colorA)" name="Gate A (North)" />
                <Area type="monotone" dataKey="GateC" stroke="var(--alarm-crimson)" strokeWidth={2} fillOpacity={1} fill="url(#colorC)" name="Gate C (South)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Waste Diversion Bar */}
        <div className="glass-panel util-chart-panel">
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Leaf size={14} style={{ color: 'var(--fifa-green)' }} />
            WASTE RECYCLING DIVERSION (TONS)
          </h4>
          <div className="util-flex-1 util-text-xs" style={{ opacity: 0.9 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SUSTAINABILITY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="category" stroke="var(--text-secondary)" tick={{ fontSize: '8px', fill: 'var(--text-secondary)', fontWeight: 600 }} />
                <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontWeight: 600 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-muted)', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="Recycled" fill="var(--fifa-green)" radius={[4, 4, 0, 0]} stackId="a" name="Sorted Recycle" />
                <Bar dataKey="Landfill" fill="rgba(255, 255, 255, 0.05)" radius={[4, 4, 0, 0]} stackId="a" name="Landfill waste" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Alerts Feed and Control Tweak Drawer */}
      <div className="util-grid-1-to-1-2">
        
        {/* SUTRA Alerts */}
        <div className="glass-panel util-flex-col-gap-md" style={{ padding: '18px' }}>
          <div className="util-flex-between">
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={14} style={{ color: 'var(--neon-cyan)' }} />
              PREDICTIVE AI RADAR ALERTS
            </h4>
            <button 
              onClick={onTriggerRandomIncident} 
              className="selector-chip active-cyan" 
              style={{ padding: '3px 8px', fontSize: '0.58rem', borderStyle: 'dashed' }}
            >
              SIM TRIGGER
            </button>
          </div>

          <div className="util-scroll-y-max-180">
            {PREDICTIVE_ALERTS.map(alert => (
              <div 
                key={alert.id}
                style={{
                  background: 'rgba(255,255,255,0.01)',
                  border: `1px solid ${alert.severity === 'high' ? 'rgba(255, 26, 83, 0.25)' : 'var(--border-muted)'}`,
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '0.72rem',
                  lineHeight: '1.4'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 800, color: alert.severity === 'high' ? 'var(--alarm-crimson)' : 'var(--warning-amber)', fontFamily: 'Outfit', letterSpacing: '0.5px' }}>
                    {alert.title}
                  </span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700 }}>{alert.time}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.68rem', fontWeight: 500 }}>{alert.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dispatch Command Desk */}
        <div className="glass-panel util-flex-col-gap-md" style={{ padding: '18px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={14} style={{ color: 'var(--alarm-crimson)' }} />
            ACTIVE INCIDENTS DISPATCH BOARD
          </h4>

          <div className="util-flex-col-gap-xs" style={{ flex: 1, overflowY: 'auto', maxHeight: '140px' }}>
            {incidents.filter(i => i.status !== 'resolved').length > 0 ? (
              incidents.filter(i => i.status !== 'resolved').map(incident => (
                <div 
                  key={incident.id}
                  onClick={() => onSelectIncident(incident)}
                  className="glass-card-interactive util-flex-between"
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.72rem'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 800, color: '#fff' }}>{incident.title}</span>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', marginTop: '2px', fontWeight: 600 }}>
                      ZONE: {incident.x}, {incident.y} | TYPE: {incident.category.toUpperCase()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={`badge ${incident.status === 'pending' ? 'badge-crimson' : 'badge-amber'}`} style={{ fontSize: '0.55rem' }}>
                      {incident.status.toUpperCase()}
                    </span>
                    <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              ))
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80px', color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600 }}>
                ✓ NO ACTIVE DISPATCH HAZARDS REPORTED
              </div>
            )}
          </div>
          
          {/* Simulation console */}
          <div className="util-flex-between" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px', gap: '16px' }}>
            <div className="util-flex-align-center-gap-sm" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              <Users size={14} style={{ color: 'var(--neon-cyan)' }} />
              <span>CROWD INGRESS SCALER:</span>
            </div>
            
            <div className="util-flex-1 util-flex-align-center-gap-md">
              <input 
                type="range" 
                min="0.5" 
                max="1.5" 
                step="0.1" 
                value={crowdMultiplier} 
                onChange={(e) => setCrowdMultiplier(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--neon-cyan)', height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px', outline: 'none', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.72rem', fontWeight: 900, width: '36px', color: 'var(--neon-cyan)' }}>{Math.round(crowdMultiplier * 100)}%</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
});
