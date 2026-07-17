// SUTRA AI Engine & RAG Database (Foundry IQ)

export interface RAGEntry {
  category: 'wayfinding' | 'transport' | 'accessibility' | 'sustainability' | 'ops';
  keywords: string[];
  title: string;
  content: string;
  details?: string[];
}

export const SUTRA_RAG_DATABASE: RAGEntry[] = [
  // Accessibility
  {
    category: 'accessibility',
    keywords: ['wheelchair', 'disabled', 'elevator', 'lift', 'stairs', 'ramp', 'accessibility'],
    title: 'Wheelchair & Accessibility Access',
    content: 'Stadium elevators are located at Gates A, B, and D. Ramps are available at all main gates. Designated wheelchair seating is available in Sections 102, 105, 116, 204, and 222.',
    details: [
      'Elevator locations: North Plaza (Gate A), East Plaza (Gate B), West Plaza (Gate D).',
      'Assistance desks: Located inside Gates A and C.',
      'Wheelchair escorts: Request at any Guest Service booth or call +1 (555) WC-ASSIST.'
    ]
  },
  {
    category: 'accessibility',
    keywords: ['sensory', 'quiet', 'noise', 'autism', 'overwhelm', 'calm', 'anxiety'],
    title: 'Sensory-Friendly Quiet Rooms',
    content: 'A dedicated Sensory Room is located on the Concourse Level near Section 118. Sensory kits (noise-canceling headphones, fidget tools) are available for checkout at Guest Services.',
    details: [
      'Location: Section 118 (Concourse Level), sound-dampened environment.',
      'Availability: Free checkout of sensory bags, weighted lap pads, and visual schedules.',
      'Quiet Zones: Quiet seating areas are also marked in the open plazas behind Section 202.'
    ]
  },
  {
    category: 'accessibility',
    keywords: ['blind', 'visual', 'audio', 'braille', 'signage', 'hearing', 'deaf', 'interpreter'],
    title: 'Visual & Hearing Impairment Services',
    content: 'Assistive listening devices (ALDs) are available for checkout at all Guest Service booths. Braille signage is installed throughout all restrooms, concession stands, and elevator lobbies.',
    details: [
      'ALDs: Pick up at Gate A or C Guest Services. Requires a photo ID deposit.',
      'Sign Language: ASL interpreters are present on big screens for major announcements.',
      'Audio Description: Live match audio description is available via FM radio frequency 88.3 FM.'
    ]
  },

  // Wayfinding & Navigation
  {
    category: 'wayfinding',
    keywords: ['gate', 'entry', 'entrance', 'security', 'bag', 'ticket', 'doors'],
    title: 'Stadium Gate Information',
    content: 'There are four main entrances: Gate A (North Plaza), Gate B (East Plaza), Gate C (South Plaza), and Gate D (West Plaza). Gates open 3 hours prior to kickoff.',
    details: [
      'Gate A (North): Closest to bicycle parking and Metrolink Station.',
      'Gate B (East): Closest to VIP Parking Lot Gold and shuttle pickup.',
      'Gate C (South): Closest to General Parking Lot Silver and Ride-share Zone.',
      'Gate D (West): Closest to Accessibility Parking Lot Blue.'
    ]
  },
  {
    category: 'wayfinding',
    keywords: ['food', 'drink', 'beer', 'concession', 'vegan', 'vegetarian', 'halal', 'gluten', 'water'],
    title: 'Food & Concessions Directory',
    content: 'Concessions are spread across all levels. Key specialty stands include FIFA Fan Feast (Gate B, classic brats), Verde Bites (Gate C, 100% vegan & halal), and Oasis Refills.',
    details: [
      'FIFA Fan Feast: Section 104 & 210. Hotdogs, pretzels, beverages.',
      'Verde Bites (Vegan/Halal/Gluten-Free): Section 112 & 220. Falafel wraps, plant-based burgers, fresh fruit bowls.',
      'Oasis Water Stations: Located near Sections 101, 115, 120, 205, 218. Free chilled water refills.'
    ]
  },
  {
    category: 'wayfinding',
    keywords: ['restroom', 'toilet', 'wc', 'bathroom', 'gender', 'baby', 'diaper'],
    title: 'Restrooms & Family Facilities',
    content: 'Restrooms are located in all concourse sections. Family-assist and gender-neutral restrooms are equipped with diaper changing stations near Sections 108, 124, 206, and 224.',
    details: [
      'Men & Women Restrooms: Available adjacent to every seating section.',
      'All-Gender / Family Restrooms: Sections 108, 124, 206, 224.',
      'Nursing Suites: Quiet private spaces for nursing mothers are located near Sections 110 and 212.'
    ]
  },

  // Transport & Parking
  {
    category: 'transport',
    keywords: ['shuttle', 'bus', 'transit', 'metro', 'train', 'subway', 'rideshare', 'uber', 'lyft', 'taxi'],
    title: 'Public Transit & Shuttle Hubs',
    content: 'Century Station (Metro) is a 10-minute walk from Gate A. Free shuttle service runs every 5 minutes from the Park & Ride lot to the East Plaza Transit Loop (Gate B).',
    details: [
      'Metro Train: Board at Century Station (Line Red). Match ticket doubles as a free transit pass.',
      'Express Shuttle: Active 4 hours before and 2 hours after the match. Fully electric zero-emission fleet.',
      'Ride-Share (Uber/Lyft): Drop-off and pickup strictly restricted to Lot Silver (Gate C).'
    ]
  },
  {
    category: 'transport',
    keywords: ['parking', 'car', 'vehicle', 'ev', 'charging', 'electric', 'valet'],
    title: 'Stadium Parking & EV Charging',
    content: 'Parking is pre-book only. Lot Gold (VIP, East), Lot Silver (General, South), and Lot Blue (Accessible, West) are equipped with EV charging stations (40 active plugs total).',
    details: [
      'Lot Blue (Accessibility): Must show valid accessible parking placard. Gate D entry.',
      'EV Chargers: Level 2 chargers are free to use. Available in Lot Gold (Row A) and Lot Silver (Row M).',
      'Sustainability tip: Carpool with 4+ fans and get a 50% discount on pre-paid parking fees.'
    ]
  },

  // Sustainability
  {
    category: 'sustainability',
    keywords: ['recycle', 'trash', 'compost', 'waste', 'bin', 'bottle', 'plastic', 'green', 'environment'],
    title: 'Zero Waste Initiative & Sorting',
    content: 'FIFA World Cup 2026 is a zero-waste event. Please use the color-coded bins: Green (Compost/Food), Blue (Recycling/Plastics), and Black (Landfill/Residual waste).',
    details: [
      'Green Bin (Compost): All food scraps, compostable cups, and plates.',
      'Blue Bin (Recycle): Clean plastic bottles, aluminum cans, cardboard.',
      'Black Bin (Landfill): Chip bags, wrappers, non-recyclable materials.',
      'Oasis Stations: Refill your reusable bottle (must be clear plastic, under 500ml) to reduce single-use plastic.'
    ]
  },
  {
    category: 'sustainability',
    keywords: ['carbon', 'offset', 'footprint', 'bike', 'bicycle', 'walk', 'tree'],
    title: 'Carbon Offset & Green Commuting',
    content: 'Reduce your matchday carbon footprint. Unlock the Green Fan Badge by walking, biking, or taking public transit. Log your commute in the SUTRA app to plant a tree.',
    details: [
      'Bicycle Valet: Lock your bike securely for free at Gate A plaza.',
      'Commute Logger: Entering your transit card details automatically calculates CO2 saved.',
      'Tree Planting: Every 10kg of CO2 saved triggers a tree planting in partnership with EarthDay 2026.'
    ]
  },

  // Ops & General
  {
    category: 'ops',
    keywords: ['incident', 'spill', 'security', 'fight', 'emergency', 'medical', 'help', 'clean', 'staff', 'volunteer'],
    title: 'Emergency & Incident Operations',
    content: 'For immediate assistance, contact nearby volunteers in green vests. In case of medical emergencies, first-aid stations are located near Gate A and Gate C.',
    details: [
      'First Aid Stations: Ground Level near Section 101, Upper Level near Section 214.',
      'Security: Call 911 for severe emergencies, or text "SUTRA [Location] [Issue]" to 555-SAFE for local dispatch.',
      'Cleanliness: Staff are dispatched automatically to clean spills or clear path blockages.'
    ]
  }
];

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  persona?: 'fan' | 'staff' | 'organizer';
}

// Client Side RAG Search
export function searchRAG(query: string): RAGEntry[] {
  const normalized = query.toLowerCase();
  
  // Calculate a matching score based on keywords and content
  const matches = SUTRA_RAG_DATABASE.map(entry => {
    let score = 0;
    
    // Keyword match (keywords are already lowercase in the database)
    for (const keyword of entry.keywords) {
      if (normalized.includes(keyword)) {
        score += 5;
      }
    }

    // Title / content matches (compute lowercase only when needed)
    const titleLower = entry.title.toLowerCase();
    if (titleLower.includes(normalized)) score += 10;
    if (score === 0 && entry.content.toLowerCase().includes(normalized)) score += 2;
    
    return { entry, score };
  });

  // Filter out zero matches and sort by score
  return matches
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(m => m.entry);
}

// Classify query
export function classifyQuery(query: string): 'wayfinding' | 'transport' | 'accessibility' | 'sustainability' | 'ops' | 'general' {
  const normalized = query.toLowerCase();
  
  if (normalized.includes('wheelchair') || normalized.includes('blind') || normalized.includes('sensory') || normalized.includes('elevator') || normalized.includes('accessibility') || normalized.includes('hearing') || normalized.includes('quiet room') || normalized.includes('lift')) {
    return 'accessibility';
  }
  if (normalized.includes('shuttle') || normalized.includes('metro') || normalized.includes('bus') || normalized.includes('train') || normalized.includes('parking') || normalized.includes('ev') || normalized.includes('transit') || normalized.includes('commute')) {
    return 'transport';
  }
  if (normalized.includes('recycle') || normalized.includes('compost') || normalized.includes('waste') || normalized.includes('carbon') || normalized.includes('sustainability') || normalized.includes('green') || normalized.includes('eco')) {
    return 'sustainability';
  }
  if (normalized.includes('gate') || normalized.includes('food') || normalized.includes('restroom') || normalized.includes('concession') || normalized.includes('where is') || normalized.includes('toilet') || normalized.includes('seat')) {
    return 'wayfinding';
  }
  if (normalized.includes('spill') || normalized.includes('incident') || normalized.includes('emergency') || normalized.includes('medical') || normalized.includes('police') || normalized.includes('security') || normalized.includes('triage') || normalized.includes('dispatch')) {
    return 'ops';
  }

  return 'general';
}

// Generate local fallback responses if Azure Functions or GenAI APIs are offline
export function generateLocalResponse(
  query: string,
  persona: 'fan' | 'staff' | 'organizer',
  ragMatches: RAGEntry[]
): string {
  const category = classifyQuery(query);
  
  if (ragMatches.length > 0) {
    const top = ragMatches[0];
    let resp = `🤖 **SUTRA Agent Routing**: Resolved via **${top.category.toUpperCase()}** database.\n\n### ${top.title}\n${top.content}\n\n`;
    if (top.details && top.details.length > 0) {
      resp += `**Specific Details:**\n` + top.details.map(d => `- ${d}`).join('\n') + `\n\n`;
    }
    
    // Add persona-specific instructions
    if (persona === 'fan') {
      resp += `💡 *Fan Tip:* You can track these locations live on the interactive stadium blueprint to your right! Use eco-routes to save carbon emissions.`;
    } else if (persona === 'staff') {
      resp += `📋 *Staff Protocol:* Ensure these routes are clear of any obstructions. Report any physical blockages or elevator failures immediately to the Control Tower.`;
    } else {
      resp += `⚙️ *Ops Control:* System status for this facility is monitored. Automatic routing updates are broadcasted to volunteer handsets.`;
    }
    return resp;
  }

  // Generic fallback based on category
  switch (category) {
    case 'accessibility':
      return `♿ **Accessibility Assistance**: Our stadium is fully equipped for fans with disabilities. All elevators are fully operational. For specialized wheelchair transfers, sensory support, or sign interpreters, please contact the nearest guest services booth (located inside Gates A and C) or signal one of our roaming volunteers in green vests.`;
    case 'transport':
      return `🚌 **Transportation Guide**: Public transit (Metro Red Line via Century Station) is highly recommended. Shuttles are running continuously from all Park & Ride lots. If ride-sharing, use Lot Silver at Gate C. Carbon offset rewards are available for choosing low-emission transport options!`;
    case 'sustainability':
      return `🌱 **Sustainability Hub**: Let's keep the stadium green! Sort your trash: Blue for Recyclables (plastic bottles/cans), Green for Compost (food waste), and Black for Landfill. Use our Oasis Water Refill stations rather than single-use plastic bottles. Every action counts!`;
    case 'wayfinding':
      return `📍 **Stadium Wayfinding**: Check our interactive visual map. You can search for gate locations, seating sections, restrooms, family zones, and concessions. Make sure to choose your entrance based on your ticket sector (Gates A, B, C, or D).`;
    case 'ops':
      return `🚨 **Operational Response**: Safety is our priority. If you see a hazard (spill, electrical issue, path block) or require medical aid, please log it immediately under the **Staff Portal** or alert any staff member. Standard first-aid stations are located near Gate A and Gate C.`;
    default:
      return `👋 **Welcome to SUTRA!** I am the Stadium Unified Tournament Response Assistant for the FIFA World Cup 2026. \n\nI can help you with:\n- 📍 **Navigation & Wayfinding** (finding seats, concessions, gates)\n- 🚌 **Transit & Green Transport** (live metro/shuttle updates, eco-routes)\n- ♿ **Accessibility Accommodations** (elevators, sensory quiet rooms, listening devices)\n- 🌱 **Sustainability Programs** (recycling, carbon offsets, water stations)\n- 🚨 **Incident Dispatch** (staff reporting, crowd triage)\n\nWhat can I assist you with today?`;
  }
}

// Call Serverless API (Vercel Function proxy)
export async function sendQueryToSutraAgent(
  query: string,
  history: ChatMessage[],
  persona: 'fan' | 'staff' | 'organizer',
  useSpeech: boolean = false
): Promise<string> {
  const ragMatches = searchRAG(query);
  
  // Create conversation array formatted for standard LLM APIs
  const apiHistory = history.map(h => ({
    role: h.role,
    content: h.content
  }));

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        history: apiHistory,
        persona,
        ragContext: ragMatches.map(m => m.content).join('\n')
      })
    });

    if (response.ok) {
      const data = await response.json();
      const replyText = data.reply || data.text;
      
      // Perform Speech Synthesis if enabled
      if (useSpeech && 'speechSynthesis' in window) {
        speakText(replyText);
      }
      return replyText;
    } else {
      const errText = await response.text();
      let parsedErr = errText;
      try {
        const jsonErr = JSON.parse(errText);
        parsedErr = jsonErr.error || jsonErr.message || errText;
      } catch (e) {
        // Not JSON
      }
      throw new Error(`API returned status ${response.status}: ${parsedErr}`);
    }
  } catch (err: any) {
    console.warn("SUTRA API Offline or Unconfigured. Falling back to local RAG Engine.", err);
    
    // Simulate API delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const localReply = generateLocalResponse(query, persona, ragMatches);
    const warningPrefix = `⚠️ **Local RAG Fallback** (API Error: *${err.message || 'Connection failed'}*)\n\n`;
    
    const combinedReply = warningPrefix + localReply;
    
    if (useSpeech && 'speechSynthesis' in window) {
      speakText(localReply);
    }
    return combinedReply;
  }
}

// Text to Speech (TTS) Accessibility Helper
export function speakText(text: string) {
  // Strip Markdown characters for cleaner speech audio
  const cleanText = text
    .replace(/[#*`_~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/🤖|♿|🚌|🌱|📍|🚨|💡|📋|⚙️/g, '');

  window.speechSynthesis.cancel(); // Cancel any ongoing speech
  
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 1.05;
  utterance.pitch = 1.0;
  
  // Find a suitable English voice or local voice matching preferred languages
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => v.lang.includes('en') && v.name.includes('Google')) || voices[0];
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }
  
  window.speechSynthesis.speak(utterance);
}

// Speech to Text (STT) Recognition Handler
export function startVoiceRecognition(
  onTranscript: (text: string) => void,
  onEnd: () => void,
  onError: (err: any) => void
): any {
  // Check browser compatibility (WebkitSpeechRecognition)
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    onError("Web Speech API is not supported in this browser.");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onTranscript(transcript);
  };

  recognition.onend = () => {
    onEnd();
  };

  recognition.onerror = (event: any) => {
    onError(event.error);
    onEnd();
  };

  recognition.start();
  return recognition;
}
