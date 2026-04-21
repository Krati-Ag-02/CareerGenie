import https from 'https';
import 'dotenv/config';

function httpsPost(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);

    const options = {
      hostname,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => (data += chunk));

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);

          if (res.statusCode >= 400) {
            const msg =
              parsed?.error?.message ||
              parsed?.error?.msg ||
              JSON.stringify(parsed);

            reject(new Error(`HTTP ${res.statusCode}: ${msg}`));
          } else {
            resolve(parsed);
          }
        } catch {
          reject(new Error('Non-JSON response: ' + data.slice(0, 300)));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}


async function callGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not set');
  }

  const res = await httpsPost(
    'generativelanguage.googleapis.com',
    `/v1beta/odels/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {},
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }
  );

  const text = res?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error('Empty Gemini response');

  return text;
}

async function callGroq(prompt) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not set');
  }

  const res = await httpsPost(
    'api.groq.com',
    '/openai/v1/chat/completions',
    {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    {
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful AI assistant. Always respond with valid JSON only when asked.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }
  );

  const text = res?.choices?.[0]?.message?.content;

  if (!text) throw new Error('Empty Groq response');

  return text;
}


async function callAI(prompt) {
  // Try Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      return await callGemini(prompt);
    } catch (err) {
      console.warn('⚠️ Gemini failed:', err.message, '→ trying Groq');
    }
  }

  // Fallback to Groq
  if (process.env.GROQ_API_KEY) {
    try {
      return await callGroq(prompt);
    } catch (err) {
      throw new Error('Both AI providers failed: ' + err.message);
    }
  }

  throw new Error('No AI API key set in .env');
}

function extractJSON(text) {
  // Remove markdown fences
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) {
    try {
      return JSON.parse(fence[1].trim());
    } catch (_) {}
  }

  // Direct parse
  try {
    return JSON.parse(text.trim());
  } catch (_) {}

  // Extract first JSON block
  const block = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (block) {
    try {
      return JSON.parse(block[1]);
    } catch (_) {}
  }

  throw new Error(
    'Could not parse JSON from AI response:\n' + text.slice(0, 400)
  );
}

export { callAI, extractJSON };