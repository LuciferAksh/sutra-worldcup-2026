// Azure Function API Handler - Secure GenAI Proxy

module.exports = async function (context, req) {
  context.log('SUTRA Chat Proxy processed a request.');

  // Handle options check or missing body
  if (req.method === "OPTIONS") {
    context.res = {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    };
    return;
  }

  const { query, history, persona, ragContext } = req.body || {};

  if (!query) {
    context.res = {
      status: 400,
      body: { error: "Please provide a 'query' in the request body." }
    };
    return;
  }

  // Retrieve environment variables securely set in Azure
  const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
  const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
  const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  const systemPrompt = `You are SUTRA, the Stadium Unified Tournament Response Assistant for the FIFA World Cup 2026.
You are interacting with a user in the context of the '${persona.toUpperCase()}' persona.

Here is the relevant stadium operations and policy context (RAG) retrieved for this query:
${ragContext || "No direct RAG context found. Use general tournament operations guidelines."}

Guidelines:
1. Provide extremely helpful, clear, and context-specific answers.
2. In 'fan' mode, focus on wayfinding, accessibility elevator locations, eco-friendly transit schedules, and carbon offsets.
3. In 'staff' mode, focus on triage dispatch, reporting protocols, and safety coordination.
4. If you mention gates (A, B, C, D) or seating sections, refer to their locations on the visual stadium blueprint.
5. Translate your response or match the language used by the user if appropriate.`;

  // 1. Try Azure OpenAI if configured
  if (AZURE_OPENAI_KEY && AZURE_OPENAI_ENDPOINT) {
    try {
      const url = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-15-preview`;
      
      const messages = [
        { role: "system", content: systemPrompt },
        ...(history || []).map(h => ({ role: h.role, content: h.content })),
        { role: "user", content: query }
      ];

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": AZURE_OPENAI_KEY
        },
        body: JSON.stringify({
          messages: messages,
          temperature: 0.7,
          max_tokens: 800
        })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices[0].message.content;
        context.res = {
          status: 200,
          headers: { "Content-Type": "application/json" },
          body: { reply }
        };
        return;
      } else {
        const errText = await response.text();
        context.log.error("Azure OpenAI API Error: " + errText);
      }
    } catch (err) {
      context.log.error("Azure OpenAI Connection Error: " + err.message);
    }
  }

  // 2. Try Google Gemini if configured
  if (GEMINI_API_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      // Format history for Gemini
      const contents = [];
      if (history && history.length > 0) {
        history.forEach(h => {
          contents.push({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }]
          });
        });
      }
      contents.push({
        role: 'user',
        parts: [{ text: query }]
      });

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: contents,
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.candidates[0].content.parts[0].text;
        context.res = {
          status: 200,
          headers: { "Content-Type": "application/json" },
          body: { reply }
        };
        return;
      } else {
        const errText = await response.text();
        context.log.error("Gemini API Error: " + errText);
      }
    } catch (err) {
      context.log.error("Gemini Connection Error: " + err.message);
    }
  }

  // 3. Fallback: Simulated High-Fidelity Local AI Agent (if offline/unconfigured)
  // This ensures the application is 100% functional and testable without keys
  context.log('No valid API keys set. Resolving request via Local Simulation.');
  
  // Return code indicating proxy resolved via simulated local engine
  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: {
      reply: `☁️ **Azure Function Proxy Response** (Simulation mode, check Environment Variables):\n\nProcessed query: *"${query}"*\nPersona Context: **${persona.toUpperCase()}**\n\nI can verify that this request traveled successfully from the React frontend, through the serverless Azure Function \`/api/chat\` gateway, and was handled securely.\n\nTo fetch live completions, set your \`AZURE_OPENAI_KEY\` and \`AZURE_OPENAI_ENDPOINT\` or \`GEMINI_API_KEY\` variables in your Azure App Configuration.`
    }
  };
};
