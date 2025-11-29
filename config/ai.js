
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

// AI Provider Constants
export const AI_PROVIDERS = {
  GEMINI: 'gemini',
  GROQ: 'groq',
  HUGGINGFACE: 'huggingface',
  OLLAMA: 'ollama',
  TOGETHER: 'together'
};


const MODELS = {
  [AI_PROVIDERS.GEMINI]: {
    default: 'gemini-1.5-flash',      
    pro: 'gemini-1.5-pro',           
    flash: 'gemini-1.5-flash',        
    exp: 'gemini-2.0-flash-exp'       
  },
  [AI_PROVIDERS.GROQ]: {
    default: 'llama-3.3-70b-versatile',  
    fast: 'llama-3.1-8b-instant',       
    alternative: 'mixtral-8x7b-32768',   
    specdec: 'llama-3.3-70b-specdec'     
  },
  [AI_PROVIDERS.HUGGINGFACE]: {
    default: 'mistralai/Mistral-7B-Instruct-v0.2',
    alternative: 'meta-llama/Llama-2-7b-chat-hf'
  },
  [AI_PROVIDERS.OLLAMA]: {
    default: 'llama3.2',
    fast: 'phi3',
    alternative: 'mistral'
  },
  [AI_PROVIDERS.TOGETHER]: {
    default: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    fast: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'
  }
};

// Initialize clients
let geminiClient = null;
let groqClient = null;

function initializeClients() {
  if (process.env.GEMINI_API_KEY && !geminiClient) {
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  if (process.env.GROQ_API_KEY && !groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
}

// Provider-specific implementations
class AIProvider {
  constructor(provider, model = 'default') {
    this.provider = provider;
    this.model = MODELS[provider][model] || MODELS[provider].default;
    initializeClients();
  }

  async generate(prompt, options = {}) {
    switch(this.provider) {
      case AI_PROVIDERS.GEMINI:
        return this.generateGemini(prompt, options);
      case AI_PROVIDERS.GROQ:
        return this.generateGroq(prompt, options);
      case AI_PROVIDERS.HUGGINGFACE:
        return this.generateHuggingFace(prompt, options);
      case AI_PROVIDERS.OLLAMA:
        return this.generateOllama(prompt, options);
      case AI_PROVIDERS.TOGETHER:
        return this.generateTogether(prompt, options);
      default:
        throw new Error(`Unknown provider: ${this.provider}`);
    }
  }

  async generateGemini(prompt, options) {
    if (!geminiClient) {
      throw new Error('GEMINI_API_KEY not set');
    }
    try {
      const model = geminiClient.getGenerativeModel({ 
        model: this.model,
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 1024,
        }
      });
      const result = await model.generateContent(prompt);
      return {
        text: result.response.text(),
        provider: AI_PROVIDERS.GEMINI,
        model: this.model
      };
    } catch (error) {
      throw new Error(`Gemini error: ${error.message}`);
    }
  }

  async generateGroq(prompt, options) {
    if (!groqClient) {
      throw new Error('GROQ_API_KEY not set');
    }
    try {
      const completion = await groqClient.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: this.model,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1024
      });
      return {
        text: completion.choices[0].message.content,
        provider: AI_PROVIDERS.GROQ,
        model: this.model
      };
    } catch (error) {
      throw new Error(`Groq error: ${error.message}`);
    }
  }

  async generateHuggingFace(prompt, options) {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      throw new Error('HUGGINGFACE_API_KEY not set');
    }
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${this.model}`,
        {
          headers: { 
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          method: "POST",
          body: JSON.stringify({ 
            inputs: prompt,
            parameters: { 
              max_new_tokens: options.maxTokens || 500,
              temperature: options.temperature || 0.7
            }
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        text: data[0].generated_text.replace(prompt, '').trim(),
        provider: AI_PROVIDERS.HUGGINGFACE,
        model: this.model
      };
    } catch (error) {
      throw new Error(`HuggingFace error: ${error.message}`);
    }
  }

  async generateOllama(prompt, options) {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: options.temperature || 0.7
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Ollama not running or model not found');
      }
      
      const data = await response.json();
      return {
        text: data.response,
        provider: AI_PROVIDERS.OLLAMA,
        model: this.model
      };
    } catch (error) {
      throw new Error(`Ollama error: ${error.message}. Make sure Ollama is running.`);
    }
  }

  async generateTogether(prompt, options) {
    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      throw new Error('TOGETHER_API_KEY not set');
    }
    try {
      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 1024
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return {
        text: data.choices[0].message.content,
        provider: AI_PROVIDERS.TOGETHER,
        model: this.model
      };
    } catch (error) {
      throw new Error(`Together AI error: ${error.message}`);
    }
  }
}

// Smart provider that tries multiple providers with fallback
export class SmartAIProvider {
  constructor(preferredProviders = [AI_PROVIDERS.GEMINI, AI_PROVIDERS.GROQ]) {
    this.providers = preferredProviders.map(p => new AIProvider(p));
  }

  async generate(prompt, options = {}) {
    const errors = [];
    
    for (const provider of this.providers) {
      try {
        return await provider.generate(prompt, options);
      } catch (error) {
        errors.push(`${provider.provider}: ${error.message}`);
        continue;
      }
    }
    
    throw new Error(`All providers failed:\n${errors.join('\n')}`);
  }
}

// Simple exported functions
export function createAI(provider = AI_PROVIDERS.GEMINI, model = 'default') {
  return new AIProvider(provider, model);
}

export function createSmartAI(providers) {
  return new SmartAIProvider(providers);
}

// Quick generate function with auto-fallback
export async function generateText(prompt, options = {}) {
  const smart = new SmartAIProvider();
  const result = await smart.generate(prompt, options);
  return result.text;
}

// Chat session support
export function createChatSession(provider = AI_PROVIDERS.GEMINI, model = 'default') {
  const ai = new AIProvider(provider, model);
  const history = [];
  
  return {
    async send(message) {
      history.push({ role: 'user', content: message });
      const fullPrompt = history.map(h => `${h.role}: ${h.content}`).join('\n');
      const result = await ai.generate(fullPrompt);
      history.push({ role: 'assistant', content: result.text });
      return result.text;
    },
    getHistory() {
      return history;
    },
    clear() {
      history.length = 0;
    }
  };
}

// Check which providers are available
export function getAvailableProviders() {
  const available = [];
  
  if (process.env.GEMINI_API_KEY) available.push(AI_PROVIDERS.GEMINI);
  if (process.env.GROQ_API_KEY) available.push(AI_PROVIDERS.GROQ);
  if (process.env.HUGGINGFACE_API_KEY) available.push(AI_PROVIDERS.HUGGINGFACE);
  if (process.env.TOGETHER_API_KEY) available.push(AI_PROVIDERS.TOGETHER);
  
  return available;
}

console.log(' Multi-Provider AI Configuration loaded');
console.log(' Available providers:', getAvailableProviders().join(', ') || 'None (add API keys to .env)');