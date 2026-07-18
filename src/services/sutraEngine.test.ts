import { describe, it, expect, vi } from 'vitest';
import { searchRAG, classifyQuery, generateLocalResponse, sendQueryToSutraAgent } from './sutraEngine';

describe('SUTRA AI Engine & RAG Retrieval', () => {
  
  it('should retrieve relevant RAG entries for keywords', () => {
    const searchResults = searchRAG('wheelchair accessibility elevators');
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].title).toContain('Wheelchair & Accessibility');
    
    const sensoryResults = searchRAG('quiet sensory room autism');
    expect(sensoryResults.length).toBeGreaterThan(0);
    expect(sensoryResults[0].title).toContain('Sensory-Friendly Quiet');
  });

  it('should correctly classify user queries into SUTRA categories', () => {
    expect(classifyQuery('How do I take the shuttle bus to the train station?')).toBe('transport');
    expect(classifyQuery('Where is the wheelchair elevator?')).toBe('accessibility');
    expect(classifyQuery('Is there any vegan food options?')).toBe('wayfinding');
    expect(classifyQuery('How do I recycle plastic cups?')).toBe('sustainability');
    expect(classifyQuery('We need emergency first aid here')).toBe('ops');
    expect(classifyQuery('Hello there')).toBe('general');
  });

  it('should generate meaningful fallback answers based on matching RAG content', () => {
    const results = searchRAG('sensory room quiet zone');
    const response = generateLocalResponse('sensory room quiet zone', 'fan', results);
    expect(response).toContain('Sensory-Friendly Quiet Rooms');
    expect(response).toContain('Section 118');
  });

  it('should handle API fetch failures and fallback to local RAG with warning prefix', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockImplementation(() => 
      Promise.resolve({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error')
      })
    ) as unknown as typeof globalThis.fetch;

    const response = await sendQueryToSutraAgent('wheelchair accessibility elevators', [], 'fan');
    expect(response).toContain('⚠️ **Local RAG Fallback**');
    expect(response).toContain('API returned status 500');

    globalThis.fetch = originalFetch;
  });

  it('should reject empty or whitespace queries', async () => {
    const emptyResponse = await sendQueryToSutraAgent('', [], 'fan');
    expect(emptyResponse).toContain('Query cannot be empty');

    const whitespaceResponse = await sendQueryToSutraAgent('   ', [], 'fan');
    expect(whitespaceResponse).toContain('Query cannot be empty');
  });

  it('should reject queries exceeding 2000 characters', async () => {
    const longQuery = 'a'.repeat(2001);
    const longResponse = await sendQueryToSutraAgent(longQuery, [], 'fan');
    expect(longResponse).toContain('Query length exceeds maximum limit');
  });
  
});
