// ============================================================
// GeminiService — API communication layer (streaming + fallback)
// ============================================================

import { getToken } from '@/app/lib/api';

const BASE_URL = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_BASE_URL || 'http://localhost:4000/api';

export interface ChatPayload {
  message: string;
  history: { role: 'user' | 'model'; text: string }[];
  language: string;
  fileContext?: string;
}

/** Non-streaming chat — returns the full reply string */
export async function sendMessage(payload: ChatPayload): Promise<string> {
  const token = getToken();
  const response = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.reply || '';
}

/** Streaming chat — calls the SSE endpoint and invokes onChunk for each token.
 *  Falls back to non-streaming if the stream endpoint is not available. */
export async function sendMessageStreaming(
  payload: ChatPayload,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const token = getToken();

  try {
    const response = await fetch(`${BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok || !response.body) {
      // Fallback to non-streaming
      const reply = await sendMessage(payload);
      simulateStream(reply, onChunk);
      return reply;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      // SSE format: "data: <text>\n\n"
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            const text = parsed.text || parsed.chunk || '';
            if (text) {
              fullText += text;
              onChunk(text);
            }
          } catch {
            // raw text chunk
            if (data && data !== '[DONE]') {
              fullText += data;
              onChunk(data);
            }
          }
        }
      }
    }

    return fullText;
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;

    // Network error — try non-streaming fallback
    const reply = await sendMessage(payload);
    simulateStream(reply, onChunk);
    return reply;
  }
}

/** Simulate word-by-word streaming for non-SSE responses */
export function simulateStream(text: string, onChunk: (chunk: string) => void, delayMs = 18): void {
  const words = text.split(/(\s+)/);
  let i = 0;
  function next() {
    if (i >= words.length) return;
    onChunk(words[i]);
    i++;
    setTimeout(next, delayMs);
  }
  next();
}

/** Build conversation history from messages for API context */
export function buildHistory(
  messages: { role: 'user' | 'ai'; text: string }[]
): { role: 'user' | 'model'; text: string }[] {
  return messages.slice(-10).map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    text: m.text,
  }));
}
