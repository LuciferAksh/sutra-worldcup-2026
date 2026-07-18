import { useState } from 'react';
import { Shield, CheckCircle, UserCheck, PlusCircle, Globe, AlertTriangle } from 'lucide-react';
import { MAP_FEATURES } from './StadiumMap';
import type { IncidentMarker } from './StadiumMap';

interface StaffDashboardProps {
  incidents: IncidentMarker[];
  onAddIncident: (incident: Omit<IncidentMarker, 'id' | 'status'>) => void;
  onUpdateIncidentStatus: (id: string, status: 'pending' | 'dispatched' | 'resolved') => void;
  selectedIncident: IncidentMarker | null;
  onSelectIncident: (incident: IncidentMarker | null) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  incidents,
  onAddIncident,
  onUpdateIncidentStatus,
  selectedIncident,
  onSelectIncident
}) => {
  // New Incident Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'cleaning' | 'security' | 'medical' | 'technical'>('cleaning');
  const [locationId, setLocationId] = useState('gate-a');
  
  // Translation Hub State
  const [translatedText, setTranslatedText] = useState('');
  const [translateQuery, setTranslateQuery] = useState('');
  const [translateTarget, setTranslateTarget] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleSubmitIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const feature = MAP_FEATURES.find(f => f.id === locationId);
    const x = feature ? feature.x : 300;
    const y = feature ? feature.y : 300;

    onAddIncident({
      title,
      category,
      x,
      y
    });

    setTitle('');
  };

  const handleTranslate = () => {
    if (!translateQuery.trim()) return;
    setIsTranslating(true);
    
    setTimeout(() => {
      setIsTranslating(false);
      const dict: Record<string, Record<string, string>> = {
        es: {
          "where is the nearest medical station?": "📍 ¿Dónde está la estación médica más cercana? -> Located at Gates A & C. (Ubicada en las Puertas A y C.)",
          "my child is lost": "🚨 Mi hijo está perdido -> Alerting security. Please head to Gate A Guest Services. (Alertando seguridad. Diríjase a Servicios al Huésped.)",
          "where is the sensory room?": "♿ ¿Dónde está la sala sensorial? -> Near Section 118. (Cerca de la Sección 118.)",
          "is there vegan food?": "🌱 ¿Hay comida vegana? -> Yes, Verde Bites at Sections 112 & 220. (Sí, Verde Bites en las secciones 112 y 220.)"
        },
        fr: {
          "where is the nearest medical station?": "📍 Où se trouve le poste médical le plus proche? -> Aux portes A et C. (Portes A & C.)",
          "my child is lost": "🚨 Mon enfant est perdu -> Alerte sécurité. Veuillez vous rendre aux services aux invités, Porte A. (Services invités Porte A.)",
          "where is the sensory room?": "♿ Où est la salle sensorielle? -> Près de la section 118. (Section 118.)",
          "is there vegan food?": "🌱 Y a-t-il de la nourriture végétalienne? -> Oui, Verde Bites aux sections 112 et 220. (Verde Bites, sections 112 et 220.)"
        }
      };

      const queryLower = translateQuery.toLowerCase().trim();
      const translation = dict[translateTarget]?.[queryLower] || 
        `Translated to ${translateTarget.toUpperCase()}: "${translateQuery}" -> SUTRA AI: Gate C assistance deployed.`;
      
      setTranslatedText(translation);
    }, 600);
  };

  return (
    <div className="util-flex-col-gap-xl">
      
      {/* Upper Grid Layout */}
      <div className="util-grid-1-2-to-1">
        
        {/* Incident Reporter Form Card */}
        <div className="glass-panel util-flex-col-gap-sm" style={{ padding: '18px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PlusCircle size={14} style={{ color: 'var(--alarm-crimson)' }} />
            DISPATCH NEW REPORT PIN
          </h4>

          <form onSubmit={handleSubmitIncident} className="util-flex-col-gap-md util-text-xs">
            <div>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>Hazard Description</span>
              <input 
                type="text" 
                aria-label="Incident Description"
                placeholder="e.g. Water puddle on Section 112 steps" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="util-input-base util-w-full"
                style={{ marginTop: '4px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '10px' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Category</span>
                <select 
                  aria-label="Incident Category"
                  value={category} 
                  onChange={(e) => setCategory(e.target.value as 'cleaning' | 'security' | 'medical' | 'technical')}
                  className="util-select-base util-w-full"
                >
                  <option value="cleaning">🧹 CLEANING / SPILL</option>
                  <option value="security">🛡️ CROWD SECURITY</option>
                  <option value="medical">🚨 MEDICAL ASSIST</option>
                  <option value="technical">🛠️ TECHNICAL / LIFT</option>
                </select>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Target Zone</span>
                <select 
                  aria-label="Incident Location Zone"
                  value={locationId} 
                  onChange={(e) => setLocationId(e.target.value)}
                  className="util-select-base util-w-full"
                >
                  {MAP_FEATURES.map(f => (
                    <option key={f.id} value={f.id}>{f.name.split(' (')[0]}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-neon" 
              style={{ background: 'var(--alarm-crimson-gradient)', boxShadow: '0 4px 15px var(--alarm-crimson-glow)', padding: '10px 16px', justifyContent: 'center', marginTop: '6px' }}
            >
              Broadcast Supervisor Alert
            </button>
          </form>
        </div>

        {/* Multilingual Translator Hub */}
        <div className="glass-panel util-flex-col-gap-sm" style={{ padding: '18px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={14} style={{ color: 'var(--neon-cyan)' }} />
            STAFF TRANSLATOR RADAR
          </h4>

          <div className="util-flex-col-gap-md util-text-xs">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>Convert Fan Query</span>
              <select 
                aria-label="Target Translation Language"
                value={translateTarget} 
                onChange={(e) => setTranslateTarget(e.target.value)}
                className="util-select-base"
                style={{ padding: '2px 6px', fontSize: '0.65rem', fontWeight: 700 }}
              >
                <option value="es">to Spanish (ES)</option>
                <option value="fr">to French (FR)</option>
              </select>
            </div>

            <input 
              type="text" 
              aria-label="Translation query input"
              placeholder="e.g. where is the nearest medical station?" 
              value={translateQuery}
              onChange={(e) => setTranslateQuery(e.target.value)}
              className="util-input-base util-w-full"
            />

            <button 
              onClick={handleTranslate} 
              className="btn-secondary" 
              style={{ padding: '8px 12px', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}
            >
              {isTranslating ? 'SYNCING TRANSLATION...' : 'EXECUTE TRANSLATE & RETRIEVE'}
            </button>

            {translatedText && (
              <div className="util-chat-user util-w-full" style={{ padding: '10px', border: '1px solid rgba(0, 240, 255, 0.15)', color: 'var(--neon-cyan)', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                {translatedText}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Dispatch Feed Command Drawer */}
      <div className="glass-panel util-flex-col-gap-md util-flex-1" style={{ minHeight: '320px', padding: '20px' }}>
        <div className="util-border-bottom util-flex-between">
          <div className="util-flex-align-center-gap-sm">
            <span className="live-pulse" style={{ background: 'var(--alarm-crimson)', boxShadow: '0 0 8px var(--alarm-crimson-glow)' }}></span>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 900, fontFamily: 'Outfit', letterSpacing: '0.5px' }}>DISPATCH COMMAND FEED</h4>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
            ACTIVE TASKS: {incidents.filter(i => i.status !== 'resolved').length}
          </span>
        </div>

        <div className="util-grid-1-2-to-1" style={{ gap: '20px', flex: 1, overflow: 'hidden' }}>
          
          {/* List queue */}
          <div className="util-flex-col" style={{ overflowY: 'auto', gap: '8px', paddingRight: '4px' }}>
            {incidents.map((incident) => {
              const isSelected = selectedIncident?.id === incident.id;
              
              // Status colored borders
              let borderStyle = '1px solid var(--border-muted)';
              let cardBg = 'rgba(255, 255, 255, 0.01)';
              
              if (isSelected) {
                borderStyle = '1px solid var(--neon-cyan)';
                cardBg = 'rgba(0, 240, 255, 0.03)';
              } else if (incident.status === 'pending') {
                borderStyle = '1px solid rgba(255, 26, 83, 0.15)';
              } else if (incident.status === 'dispatched') {
                borderStyle = '1px solid rgba(255, 170, 0, 0.15)';
              }

              return (
                <div 
                  key={incident.id}
                  onClick={() => onSelectIncident(incident)}
                  className="util-flex-col util-rounded-lg util-cursor-pointer"
                  style={{
                    padding: '12px 14px',
                    background: cardBg,
                    border: borderStyle,
                    transition: 'all 0.25s',
                    gap: '6px'
                  }}
                >
                  <div className="util-flex-between">
                    <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#fff' }}>{incident.title}</span>
                    <span className={`badge ${incident.status === 'pending' ? 'badge-crimson' : 'badge-amber'}`}>
                      {incident.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="util-flex-between util-text-xs" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                    <span>TYPE: {incident.category.toUpperCase()}</span>
                    <span>COORDS: {incident.x}, {incident.y}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details Drawer */}
          <div className="util-flex-col-gap-lg" style={{ borderLeft: '1px solid rgba(255,255,255,0.04)', paddingLeft: '20px' }}>
            {selectedIncident ? (
              <div className="util-flex-col-gap-lg util-h-full">
                <div>
                  <span className="badge badge-cyan" style={{ marginBottom: '6px' }}>Incident Triage</span>
                  <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#fff', fontFamily: 'Outfit', letterSpacing: '0.5px' }}>
                    {selectedIncident.title.toUpperCase()}
                  </h4>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 600 }}>
                    CATEGORY: <span style={{ color: '#fff' }}>{selectedIncident.category.toUpperCase()}</span>
                  </div>
                </div>

                <div style={{ background: 'rgba(0, 240, 255, 0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(0, 240, 255, 0.15)', fontSize: '0.72rem', lineHeight: '1.45' }}>
                  <div style={{ fontWeight: 800, marginBottom: '6px', color: 'var(--neon-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={12} />
                    SUTRA AI TRIAGE MATRIX
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                    • Volunteers within sector radius: **4 staff**<br />
                    • Calculated walk travel time: **90 seconds**<br />
                    • Incident severity ranking: **MODERATE**<br />
                    • Status recommendation: **Immediate Dispatch**
                  </div>
                </div>

                <div className="util-flex-col" style={{ marginTop: 'auto', gap: '8px' }}>
                  {selectedIncident.status === 'pending' && (
                    <button 
                      onClick={() => onUpdateIncidentStatus(selectedIncident.id, 'dispatched')}
                      className="btn-neon" 
                      style={{ fontSize: '0.75rem', padding: '10px 14px', justifyContent: 'center' }}
                    >
                      <UserCheck size={14} />
                      DISPATCH FIELD VOLUNTEER
                    </button>
                  )}
                  
                  {selectedIncident.status === 'dispatched' && (
                    <button 
                      onClick={() => onUpdateIncidentStatus(selectedIncident.id, 'resolved')}
                      className="btn-neon" 
                      style={{ background: 'var(--fifa-green-gradient)', boxShadow: '0 4px 15px var(--fifa-green-glow)', fontSize: '0.75rem', padding: '10px 14px', justifyContent: 'center', color: '#030712' }}
                    >
                      <CheckCircle size={14} />
                      MARK INCIDENT RESOLVED
                    </button>
                  )}

                  {selectedIncident.status === 'resolved' && (
                    <div style={{ textAlign: 'center', color: 'var(--fifa-green)', fontWeight: 900, fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                      ✓ THREAT SECURED & CLEANED
                    </div>
                  )}

                  <button 
                    onClick={() => onSelectIncident(null)}
                    className="btn-secondary" 
                    style={{ fontSize: '0.75rem', padding: '8px 12px', justifyContent: 'center' }}
                  >
                    CLOSE PORTAL
                  </button>
                </div>
              </div>
            ) : (
              <div className="util-flex-col" style={{ justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: '0.75rem', textAlign: 'center', gap: '8px' }}>
                <Shield size={32} style={{ color: 'var(--text-muted)', marginBottom: '4px' }} />
                <span style={{ fontWeight: 700, color: '#fff' }}>NO INCIDENT FOCUS</span>
                Select a card in the queue to coordinate field volunteer routing and auto-triage.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
