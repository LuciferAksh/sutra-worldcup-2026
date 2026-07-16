import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export interface MapFeature {
  id: string;
  name: string;
  type: 'gate' | 'concession' | 'restroom' | 'sensory' | 'medical' | 'section';
  x: number;
  y: number;
  details?: string;
}

export interface IncidentMarker {
  id: string;
  title: string;
  category: 'cleaning' | 'security' | 'medical' | 'technical';
  x: number;
  y: number;
  status: 'pending' | 'dispatched' | 'resolved';
}

interface StadiumMapProps {
  mode: 'heatmap' | 'wayfinding' | 'incidents';
  selectedFeatureId: string | null;
  onSelectFeature: (feature: MapFeature | null) => void;
  incidents: IncidentMarker[];
  onSelectIncident?: (incident: IncidentMarker) => void;
  accessibilityOnly: boolean;
  waypointStart: string;
  waypointEnd: string;
}

export const MAP_FEATURES: MapFeature[] = [
  { id: 'gate-a', name: 'Gate A (North Entrance)', type: 'gate', x: 300, y: 70, details: 'Main North Gate, closest to Metro red line & Bike Lockers.' },
  { id: 'gate-b', name: 'Gate B (East Entrance)', type: 'gate', x: 530, y: 300, details: 'Main East Gate, close to VIP drops & Transit express loop.' },
  { id: 'gate-c', name: 'Gate C (South Entrance)', type: 'gate', x: 300, y: 530, details: 'Main South Gate, adjacent to Lot Silver & Ride-share zones.' },
  { id: 'gate-d', name: 'Gate D (West Entrance)', type: 'gate', x: 70, y: 300, details: 'Main West Gate, designated Accessible entrance with lift access.' },
  
  { id: 'sec-102', name: 'Section 102 (Wheelchair Row)', type: 'section', x: 190, y: 170, details: 'Wheelchair-friendly lower bowl section. Fully equipped.' },
  { id: 'sec-112', name: 'Section 112 (Lower East)', type: 'section', x: 410, y: 430, details: 'Lower tier section, adjacent to Eco concession Verde Bites.' },
  { id: 'sec-118', name: 'Section 118 (North-West)', type: 'section', x: 190, y: 430, details: 'Lower tier seating block. Close to sensory-friendly room.' },
  { id: 'sec-204', name: 'Section 204 (Upper West)', type: 'section', x: 140, y: 240, details: 'Upper deck sector. Accessible via West Elevators.' },
  
  { id: 'sensory-room', name: 'Sensory Quiet Room', type: 'sensory', x: 150, y: 450, details: 'Soundproof zone. Sensory bags & noise-canceling headphones free checkout.' },
  { id: 'first-aid-a', name: 'First Aid Station A', type: 'medical', x: 260, y: 110, details: 'Emergency medical unit. Active paramedics, oxygen, ALDs.' },
  { id: 'first-aid-c', name: 'First Aid Station C', type: 'medical', x: 340, y: 490, details: 'Trauma support station. Ambulance bay access.' },
  
  { id: 'vegan-bites', name: 'Verde Bites (Vegan Concession)', type: 'concession', x: 440, y: 380, details: 'Eco-certified concession. Falafel, plant burgers, water refills.' },
  { id: 'restroom-family', name: 'Accessible Restroom D', type: 'restroom', x: 120, y: 340, details: 'Spacious all-gender family restroom. Diaper sorting bins.' }
];

export const StadiumMap: React.FC<StadiumMapProps> = ({
  mode,
  selectedFeatureId,
  onSelectFeature,
  incidents,
  onSelectIncident,
  accessibilityOnly,
  waypointStart,
  waypointEnd
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredFeature, setHoveredFeature] = useState<MapFeature | null>(null);

  // High-fidelity sector shapes
  const SECTOR_SECTIONS = [
    { id: 'sec-north', path: 'M 190 70 A 230 230 0 0 1 410 70 L 370 140 A 150 150 0 0 0 230 140 Z', color: 'rgba(255, 26, 83, 0.4)', stroke: 'var(--alarm-crimson)', density: 'High (89%)', name: 'North Stand (Sector Alpha)' },
    { id: 'sec-east', path: 'M 410 70 A 230 230 0 0 1 530 300 A 230 230 0 0 1 410 530 L 370 460 A 150 150 0 0 0 450 300 A 150 150 0 0 0 370 140 Z', color: 'rgba(255, 170, 0, 0.4)', stroke: 'var(--warning-amber)', density: 'Moderate (65%)', name: 'East Stand (Sector Beta)' },
    { id: 'sec-south', path: 'M 410 530 A 230 230 0 0 1 190 530 L 230 460 A 150 150 0 0 0 370 460 Z', color: 'rgba(0, 255, 170, 0.4)', stroke: 'var(--fifa-green)', density: 'Low (32%)', name: 'South Stand (Sector Gamma)' },
    { id: 'sec-west', path: 'M 190 530 A 230 230 0 0 1 70 300 A 230 230 0 0 1 190 70 L 230 140 A 150 150 0 0 0 150 300 A 150 150 0 0 0 230 460 Z', color: 'rgba(255, 170, 0, 0.4)', stroke: 'var(--warning-amber)', density: 'Moderate (58%)', name: 'West Stand (Sector Delta)' }
  ];

  const getWaypointCoords = (id: string) => {
    const feature = MAP_FEATURES.find(f => f.id === id);
    return feature ? { x: feature.x, y: feature.y } : null;
  };

  const getWayfindingPath = () => {
    const start = getWaypointCoords(waypointStart);
    const end = getWaypointCoords(waypointEnd);
    if (!start || !end) return '';

    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    if (accessibilityOnly) {
      // Divert route to West elevator (110, 330) or East elevator (490, 270)
      let elevatorX = 110;
      let elevatorY = 330;
      
      if (start.x > 300 || end.x > 300) {
        elevatorX = 490;
        elevatorY = 270;
      }
      
      return `M ${start.x} ${start.y} L ${elevatorX} ${elevatorY} L ${end.x} ${end.y}`;
    }

    // Direct path curve
    return `M ${start.x} ${start.y} Q ${midX + 30} ${midY - 30} ${end.x} ${end.y}`;
  };

  const pathString = getWayfindingPath();

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom(prev => (direction === 'in' ? Math.min(prev + 0.25, 2.5) : Math.max(prev - 0.25, 1)));
  };

  const resetMap = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Drag and Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom === 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className="glass-panel glass-panel-glow-cyan" 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        overflow: 'hidden', 
        padding: '20px', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: '24px'
      }}
    >
      
      {/* Map Header Control */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', zIndex: 10 }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'Outfit', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} style={{ color: 'var(--neon-cyan)' }} />
            STADIUM VIRTUAL CORE
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {mode === 'heatmap' && '🔥 PREDICTIVE CROWD HEAT MAP'}
            {mode === 'wayfinding' && '📍 NEON WAYFINDING NAVIGATOR'}
            {mode === 'incidents' && '🚨 OPERATIONS DISPATCH COMMAND'}
          </span>
        </div>
        
        {/* Controls Bar */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" style={{ padding: '8px' }} onClick={() => handleZoom('in')} title="Zoom In">
            <ZoomIn size={14} />
          </button>
          <button className="btn-secondary" style={{ padding: '8px' }} onClick={() => handleZoom('out')} title="Zoom Out">
            <ZoomOut size={14} />
          </button>
          <button className="btn-secondary" style={{ padding: '8px' }} onClick={resetMap} title="Recenter Blueprint">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* SVG Canvas Map Container */}
      <div 
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ 
          flex: 1, 
          position: 'relative', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: '#05070e', 
          borderRadius: '16px', 
          overflow: 'hidden', 
          border: '1px solid rgba(255, 255, 255, 0.03)',
          cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
      >
        
        <svg 
          viewBox="0 0 600 600" 
          style={{ 
            width: '100%', 
            height: '100%', 
            maxHeight: '500px',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, 
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Gradients Defs */}
          <defs>
            <radialGradient id="stadium-radial" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#141a2e" />
              <stop offset="100%" stopColor="#080c16" />
            </radialGradient>

            <linearGradient id="pitch-turf" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0c2c1a" />
              <stop offset="50%" stopColor="#061d10" />
              <stop offset="100%" stopColor="#031109" />
            </linearGradient>
            
            <linearGradient id="route-cyan-green" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--neon-cyan)" />
              <stop offset="100%" stopColor="var(--fifa-green)" />
            </linearGradient>

            {/* Glowing Effects */}
            <filter id="neon-glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <filter id="neon-glow-red" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* STADIUM CONTAINER BACKGROUND */}
          <circle cx="300" cy="300" r="275" fill="url(#stadium-radial)" stroke="rgba(0, 240, 255, 0.05)" strokeWidth="4" />
          
          {/* OUTER STADIUM WALLS */}
          <circle cx="300" cy="300" r="255" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
          <circle cx="300" cy="300" r="240" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="12" />

          {/* DYNAMIC HEATMAP OVERLAYS */}
          <AnimatePresence>
            {mode === 'heatmap' && (
              <g>
                {SECTOR_SECTIONS.map((sector) => (
                  <motion.path
                    key={sector.id}
                    d={sector.path}
                    fill={sector.color}
                    stroke={sector.stroke}
                    strokeWidth="1.5"
                    className="heatmap-pulse"
                    initial={{ fillOpacity: 0, strokeOpacity: 0 }}
                    animate={{ fillOpacity: 0.3, strokeOpacity: 0.8 }}
                    exit={{ fillOpacity: 0, strokeOpacity: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelectFeature({
                      id: sector.id,
                      name: sector.name,
                      type: 'section',
                      x: 300,
                      y: 300,
                      details: `Smart sensor analysis reports crowd loading at ${sector.density}. Consider routing to alternate sectors.`
                    })}
                  />
                ))}
              </g>
            )}
          </AnimatePresence>

          {/* UPPER SEATING TIER RING */}
          <circle cx="300" cy="300" r="210" fill="none" stroke="rgba(12, 18, 34, 0.9)" strokeWidth="24" />
          <circle cx="300" cy="300" r="210" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="22" strokeDasharray="6, 6" />

          {/* LOWER SEATING TIER RING */}
          <circle cx="300" cy="300" r="160" fill="none" stroke="rgba(8, 12, 22, 0.95)" strokeWidth="28" />
          <circle cx="300" cy="300" r="160" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="26" strokeDasharray="4, 4" />

          {/* FIELD/PITCH DESIGN */}
          <g transform="rotate(-15, 300, 300)" opacity="0.85">
            {/* Grass Pitch */}
            <rect x="225" y="205" width="150" height="190" rx="6" fill="url(#pitch-turf)" stroke="rgba(0, 255, 170, 0.15)" strokeWidth="3" />
            
            {/* Center Circle */}
            <circle cx="300" cy="300" r="28" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5" />
            <circle cx="300" cy="300" r="2" fill="rgba(255, 255, 255, 0.5)" />
            
            {/* Half line */}
            <line x1="225" y1="300" x2="375" y2="300" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5" />
            
            {/* Penalty boxes */}
            <rect x="255" y="205" width="90" height="30" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5" />
            <rect x="255" y="365" width="90" height="30" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5" />
          </g>

          {/* DYNAMIC WAYFINDING NEON PATH */}
          {mode === 'wayfinding' && pathString && (
            <g filter="url(#neon-glow-cyan)">
              {/* Outer Thick Neon Backer */}
              <path
                d={pathString}
                fill="none"
                stroke={accessibilityOnly ? 'var(--fifa-green)' : 'var(--neon-cyan)'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.3"
              />
              
              {/* Animated Path Core */}
              <motion.path
                d={pathString}
                fill="none"
                stroke={accessibilityOnly ? 'var(--fifa-green)' : 'url(#route-cyan-green)'}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="8, 12"
                animate={{ strokeDashoffset: [-120, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
              />
            </g>
          )}

          {/* MAP FEATURES & PIN MARKERS */}
          {MAP_FEATURES.map((feature) => {
            const isSelected = selectedFeatureId === feature.id;
            const isWaypoint = waypointStart === feature.id || waypointEnd === feature.id;
            
            let color = 'rgba(255,255,255,0.4)';
            let glow = 'none';
            
            if (feature.type === 'gate') {
              color = 'var(--neon-cyan)';
              glow = 'url(#neon-glow-cyan)';
            } else if (feature.type === 'sensory') {
              color = 'var(--royal-purple)';
            } else if (feature.type === 'medical') {
              color = 'var(--alarm-crimson)';
              glow = 'url(#neon-glow-red)';
            } else if (feature.type === 'concession') {
              color = 'var(--fifa-green)';
            } else if (feature.type === 'restroom') {
              color = 'var(--warning-amber)';
            }

            return (
              <g 
                key={feature.id} 
                transform={`translate(${feature.x}, ${feature.y})`}
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectFeature(feature)}
                onMouseEnter={() => setHoveredFeature(feature)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                {/* Visual pulse rings on select or path waypoints */}
                {(isSelected || (mode === 'wayfinding' && isWaypoint)) && (
                  <circle cx="0" cy="0" r="16" fill="none" stroke={color} strokeWidth="1.5" className="map-pulse" />
                )}
                
                {/* Pin core shadow */}
                <circle cx="0" cy="0" r={isSelected ? 10 : 7} fill="rgba(0,0,0,0.6)" />

                {/* Primary colored marker circle */}
                <circle 
                  cx="0" 
                  cy="0" 
                  r={isSelected ? 6 : 4} 
                  fill={color} 
                  stroke="#05070e" 
                  strokeWidth="1.5" 
                  filter={isSelected ? glow : 'none'}
                  style={{ transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
                />

                {/* Custom Gate graphics */}
                {feature.type === 'gate' && (
                  <rect x="-8" y="-8" width="16" height="16" rx="4" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
                )}

                {/* Label text */}
                {(feature.type === 'gate' || isSelected) && (
                  <text 
                    y="-16" 
                    textAnchor="middle" 
                    fill="#fff" 
                    fontSize={isSelected ? "11px" : "9px"}
                    fontWeight="900"
                    letterSpacing="0.5px"
                    style={{ textShadow: '0 3px 6px rgba(0,0,0,0.9)', fontFamily: 'Outfit' }}
                  >
                    {feature.type === 'gate' ? feature.name.split(' (')[0].toUpperCase() : feature.name.toUpperCase()}
                  </text>
                )}
              </g>
            );
          })}

          {/* STAFF INCIDENTS COMMAND PINS */}
          <AnimatePresence>
            {mode === 'incidents' && incidents.map((incident) => {
              if (incident.status === 'resolved') return null;
              
              const isPending = incident.status === 'pending';
              const color = isPending ? 'var(--alarm-crimson)' : 'var(--warning-amber)';
              
              return (
                <g 
                  key={incident.id} 
                  transform={`translate(${incident.x}, ${incident.y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectIncident?.(incident)}
                >
                  {/* Outer flashing hazard circle */}
                  <circle cx="0" cy="0" r="20" fill="none" stroke={color} strokeWidth="2" className="map-pulse" />
                  
                  {/* Drop Shadow */}
                  <path 
                    d="M 0 -11 L 11 0 L 0 11 L -11 0 Z" 
                    fill="rgba(0,0,0,0.8)" 
                  />

                  {/* Diamond pin */}
                  <path 
                    d="M 0 -10 L 10 0 L 0 10 L -10 0 Z" 
                    fill={color} 
                    stroke="#05070e" 
                    strokeWidth="1.5" 
                    filter="url(#neon-glow-red)"
                  />
                  
                  {/* Danger icon exclamation */}
                  <text 
                    y="3" 
                    textAnchor="middle" 
                    fill="#05070e" 
                    fontSize="10px" 
                    fontWeight="900"
                  >
                    !
                  </text>
                  
                  {/* Incident Label */}
                  <text 
                    y="-16" 
                    textAnchor="middle" 
                    fill={color} 
                    fontSize="9px" 
                    fontWeight="900"
                    letterSpacing="0.5px"
                    style={{ textShadow: '0 3px 6px rgba(0,0,0,0.9)', fontFamily: 'Outfit' }}
                  >
                    ALERT
                  </text>
                </g>
              );
            })}
          </AnimatePresence>
          
        </svg>

        {/* Floating Mini Hover Tooltip */}
        <AnimatePresence>
          {hoveredFeature && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                right: '16px',
                padding: '12px 16px',
                background: 'rgba(12, 18, 34, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 240, 255, 0.15)',
                borderRadius: '12px',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                zIndex: 10,
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 
                  hoveredFeature.type === 'gate' ? 'var(--neon-cyan)' :
                  hoveredFeature.type === 'sensory' ? 'var(--royal-purple)' :
                  hoveredFeature.type === 'medical' ? 'var(--alarm-crimson)' :
                  hoveredFeature.type === 'concession' ? 'var(--fifa-green)' : 'var(--warning-amber)',
                boxShadow: '0 0 10px currentColor'
              }} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>
                  {hoveredFeature.name.toUpperCase()}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {hoveredFeature.details}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
      
      {/* Map Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '16px', padding: '10px 8px 0 8px', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: '0.75rem', color: 'var(--text-secondary)', justifyContent: 'center', fontWeight: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--neon-cyan)', boxShadow: '0 0 8px var(--neon-cyan-glow)' }} />
          GATEWAYS
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--fifa-green)', boxShadow: '0 0 8px var(--fifa-green-glow)' }} />
          ECO EATS
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--royal-purple)', boxShadow: '0 0 8px var(--royal-purple-glow)' }} />
          SENSORY COMFORT
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--alarm-crimson)', boxShadow: '0 0 8px var(--alarm-crimson-glow)' }} />
          FIRST AID
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning-amber)', boxShadow: '0 0 8px var(--warning-amber-glow)' }} />
          ACCESSIBLE WC
        </div>
      </div>
      
    </div>
  );
};
