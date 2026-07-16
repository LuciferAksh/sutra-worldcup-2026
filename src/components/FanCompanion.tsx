import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Volume2, VolumeX, Globe, Compass, Bus, Award, Leaf } from 'lucide-react';
import { sendQueryToSutraAgent, startVoiceRecognition } from '../services/sutraEngine';
import type { ChatMessage } from '../services/sutraEngine';
import { MAP_FEATURES } from './StadiumMap';
import type { MapFeature } from './StadiumMap';

interface FanCompanionProps {
  onRouteSelect: (start: string, end: string) => void;
  selectedFeature: MapFeature | null;
  accessibilityOnly: boolean;
  setAccessibilityOnly: (active: boolean) => void;
}

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
  const recognitionRef = useRef<any>(null);
  
  // Navigation State
  const [startPoint, setStartPoint] = useState('gate-a');
  const [endPoint, setEndPoint] = useState('sec-102');
  
  // Eco-Score state
  const [ecoPoints, setEcoPoints] = useState(150);
  const [ecoActionsLogged, setEcoActionsLogged] = useState<string[]>(['Used electric bus shuttle (+50 pts)']);
  const [ecoUnlocked, setEcoUnlocked] = useState(false);
  
  // Language State
  const [language, setLanguage] = useState<'EN' | 'ES' | 'FR'>('EN');

  const chatContainerRef = useRef<HTMLDivElement>(null);

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
  }, [startPoint, endPoint]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    const botReply = await sendQueryToSutraAgent(text, [...messages, userMsg], 'fan', ttsEnabled);
    
    setIsTyping(false);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: botReply,
      timestamp: new Date()
    }]);
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
    setTimeout(() => setEcoUnlocked(false), 2000);
  };

  const translations = {
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
  };

  const currentDict = translations[language];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Upper Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
        
        {/* Navigation Selector Card */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Compass size={14} style={{ color: 'var(--neon-cyan)' }} />
              {currentDict.nav}
            </h4>
            
            <button 
              onClick={() => setAccessibilityOnly(!accessibilityOnly)}
              style={{
                background: accessibilityOnly ? 'rgba(0, 255, 170, 0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${accessibilityOnly ? 'var(--fifa-green)' : 'var(--border-muted)'}`,
                color: accessibilityOnly ? 'var(--fifa-green)' : 'var(--text-secondary)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.65rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
            >
              ♿ ACCESSIBLE
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Start Gate Chip Selector */}
            <div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
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
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
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
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', overflow: 'hidden' }}>
          
          <AnimatePresence>
            {ecoUnlocked && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 255, 170, 0.12)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5, pointerEvents: 'none' }}
              >
                <div style={{ color: 'var(--fifa-green)', fontWeight: 900, fontSize: '1.1rem', fontFamily: 'Outfit', letterSpacing: '0.5px' }}>
                  🌳 COMMUTE LOGGED!
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Leaf size={14} style={{ color: 'var(--fifa-green)' }} />
              {currentDict.eco}
            </h4>
            <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>
              <Award size={10} />
              {ecoPoints >= 300 ? 'CHAMPION' : ecoPoints >= 200 ? 'ELITE' : 'NOVICE'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="50" height="50" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--fifa-green)" strokeWidth="3" strokeDasharray={`${Math.min(ecoPoints / 4, 100)}, 100`} strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', fontSize: '0.9rem', fontWeight: 900, fontFamily: 'Outfit' }}>{ecoPoints}</div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Unlock zero-waste tickets:</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handleLogEcoAction('Water Refill', 25)} className="selector-chip active-green" style={{ padding: '4px 8px', fontSize: '0.65rem' }}>+ REFILL</button>
                <button onClick={() => handleLogEcoAction('Recycled Cup', 30)} className="selector-chip active-green" style={{ padding: '4px 8px', fontSize: '0.65rem' }}>+ SORT</button>
              </div>
              {/* Logged List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px', fontSize: '0.6rem', color: 'var(--fifa-green)', fontWeight: 700 }}>
                {ecoActionsLogged.map((act, i) => <div key={i}>{act}</div>)}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Main AI Chat Concierge Box */}
      <div className="glass-panel" style={{ flex: 1, minHeight: '340px', display: 'flex', flexDirection: 'column', padding: '20px', gap: '14px' }}>
        
        {/* Chat Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="live-pulse"></span>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 900, fontFamily: 'Outfit', letterSpacing: '0.5px' }}>{currentDict.concierge}</h4>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* TTS Button */}
            <button 
              onClick={() => setTtsEnabled(!ttsEnabled)}
              style={{ background: 'none', border: 'none', color: ttsEnabled ? 'var(--neon-cyan)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title="Toggle Text-To-Speech Output"
            >
              {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.02)', padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--border-muted)' }}>
              <Globe size={12} style={{ color: 'var(--neon-cyan)' }} />
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as any)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '0.7rem', outline: 'none', cursor: 'pointer', fontWeight: 800 }}
              >
                <option value="EN" style={{ background: 'var(--bg-primary)' }}>EN</option>
                <option value="ES" style={{ background: 'var(--bg-primary)' }}>ES</option>
                <option value="FR" style={{ background: 'var(--bg-primary)' }}>FR</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages Log */}
        <div ref={chatContainerRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', paddingRight: '4px' }}>
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={index} 
                style={{ 
                  display: 'flex', 
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                {!isUser && (
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--neon-cyan) 0%, var(--fifa-green) 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem', fontWeight: 900, color: '#030712', flexShrink: 0, boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)' }}>
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
              </div>
            );
          })}
          
          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--neon-cyan) 0%, var(--fifa-green) 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem', fontWeight: 900, color: '#030712' }}>
                S
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-muted)', borderRadius: '16px', padding: '12px 20px', display: 'flex', gap: '4px' }}>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input Controls Bar */}
        <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '14px' }}>
          
          {voiceSupport && (
            <div className="mic-wave-container">
              {isListening && <div className="mic-wave"></div>}
              <button 
                onClick={toggleVoice}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  border: `1px solid ${isListening ? 'var(--alarm-crimson)' : 'var(--border-muted)'}`,
                  background: isListening ? 'rgba(255, 26, 83, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  color: isListening ? 'var(--alarm-crimson)' : '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            </div>
          )}

          <input 
            type="text" 
            placeholder={isListening ? "Voice capture active..." : "Ask SUTRA details..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage(inputValue);
              }
            }}
            disabled={isListening}
            style={{
              flex: 1,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-muted)',
              borderRadius: '10px',
              padding: '12px 16px',
              color: '#fff',
              outline: 'none',
              fontSize: '0.8rem',
              transition: 'border 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = 'rgba(0, 240, 255, 0.3)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-muted)'}
          />

          <button 
            onClick={() => handleSendMessage(inputValue)}
            style={{
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
            }}
          >
            <Send size={16} />
          </button>

        </div>

      </div>

      {/* Transit Loop Hub Radar */}
      <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Bus size={14} style={{ color: 'var(--neon-cyan)' }} />
          {currentDict.transit}
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
          
          {/* Shuttle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-muted)' }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-muted)' }}>
            <div>
              <div style={{ fontWeight: 800, color: '#fff' }}>🚇 {currentDict.metro}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.68rem', marginTop: '2px' }}>Century Station ➡️ Hub North (Gate A)</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--neon-cyan)', fontWeight: 800 }}>ARRIVING IN 3 MINS</div>
              <span className="badge badge-amber" style={{ fontSize: '0.55rem', padding: '2px 6px', marginTop: '3px' }}>HEAVY LOAD</span>
            </div>
          </div>

          {/* Biking */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-muted)' }}>
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
