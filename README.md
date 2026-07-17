# SUTRA — Stadium Unified Tournament Response Assistant

> GenAI-powered stadium operations platform for the FIFA World Cup 2026.

## Overview

SUTRA is a unified, AI-enabled stadium operations and fan experience platform. It integrates real-time wayfinding, crowd management, accessibility accommodations, green transport scheduling, sustainability tracking, and operational triage into a single interactive dashboard.

## Architecture

- **Frontend**: React 19 + TypeScript + Vite (glassmorphic dark theme with Framer Motion animations)
- **Backend**: Vercel Serverless Functions (Node.js ES Module) proxying to Google Gemini API
- **AI Engine**: Client-side RAG database with server-side GenAI fallback (Gemini / Azure OpenAI / OpenAI)
- **Testing**: Vitest + Testing Library (JSDOM environment)
- **CI/CD**: GitHub → Vercel (automatic production deploys on push to `main`)

## Features

| Persona | Capabilities |
| :--- | :--- |
| **Fan Companion** | Voice concierge chat, wayfinding navigation, eco-score tracker, transit feed |
| **Staff & Volunteers** | Incident reporter, live task queue, multilingual translator |
| **Control Tower** | Operations analytics charts, predictive AI alerts, resource dispatcher |

## Quick Start

```bash
npm install
npm run dev      # Start local dev server
npm run test     # Run Vitest suite
npm run build    # Production build
```

## Environment Variables (Vercel Dashboard)

| Variable | Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `GEMINI_MODEL` | (Optional) Override model name (default: `gemini-3.1-flash-lite`) |
| `AZURE_OPENAI_KEY` | (Optional) Azure OpenAI API key |
| `AZURE_OPENAI_ENDPOINT` | (Optional) Azure OpenAI endpoint URL |
| `OPENAI_API_KEY` | (Optional) Standard OpenAI API key |

## Security

- Zero API keys compiled into client-side bundles
- All credentials read server-side from environment variables
- React's default XSS protections active on all rendered content

## License

MIT
