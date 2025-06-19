// aiChatApi.js
// Utility for calling a generic AI chat API (Hugging Face or similar)

const API_URL = import.meta.env.VITE_AI_API_URL;
const API_KEY = import.meta.env.VITE_AI_API_KEY;

export async function fetchAIChatResponse(prompt) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (API_KEY) headers['Authorization'] = `Bearer ${API_KEY}`;

  // Llama chat models expect [INST] ... [/INST] format
  const formattedPrompt = `[INST] ${prompt} [/INST]`;
  const body = JSON.stringify({
    inputs: formattedPrompt,
    parameters: { max_new_tokens: 256, return_full_text: false }
  });

  const response = await fetch(API_URL, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    throw new Error('AI API error: ' + response.statusText);
  }
  const data = await response.json();
  // Hugging Face returns an array with 'generated_text' or similar
  if (Array.isArray(data) && data[0]?.generated_text) {
    return data[0].generated_text;
  }
  // Some models return { generated_text: ... }
  if (data.generated_text) {
    return data.generated_text;
  }
  // Fallback: return the whole response
  return JSON.stringify(data);
}
