// ============================================================
// ConversationManager — localStorage-backed persistence
// ============================================================

import type { Conversation, ChatFolder, Message } from './types';

const STORAGE_KEY = 'sarathi_ai_conversations';
const FOLDERS_KEY = 'sarathi_ai_folders';
const MEMORY_KEY = 'sarathi_ai_memory';

// ── Conversations ────────────────────────────────────────────

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: Conversation[] = JSON.parse(raw);
    // Rehydrate Date objects
    return parsed.map((c) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
      messages: c.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })),
    }));
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // Storage quota exceeded — silently drop oldest
    const trimmed = conversations.slice(-20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }
}

export function createConversation(language = 'en'): Conversation {
  return {
    id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: 'New Chat',
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    pinned: false,
    language,
  };
}

export function autoTitle(messages: Message[]): string {
  const firstUser = messages.find((m) => m.role === 'user');
  if (!firstUser) return 'New Chat';
  const words = firstUser.text.trim().split(/\s+/).slice(0, 6).join(' ');
  return words.length > 40 ? words.slice(0, 40) + '…' : words;
}

export function deleteConversation(conversations: Conversation[], id: string): Conversation[] {
  return conversations.filter((c) => c.id !== id);
}

export function pinConversation(conversations: Conversation[], id: string): Conversation[] {
  return conversations.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c));
}

export function renameConversation(conversations: Conversation[], id: string, title: string): Conversation[] {
  return conversations.map((c) => (c.id === id ? { ...c, title } : c));
}

export function moveToFolder(conversations: Conversation[], id: string, folderId: string | undefined): Conversation[] {
  return conversations.map((c) => (c.id === id ? { ...c, folderId } : c));
}

// ── Folders ────────────────────────────────────────────────────

export function loadFolders(): ChatFolder[] {
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    if (!raw) return [];
    const parsed: ChatFolder[] = JSON.parse(raw);
    return parsed.map((f) => ({ ...f, createdAt: new Date(f.createdAt) }));
  } catch {
    return [];
  }
}

export function saveFolders(folders: ChatFolder[]): void {
  try {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  } catch {}
}

export function createFolder(name: string): ChatFolder {
  const colors = ['#6366F1', '#F97316', '#16A34A', '#0F2B5B', '#EC4899', '#0EA5E9'];
  return {
    id: `folder_${Date.now()}`,
    name,
    color: colors[Math.floor(Math.random() * colors.length)],
    createdAt: new Date(),
  };
}

// ── Memory ────────────────────────────────────────────────────

export function loadMemory(): Record<string, unknown> {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveMemory(data: Record<string, unknown>): void {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(data));
  } catch {}
}

export function clearMemory(): void {
  localStorage.removeItem(MEMORY_KEY);
}

// ── Export ────────────────────────────────────────────────────

export function exportConversationAsText(conv: Conversation): string {
  const header = `Sarthi — ${conv.title}\nDate: ${conv.createdAt.toLocaleDateString()}\n${'='.repeat(60)}\n\n`;
  const body = conv.messages
    .map((m) => `[${m.role === 'user' ? 'You' : 'Sarthi'}] ${m.timestamp.toLocaleTimeString()}\n${m.text}\n`)
    .join('\n');
  return header + body;
}

export function downloadText(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
