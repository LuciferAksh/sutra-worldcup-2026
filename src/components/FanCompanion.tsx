import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Volume2, VolumeX, Globe, Compass, Bus, Award, Leaf } from 'lucide-react';
import { sendQueryToSutraAgent, startVoiceRecognition } from '../services/sutraEngine';
import type { ChatMessage, SpeechRecognitionInstance } from '../services/sutraEngine';
import { MAP_FEATURES } from './StadiumMap';
import type { MapFeature } from './StadiumMap';

interface FanCompanionProps {
  onRouteSelect: (start: string, end: string) => void;
  selectedFeature: MapFeature | null;
  accessibilityOnly: boolean;
  setAccessibilityOnly: (active: boolean) => void;
}

const TRANSLATIONS = {
  EN: {
    concierge: 'SUTRA CORE CONCIERGE',
    nav: 'WAYFINDING GATEWAYS',
    transit: 'LIVE TRANSIT RADAR',
    eco: 'ECO-SCORE CAMPAIGN',
    start: 'START POINT',
    end: 'DESTINATION',
    offset: 'Offset Carbon',
    shuttle: 'Electric Shuttle Loops',
    metro: 'Century Metrolink red',
    biking: 'Zero-Emission Bike Valet'
  },
  ES: {
    concierge: 'CONSERJE CORE SUTRA',
    nav: 'ACCESOS DE NAVEGACIÓN',
    transit: 'RADAR DE TRÁNSITO EN VIVO',
    eco: 'CAMPAÑA DE ECO-PUNTOS',
    start: 'PUNTO DE PARTIDA',
    end: 'DESTINO',
    offset: 'Compensar Carbono',
    shuttle: 'Lanzaderas Eléctricas',
    metro: 'Metro de la Ciudad roja',
    biking: 'Estación de Bici Ecológica'
  },
  FR: {
    concierge: 'CONCIERGE CORE SUTRA',
    nav: 'PORTAILS DE NAVIGATION',
    transit: 'RADAR TRANSPORT EN DIRECT',
    eco: 'CAMPAGNE DE SCORE ÉCO',
    start: 'POINT DE DÉPART',
    end: 'DESTINATION',
    offset: 'Compenser Carbone',
    shuttle: 'Navettes Électriques',
    metro: 'Métro de la Ville rouge',
    biking: 'Véloparc Zéro-Émission'
  }
} as const;

const ACCESSIBLE_BTN_STYLE = {
  borderRadius: '6px',
  padding: '4px 10px',
  fontSize: '0.65rem',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  transition: 'all 0.2s'
} as const;

const INPUT_STYLE = {
  width: '42px',
  padding: '4px',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-muted)',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '0.68rem',
  outline: 'none'
} as const;

const INPUT_FLEX_STYLE = {
  flex: 1,
  padding: '4px',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-muted)',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '0.68rem',
  outline: 'none'
} as const;

const TTS_BTN_STYLE = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center'
} as const;

const GLOBE_CONTAINER_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  background: 'rgba(255,255,255,0.02)',
  padding: '2px 8px',
  borderRadius: '6px',
  border: '1px solid var(--border-muted)'
} as const;

const SELECT_LANG_STYLE = {
  background: 'none',
  border: 'none',
  color: '#fff',
  fontSize: '0.7rem',
  outline: 'none',
  cursor: 'pointer',
  fontWeight: 800
} as const;

const ECO_OVERLAY_STYLE = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 255, 170, 0.12)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 5,
  pointerEvents: 'none'
} as const;

const S_AVATAR_STYLE = {
  width: '30px',
  height: '30px',
  borderRadius: '8px',
  background: 'linear-gradient(135deg, var(--neon-cyan) 0%, var(--fifa-green) 100%)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '0.75rem',
  fontWeight: 900,
  color: '#030712',
  flexShrink: 0,
  boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)'
} as const;

const LISTEN_BTN_STYLE = {
  width: '42px',
  height: '42px',
  borderRadius: '10px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
  position: 'relative',
  zIndex: 2
} as const;

const CHAT_INPUT_STYLE = {
  flex: 1,
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-muted)',
  borderRadius: '10px',
  padding: '12px 16px',
  color: '#fff',
  outline: 'none',
  fontSize: '0.8rem',
  transition: 'border 0.2s'
} as const;

const SEND_BTN_STYLE = {
  width: '42px',
  height: '42px',
  borderRadius: '10px',
  border: 'none',
  background: 'var(--neon-cyan-gradient)',
  color: '#030712',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 15px var(--neon-cyan-glow)'
} as const;

export const FanCompanion: React.FC<FanCompanionProps> = ({
  onRouteSelect,
  selectedFeature,
  accessibilityOnly,
  setAccessibilityOnly
}) => {
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "👋 Welcome to SUTRA! I am your Stadium Unified Tournament Response Assistant.\n\nAsk me anything about Gate entry, vegan food, transport schedules, accessibility lifts, or sensory rooms!", timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Voice & TTS State
  const [isListening, setIsListening] = useState(false);
  const [voiceSupport, setVoiceSupport] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  
  // Navigation State
  const [startPoint, setStartPoint] = useState('gate-a');
  const [endPoint, setEndPoint] = useState('sec-102');
  
  // Eco-Score state
  const [ecoPoints, setEcoPoints] = useState(150);
  const [ecoActionsLogged, setEcoActionsLogged] = useState<string[]>(['Used electric bus shuttle (+50 pts)']);
  const [ecoUnlocked, setEcoUnlocked] = useState(false);
  const [calcDistance, setCalcDistance] = useState<string>('15');
  const [calcMode, setCalcMode] = useState<'train' | 'bus' | 'carpool'>('train');
  
  // Language State
  const [language, setLanguage] = useState<'EN' | 'ES' | 'FR'>('EN');

  // Timer reference to avoid memory leaks
  const ecoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic Transit ETA Countdown Timer
  const [shuttleEta, setShuttleEta] = useState(180); // 3 minutes in seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setShuttleEta(prev => (prev <= 0 ? 180 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Sync selected feature from map clicking
  useEffect(() => {
    if (selectedFeature) {
      if (selectedFeature.type === 'gate') {
        setStartPoint(selectedFeature.id);
      } else {
        setEndPoint(selectedFeature.id);
      }
      
      const systemMsg: ChatMessage = {
        role: 'assistant',
        content: `📍 **Map Element Selected**: ${selectedFeature.name}\n\n*${selectedFeature.details}*\n\nI have locked this into your navigation waypoints. Use the route navigator below to calculate paths.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMsg]);
    }
  }, [selectedFeature]);

  // Trigger routing calculation
  useEffect(() => {
    onRouteSelect(startPoint, endPoint);
  }, [startPoint, endPoint, onRouteSelect]);

  // Active unmount cleanups for Speech Recognition and Eco Toast Ref
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (ecoTimeoutRef.current) {
        clearTimeout(ecoTimeoutRef.current);
      }
    };
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg].slice(-20));
    setInputValue('');
    setIsTyping(true);

    const botReply = await sendQueryToSutraAgent(text, [...messages, userMsg], 'fan', ttsEnabled);
    
    setIsTyping(false);
    setMessages(prev => [...prev, {
      role: 'assistant' as const,
      content: botReply,
      timestamp: new Date()
    }].slice(-20));
  };

  // Toggle voice recognition
  const toggleVoice = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      setIsListening(true);
      const rec = startVoiceRecognition(
        (transcript) => {
          handleSendMessage(transcript);
        },
        () => {
          setIsListening(false);
        },
        (error) => {
          console.warn("STT Error:", error);
          setVoiceSupport(false);
          setIsListening(false);
        }
      );
      if (rec) {
        recognitionRef.current = rec;
      }
    }
  };

  // Log Eco Actions
  const handleLogEcoAction = (action: string, points: number) => {
    setEcoPoints(prev => prev + points);
    setEcoActionsLogged(prev => [`Logged: ${action} (+${points} pts)`, ...prev].slice(0, 2));
    setEcoUnlocked(true);
    
    if (ecoTimeoutRef.current) {
      clearTimeout(ecoTimeoutRef.current);
    }
    ecoTimeoutRef.current = setTimeout(() => {
      setEcoUnlocked(false);
    }, 2000);
  };

  const handleCalculateOffset = () => {
    const dist = parseFloat(calcDistance) || 0;
    if (dist <= 0) return;
    let factor = 0.1;
    if (calcMode === 'bus') factor = 0.08;
    if (calcMode === 'carpool') factor = 0.12;
    const co2Saved = Math.round(dist * factor * 10) / 10;
    handleLogEcoAction(`Offset ${co2Saved}kg CO2 via ${calcMode.toUpperCase()}`, Math.max(10, Math.round(co2Saved * 10)));
  };

  const currentDict = TRANSLATIONS[language];

  return (
    <div className="util-flex-col-gap-xl">
      
      {/* Upper Grid Layout */}
      <div className="util-grid-1-2-to-1">
        
        {/* Navigation Selector Card */}
        <div className="glass-panel util-flex-col-gap-sm" style={{ padding: '18px' }}>
          <div className="util-flex-between">
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: '0.5px' }} className="util-flex-align-center-gap-sm">
              <Compass size={14} style={{ color: 'var(--neon-cyan)' }} />
              {currentDict.nav}
            </h4>
            
            <button 
              onClick={() => setAccessibilityOnly(!accessibilityOnly)}
              style={{
                ...ACCESSIBLE_BTN_STYLE,
                background: accessibilityOnly ? 'rgba(0, 255, 170, 0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${accessibilityOnly ? 'var(--fifa-green)' : 'var(--border-muted)'}`,
                color: accessibilityOnly ? 'var(--fifa-green)' : 'var(--text-secondary)'
              }}
            >
              ♿ ACCESSIBLE
            </button>
          </div>
          
          <div className="util-flex-col-gap-md">
            {/* Start Gate Chip Selector */}
            <div>
              <span className="util-text-secondary util-text-xs" style={{ display: 'block', marginBottom: '6px', fontWeight: 700 }}>
                {currentDict.start}
              </span>
              <div className="custom-selector-grid">
                {MAP_FEATURES.filter(f => f.type === 'gate').map(f => (
                  <button 
                    key={f.id}
                    onClick={() => setStartPoint(f.id)}
                    className={`selector-chip ${startPoint === f.id ? 'active-cyan' : ''}`}
                  >
                    📍 {f.name.split(' (')[0].replace('Gate ', 'GATE ')}
                  </button>
                ))}
              </div>
            </div>
            
            {/* End Point Chip Selector */}
            <div>
              <span className="util-text-secondary util-text-xs" style={{ display: 'block', marginBottom: '6px', fontWeight: 700 }}>
                {currentDict.end}
              </span>
              <div className="custom-selector-grid">
                {MAP_FEATURES.filter(f => f.type !== 'gate').slice(0, 4).map(f => (
                  <button 
                    key={f.id}
                    onClick={() => setEndPoint(f.id)}
                    className={`selector-chip ${endPoint === f.id ? 'active-purple' : ''}`}
                  >
                    🎯 {f.name.split(' (')[0].replace('Section ', 'SEC ').substring(0, 10)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Eco Score Gamification Card */}
        <div className="glass-panel util-flex-col-gap-sm" style={{ padding: '18px', position: 'relative', overflow: 'hidden' }}>
          
          <AnimatePresence>
            {ecoUnlocked && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={ECO_OVERLAY_STYLE}
              >
                <div style={{ color: 'var(--fifa-green)', fontWeight: 900, fontSize: '1.1rem', fontFamily: 'Outfit', letterSpacing: '0.5px' }}>
                  🌳 COMMUTE LOGGED!
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="util-flex-between">
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: '0.5px' }} className="util-flex-align-center-gap-sm">
              <Leaf size={14} style={{ color: 'var(--fifa-green)' }} />
              {currentDict.eco}
            </h4>
            <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>
              <Award size={10} />
              {ecoPoints >= 300 ? 'CHAMPION' : ecoPoints >= 200 ? 'ELITE' : 'NOVICE'}
            </span>
          </div>

          <div className="util-flex-align-center-gap-md util-flex-1">
            <div className="util-flex-align-center" style={{ position: 'relative', justifyContent: 'center' }}>
              <svg width="50" height="50" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--fifa-green)" strokeWidth="3" strokeDasharray={`${Math.min(ecoPoints / 4, 100)}, 100`} strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', fontSize: '0.9rem', fontWeight: 900, fontFamily: 'Outfit' }}>{ecoPoints}</div>
            </div>
            <div className="util-flex-col-gap-xs util-flex-1">
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700 }}>CO2 TRAVEL OFFSET CALCULATOR:</div>
              <div className="util-flex-align-center-gap-xs">
                <input 
                  type="number" 
                  value={calcDistance} 
                  onChange={(e) => setCalcDistance(e.target.value)}
                  style={INPUT_STYLE}
                  placeholder="km"
                />
                <select
                  aria-label="Transport Mode Selection"
                  value={calcMode}
                  onChange={(e) => setCalcMode(e.target.value as 'train' | 'bus' | 'carpool')}
                  style={INPUT_FLEX_STYLE}
                >
                  <option value="train">🚇 Train (100g/km)</option>
                  <option value="bus">🚌 Bus (80g/km)</option>
                  <option value="carpool">🚗 Carpool (120g/km)</option>
                </select>
                <button 
                  onClick={handleCalculateOffset} 
                  className="selector-chip active-green" 
                  style={{ padding: '4px 8px', fontSize: '0.62rem', borderStyle: 'solid' }}
                >
                  LOG
                </button>
              </div>
              
              {/* Quick Actions */}
              <div className="util-flex-gap-xs" style={{ marginTop: '2px' }}>
                <button onClick={() => handleLogEcoAction('Water Refill', 25)} className="selector-chip active-green" style={{ padding: '3px 6px', fontSize: '0.6rem' }}>+ REFILL</button>
                <button onClick={() => handleLogEcoAction('Recycled Cup', 30)} className="selector-chip active-green" style={{ padding: '3px 6px', fontSize: '0.6rem' }}>+ SORT</button>
              </div>

              {/* Logged List */}
              <div className="util-flex-col" style={{ gap: '2px', marginTop: '2px', fontSize: '0.58rem', color: 'var(--fifa-green)', fontWeight: 700 }}>
                {ecoActionsLogged.map((act) => <div key={act}>{act}</div>)}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Main AI Chat Concierge Box */}
      <div className="glass-panel util-flex-col-gap-md util-flex-1" style={{ minHeight: '340px', padding: '20px' }}>
        
        {/* Chat Header */}
        <div className="util-flex-between util-border-bottom" style={{ paddingBottom: '12px' }}>
          <div className="util-flex-align-center-gap-sm">
            <span className="live-pulse"></span>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 900, fontFamily: 'Outfit', letterSpacing: '0.5px' }}>{currentDict.concierge}</h4>
          </div>
          
          <div className="util-flex-align-center-gap-md">
            {/* TTS Button */}
            <button 
              onClick={() => setTtsEnabled(!ttsEnabled)}
              style={{ ...TTS_BTN_STYLE, color: ttsEnabled ? 'var(--neon-cyan)' : 'var(--text-muted)' }}
              title="Toggle Text-To-Speech Output"
            >
              {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Language Selector */}
            <div style={GLOBE_CONTAINER_STYLE}>
              <Globe size={12} style={{ color: 'var(--neon-cyan)' }} />
              <select 
                aria-label="Language Selector"
                value={language} 
                onChange={(e) => setLanguage(e.target.value as 'EN' | 'ES' | 'FR')}
                style={SELECT_LANG_STYLE}
              >
                <option value="EN" style={{ background: 'var(--bg-primary)' }}>EN</option>
                <option value="ES" style={{ background: 'var(--bg-primary)' }}>ES</option>
                <option value="FR" style={{ background: 'var(--bg-primary)' }}>FR</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages Log */}
        <div ref={chatContainerRef} role="log" aria-live="polite" className="util-flex-col-gap-md util-flex-1" style={{ overflowY: 'auto', paddingRight: '4px' }}>
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div 
                key={msg.timestamp.getTime() + '-' + index} 
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="util-flex"
                style={{ 
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                {!isUser && (
                  <div style={S_AVATAR_STYLE}>
                    S
                  </div>
                )}
                <div 
                  style={{ 
                    maxWidth: '82%', 
                    padding: '12px 16px', 
                    borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: isUser ? 'rgba(0, 240, 255, 0.05)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isUser ? 'rgba(0, 240, 255, 0.15)' : 'var(--border-muted)'}`,
                    fontSize: '0.8rem',
                    lineHeight: '1.45',
                    color: '#f1f5f9',
                    whiteSpace: 'pre-wrap',
                    boxShadow: isUser ? '0 4px 12px rgba(0, 240, 255, 0.02)' : 'none'
                  }}
                >
                  {msg.content}
                </div>
              </motion.div>
            );
          })}
          
          {isTyping && (
            <div className="util-flex-align-center-gap-md">
              <div style={S_AVATAR_STYLE}>
                S
              </div>
              <div className="util-chat-user util-flex-align-center-gap-xs" style={{ padding: '12px 20px', borderRadius: '16px' }}>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input Controls Bar */}
        <div className="util-flex-gap-md" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '14px' }}>
          
          {voiceSupport && (
            <div className="mic-wave-container">
              {isListening && <div className="mic-wave"></div>}
              <button 
                onClick={toggleVoice}
                aria-label="Toggle voice input"
                style={{
                  ...LISTEN_BTN_STYLE,
                  border: `1px solid ${isListening ? 'var(--alarm-crimson)' : 'var(--border-muted)'}`,
                  background: isListening ? 'rgba(255, 26, 83, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  color: isListening ? 'var(--alarm-crimson)' : '#fff'
                }}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            </div>
          )}

          <input 
            type="text" 
            aria-label="Ask SUTRA details"
            placeholder={isListening ? "Voice capture active..." : "Ask SUTRA details..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage(inputValue);
              }
            }}
            disabled={isListening}
            style={CHAT_INPUT_STYLE}
          />

          <button 
            onClick={() => handleSendMessage(inputValue)}
            aria-label="Send message"
            style={SEND_BTN_STYLE}
          >
            <Send size={16} />
          </button>

        </div>

      </div>

      {/* Transit Loop Hub Radar */}
      <div className="glass-panel util-flex-col-gap-sm" style={{ padding: '18px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: '0.5px' }} className="util-flex-align-center-gap-sm">
          <Bus size={14} style={{ color: 'var(--neon-cyan)' }} />
          {currentDict.transit}
        </h4>

        <div className="util-flex-col util-text-xs" style={{ gap: '8px' }}>
          
          {/* Shuttle */}
          <div className="util-flex-between util-rounded-lg" style={{ background: 'rgba(255,255,255,0.01)', padding: '10px 14px', border: '1px solid var(--border-muted)' }}>
            <div>
              <div style={{ fontWeight: 800, color: '#fff' }}>⚡ {currentDict.shuttle}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.68rem', marginTop: '2px' }}>Terminal Loop ➡️ East Loop (Gate B)</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--fifa-green)', fontWeight: 800 }}>EVERY 4 MINS</div>
              <span className="badge badge-green" style={{ fontSize: '0.55rem', padding: '2px 6px', marginTop: '3px' }}>LOW LOAD</span>
            </div>
          </div>

          {/* Metro */}
          <div className="util-flex-between util-rounded-lg" style={{ background: 'rgba(255,255,255,0.01)', padding: '10px 14px', border: '1px solid var(--border-muted)' }}>
            <div>
              <div style={{ fontWeight: 800, color: '#fff' }}>🚇 {currentDict.metro}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.68rem', marginTop: '2px' }}>Century Station ➡️ Hub North (Gate A)</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--neon-cyan)', fontWeight: 800 }}>
                {shuttleEta > 0 ? `ARRIVING IN ${Math.floor(shuttleEta / 60)}m ${shuttleEta % 60}s` : 'ARRIVED'}
              </div>
              <span className="badge badge-amber" style={{ fontSize: '0.55rem', padding: '2px 6px', marginTop: '3px' }}>HEAVY LOAD</span>
            </div>
          </div>

          {/* Biking */}
          <div className="util-flex-between util-rounded-lg" style={{ background: 'rgba(255,255,255,0.01)', padding: '10px 14px', border: '1px solid var(--border-muted)' }}>
            <div>
              <div style={{ fontWeight: 800, color: '#fff' }}>🚲 {currentDict.biking}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.68rem', marginTop: '2px' }}>Secure lockers & check-in rewards at Gate A</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--fifa-green)', fontWeight: 800 }}>92 SPOTS FREE</div>
              <button 
                onClick={() => handleLogEcoAction('Biked to Match', 100)}
                className="selector-chip active-green"
                style={{ padding: '3px 8px', fontSize: '0.58rem', marginTop: '3px', borderStyle: 'dashed' }}
              >
                LOG BIKE
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
