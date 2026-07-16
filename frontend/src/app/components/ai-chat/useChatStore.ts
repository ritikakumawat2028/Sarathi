import { useState, useCallback, useRef, useEffect } from 'react';
import type { Conversation, Message, ChatFolder, UploadedFile } from './types';
import {
  loadConversations,
  saveConversations,
  loadFolders,
  saveFolders,
  createConversation,
  createFolder,
  deleteConversation,
  pinConversation,
  renameConversation,
  moveToFolder,
  autoTitle,
} from './ConversationManager';
import { sendMessageStreaming, buildHistory } from './geminiService';

export function useChatStore(language: string) {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [folders, setFolders] = useState<ChatFolder[]>(() => loadFolders());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, _setSidebarOpen] = useState(true);
  const [rightPanelOpen, _setRightPanelOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<UploadedFile | null>(null);

  const setSidebarOpen = (v: boolean | ((prev: boolean) => boolean)) => _setSidebarOpen(v);
  const setRightPanelOpen = (v: boolean | ((prev: boolean) => boolean)) => _setRightPanelOpen(v);

  const abortRef = useRef<AbortController | null>(null);

  // Persist conversations whenever they change
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    saveFolders(folders);
  }, [folders]);

  // ── Derived state ─────────────────────────────────────────

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  const filteredConversations = searchQuery.trim()
    ? conversations.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.messages.some((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : conversations;

  const pinnedConvs = filteredConversations.filter((c) => c.pinned);
  const unpinnedConvs = filteredConversations.filter((c) => !c.pinned);

  // ── Actions ───────────────────────────────────────────────

  const newChat = useCallback(() => {
    const conv = createConversation(language);
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    return conv;
  }, [language]);

  const selectConversation = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const deleteChat = useCallback((id: string) => {
    setConversations((prev) => {
      const updated = deleteConversation(prev, id);
      return updated;
    });
    setActiveId((prev) => {
      if (prev === id) return null;
      return prev;
    });
  }, []);

  const pinChat = useCallback((id: string) => {
    setConversations((prev) => pinConversation(prev, id));
  }, []);

  const renameChat = useCallback((id: string, title: string) => {
    setConversations((prev) => renameConversation(prev, id, title));
  }, []);

  const moveChatToFolder = useCallback((id: string, folderId: string | undefined) => {
    setConversations((prev) => moveToFolder(prev, id, folderId));
  }, []);

  const addFolder = useCallback((name: string) => {
    const folder = createFolder(name);
    setFolders((prev) => [...prev, folder]);
    return folder;
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
    // Un-assign conversations from this folder
    setConversations((prev) => prev.map((c) => (c.folderId === id ? { ...c, folderId: undefined } : c)));
  }, []);

  // ── Message actions ───────────────────────────────────────

  const updateMessage = useCallback((convId: string, msgId: string, updates: Partial<Message>) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? { ...c, messages: c.messages.map((m) => (m.id === msgId ? { ...m, ...updates } : m)) }
          : c
      )
    );
  }, []);

  const likeMessage = useCallback(
    (convId: string, msgId: string) => updateMessage(convId, msgId, { liked: true, disliked: false }),
    [updateMessage]
  );

  const dislikeMessage = useCallback(
    (convId: string, msgId: string) => updateMessage(convId, msgId, { disliked: true, liked: false }),
    [updateMessage]
  );

  const bookmarkMessage = useCallback(
    (convId: string, msgId: string, bookmarked: boolean) => updateMessage(convId, msgId, { bookmarked }),
    [updateMessage]
  );

  // ── Send message ──────────────────────────────────────────

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      // Ensure we have an active conversation
      let convId = activeId;
      let currentConvs = conversations;

      if (!convId) {
        const conv = createConversation(language);
        convId = conv.id;
        currentConvs = [conv, ...conversations];
        setConversations(currentConvs);
        setActiveId(convId);
      }

      const finalText = pendingFile
        ? `${text}\n\n[Attached: ${pendingFile.name}]`
        : text;

      const userMsg: Message = {
        id: `msg_${Date.now()}`,
        role: 'user',
        text: finalText,
        timestamp: new Date(),
        status: 'done',
      };

      const aiMsgId = `msg_${Date.now() + 1}`;
      const aiMsg: Message = {
        id: aiMsgId,
        role: 'ai',
        text: '',
        timestamp: new Date(),
        status: 'streaming',
      };

      // Insert both messages
      let updatedConvs = currentConvs.map((c) => {
        if (c.id !== convId) return c;
        const msgs = [...c.messages, userMsg, aiMsg];
        return {
          ...c,
          messages: msgs,
          updatedAt: new Date(),
          title: c.messages.length === 0 ? autoTitle([userMsg]) : c.title,
        };
      });
      setConversations(updatedConvs);
      setIsStreaming(true);

      abortRef.current = new AbortController();

      const history = buildHistory(
        (updatedConvs.find((c) => c.id === convId)?.messages.slice(0, -2) ?? []).map((m) => ({
          role: m.role,
          text: m.text,
        }))
      );

      const fileCtx = pendingFile?.textContent;
      setPendingFile(null);

      let accumulated = '';

      try {
        await sendMessageStreaming(
          { message: text, history, language, fileContext: fileCtx },
          (chunk) => {
            accumulated += chunk;
            setConversations((prev) =>
              prev.map((c) =>
                c.id === convId
                  ? {
                      ...c,
                      messages: c.messages.map((m) =>
                        m.id === aiMsgId ? { ...m, text: accumulated, status: 'streaming' } : m
                      ),
                    }
                  : c
              )
            );
          },
          abortRef.current.signal
        );

        // Mark as done
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === aiMsgId ? { ...m, text: accumulated, status: 'done' } : m
                  ),
                }
              : c
          )
        );
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          // Stopped by user — keep partial text
          setConversations((prev) =>
            prev.map((c) =>
              c.id === convId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === aiMsgId
                        ? { ...m, text: accumulated || '_(Generation stopped)_', status: 'done' }
                        : m
                    ),
                  }
                : c
            )
          );
        } else {
          const fallback = `### ⚠️ Connection Issue\n\nUnable to reach Sarthi backend. Please check your connection and try again.\n\n**Quick resources:**\n- [Government Schemes](https://myscheme.gov.in)\n- [SWAYAM Courses](https://swayam.gov.in)\n- [Scholarships](https://scholarships.gov.in)`;
          setConversations((prev) =>
            prev.map((c) =>
              c.id === convId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === aiMsgId ? { ...m, text: fallback, status: 'error' } : m
                    ),
                  }
                : c
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [activeId, conversations, isStreaming, language, pendingFile]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const regenerateLastResponse = useCallback(async () => {
    if (!activeConversation || isStreaming) return;
    const msgs = activeConversation.messages;
    const lastUserMsg = [...msgs].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;

    // Remove last AI message
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: c.messages.filter((m) => m.role !== 'ai' || c.messages.indexOf(m) < c.messages.indexOf(lastUserMsg)) }
          : c
      )
    );

    await sendMessage(lastUserMsg.text);
  }, [activeConversation, activeId, isStreaming, sendMessage]);

  return {
    // State
    conversations,
    folders,
    activeId,
    activeConversation,
    isStreaming,
    searchQuery,
    sidebarOpen,
    rightPanelOpen,
    pendingFile,
    pinnedConvs,
    unpinnedConvs,
    filteredConversations,
    // Setters
    setSearchQuery,
    setSidebarOpen,
    setRightPanelOpen,
    setPendingFile,
    // Actions
    newChat,
    selectConversation,
    deleteChat,
    pinChat,
    renameChat,
    moveChatToFolder,
    addFolder,
    deleteFolder,
    sendMessage,
    stopGeneration,
    regenerateLastResponse,
    likeMessage,
    dislikeMessage,
    bookmarkMessage,
    updateMessage,
  };
}
