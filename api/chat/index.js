// Secure GenAI Proxy - Hybrid Handler supporting both Azure Functions & Vercel Serverless runtimes

// Retrieve environment variables
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function executeChatLogic(query, persona, history, ragContext, logHelper) {
  const apiErrors = [];

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
      const cleanEndpoint = AZURE_OPENAI_ENDPOINT.endsWith('/') 
        ? AZURE_OPENAI_ENDPOINT.slice(0, -1) 
        : AZURE_OPENAI_ENDPOINT;

      const url = `${cleanEndpoint}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-15-preview`;
      
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
        return data.choices[0].message.content;
      } else {
        const errText = await response.text();
        logHelper.error("Azure OpenAI API Error: " + errText);
        apiErrors.push(`Azure OpenAI error (Status ${response.status}): ${errText}`);
      }
    } catch (err) {
      logHelper.error("Azure OpenAI Connection Error: " + err.message);
      apiErrors.push(`Azure OpenAI Connection error: ${err.message}`);
    }
  }

  // 1.5. Try Standard OpenAI if configured
  if (OPENAI_API_KEY) {
    try {
      const url = "https://api.openai.com/v1/chat/completions";
      
      const messages = [
        { role: "system", content: systemPrompt },
        ...(history || []).map(h => ({ role: h.role, content: h.content })),
        { role: "user", content: query }
      ];

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: messages,
          temperature: 0.7,
          max_tokens: 800
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      } else {
        const errText = await response.text();
        logHelper.error("Standard OpenAI API Error: " + errText);
        apiErrors.push(`Standard OpenAI error (Status ${response.status}): ${errText}`);
      }
    } catch (err) {
      logHelper.error("Standard OpenAI Connection Error: " + err.message);
      apiErrors.push(`Standard OpenAI Connection error: ${err.message}`);
    }
  }

  // 2. Try Google Gemini if configured
  if (GEMINI_API_KEY) {
    const modelsToTry = [
      process.env.GEMINI_MODEL,
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash"
    ].filter(Boolean);

    for (const modelName of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
        
        const contents = [];
        const systemInstructionText = `SYSTEM INSTRUCTIONS:\n${systemPrompt}\n\n---`;

        if (history && history.length > 0) {
          history.forEach((h, index) => {
            if (index === 0) {
              contents.push({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: `${systemInstructionText}\n\nUser Query: ${h.content}` }]
              });
            } else {
              contents.push({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.content }]
              });
            }
          });
          contents.push({
            role: 'user',
            parts: [{ text: query }]
          });
        } else {
          contents.push({
            role: 'user',
            parts: [{ text: `${systemInstructionText}\n\nUser Query: ${query}` }]
          });
        }

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          return data.candidates[0].content.parts[0].text;
        } else {
          const errText = await response.text();
          logHelper.warn(`Gemini model ${modelName} returned status ${response.status}: ${errText}`);
          apiErrors.push(`Gemini ${modelName} error (Status ${response.status}): ${errText}`);
        }
      } catch (err) {
        logHelper.error(`Gemini model ${modelName} Connection Error: ${err.message}`);
        apiErrors.push(`Gemini ${modelName} connection error: ${err.message}`);
      }
    }
  }

  // 3. Fallback: Simulated High-Fidelity Local AI Agent (if offline/unconfigured)
  logHelper.log('No valid API keys set or connection failed. Resolving request via Local Simulation.');
  
  const azureKeyStatus = AZURE_OPENAI_KEY ? `Configured (Length: ${AZURE_OPENAI_KEY.length})` : "Missing";
  const azureEndpointStatus = AZURE_OPENAI_ENDPOINT ? "Configured" : "Missing";
  const geminiKeyStatus = GEMINI_API_KEY ? `Configured (Length: ${GEMINI_API_KEY.length})` : "Missing";
  const openaiKeyStatus = OPENAI_API_KEY ? `Configured (Length: ${OPENAI_API_KEY.length})` : "Missing";

  return `☁️ **Proxy Telemetry** (Simulation Mode):\n\nProcessed query: *"${query}"*\nPersona Context: **${persona.toUpperCase()}**\n\n**Environment Configuration Audit:**\n• \`AZURE_OPENAI_KEY\`: ${azureKeyStatus}\n• \`AZURE_OPENAI_ENDPOINT\`: ${azureEndpointStatus}\n• \`GEMINI_API_KEY\`: ${geminiKeyStatus}\n• \`OPENAI_API_KEY\`: ${openaiKeyStatus}\n\n**Connection Diagnostics & Errors:**\n${apiErrors.length > 0 ? apiErrors.map(e => `• ${e}`).join('\n') : "• No credentials detected. Please configure environment variables."}\n\n*Note:* If you see connection errors above, please check that your deployment name, endpoints, or key strings are correct inside your portal configuration.`;
}

module.exports = async function (arg1, arg2) {
  // Detect if running under Azure Functions (where arg1 is context) or Vercel/Express (where arg1 is req)
  const isAzure = arg1 && typeof arg1.log === 'function' && arg1.res !== undefined;

  if (isAzure) {
    // ----------------------------------------------------
    // Azure Functions Programming Model
    // ----------------------------------------------------
    const context = arg1;
    const req = arg2;

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

    try {
      const { query, history, persona, ragContext } = req.body || {};

      if (!query) {
        context.res = {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
          },
          body: { error: "Query is required" }
        };
        return;
      }

      const logHelper = {
        log: (msg) => context.log(msg),
        warn: (msg) => (context.log.warn ? context.log.warn(msg) : context.log(msg)),
        error: (msg) => (context.log.error ? context.log.error(msg) : context.log(msg))
      };

      const reply = await executeChatLogic(query, persona, history, ragContext, logHelper);
      
      context.res = {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
        body: { reply }
      };
    } catch (err) {
      context.res = {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
        body: { error: err.message }
      };
    }
  } else {
    // ----------------------------------------------------
    // Vercel Serverless Function Programming Model
    // ----------------------------------------------------
    const req = arg1;
    const res = arg2;

    const origin = req.headers?.origin || '*';

    if (req.method === "OPTIONS") {
      res.writeHead(200, {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      });
      res.end();
      return;
    }

    try {
      const { query, history, persona, ragContext } = req.body || {};

      if (!query) {
        res.writeHead(400, {
          "Access-Control-Allow-Origin": origin,
          "Content-Type": "application/json"
        });
        res.end(JSON.stringify({ error: "Query is required" }));
        return;
      }

      const logHelper = {
        log: console.log,
        warn: console.warn,
        error: console.error
      };

      const reply = await executeChatLogic(query, persona, history, ragContext, logHelper);
      
      res.writeHead(200, {
        "Access-Control-Allow-Origin": origin,
        "Content-Type": "application/json"
      });
      res.end(JSON.stringify({ reply }));
    } catch (err) {
      res.writeHead(500, {
        "Access-Control-Allow-Origin": origin,
        "Content-Type": "application/json"
      });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
};
