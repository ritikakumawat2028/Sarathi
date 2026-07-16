import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@/app/context/LanguageContext';
import { useAuth } from '@/app/context/AuthContext';
import { useChatStore } from '@/app/components/ai-chat/useChatStore';
import { LeftSidebar } from '@/app/components/ai-chat/LeftSidebar';
import { MessageBubble } from '@/app/components/ai-chat/MessageBubble';
import { ChatInput } from '@/app/components/ai-chat/ChatInput';
import { WelcomeScreen } from '@/app/components/ai-chat/WelcomeScreen';
import { RightPanel } from '@/app/components/ai-chat/RightPanel';
import { TypingIndicator } from '@/app/components/ai-chat/TypingIndicator';
import type { UploadedFile } from '@/app/components/ai-chat/types';
import { Menu, PanelRight, Sparkles, X } from 'lucide-react';

export function AIChat() {
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const store = useChatStore(language);

  const {
    conversations,
    folders,
    activeId,
    activeConversation,
    isStreaming,
    searchQuery,
    sidebarOpen,
    rightPanelOpen,
    pendingFile,
    setSearchQuery,
    setSidebarOpen,
    setRightPanelOpen,
    setPendingFile,
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
  } = store;

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages.length, isStreaming]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        newChat();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [newChat, setSidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSend = async (text: string) => {
    await sendMessage(text);
  };

  const handleFileAttach = (file: UploadedFile) => {
    setPendingFile(file);
  };

  // Figure out which messages to show
  const messages = activeConversation?.messages ?? [];
  const lastAiMsgId = [...messages].reverse().find((m) => m.role === 'ai')?.id;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC]">
      {/* ── Left Sidebar ─────────────────────────────────── */}
      <LeftSidebar
        conversations={conversations}
        folders={folders}
        activeId={activeId}
        searchQuery={searchQuery}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSearchChange={setSearchQuery}
        onNewChat={() => { newChat(); setSidebarOpen(false); }}
        onSelectConversation={(id) => { selectConversation(id); setSidebarOpen(false); }}
        onDeleteConversation={deleteChat}
        onPinConversation={pinChat}
        onRenameConversation={renameChat}
        onMoveChatToFolder={moveChatToFolder}
        onAddFolder={addFolder}
        onDeleteFolder={deleteFolder}
        onLogout={handleLogout}
        userName={user?.name}
        userEmail={user?.email}
      />

      {/* ── Main Content ──────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 h-full">

        {/* ── Top Bar ──────────────────────────────────────── */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white/90 backdrop-blur-md flex-shrink-0 shadow-sm">
          {/* Left controls */}
          <div className="flex items-center gap-2">
            {/* Toggle sidebar */}
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all shadow-sm"
              title="Toggle sidebar (Ctrl+B)"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>

            {/* New chat */}
            <button
              type="button"
              onClick={() => newChat()}
              className="hidden sm:flex items-center gap-1.5 px-3 h-9 rounded-xl border border-gray-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 text-xs font-bold text-gray-600 hover:text-indigo-700 transition-all shadow-sm"
              title="New Chat (Ctrl+N)"
            >
              <X className="w-3.5 h-3.5" />
              New Chat
            </button>
          </div>

          {/* Center: Model indicator */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#0F2B5B]/10 to-indigo-100 border border-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-extrabold text-[#0F2B5B]">
                {activeConversation?.title && activeConversation.title !== 'New Chat'
                  ? activeConversation.title.slice(0, 32)
                  : 'Sarthi · Gemini'}
              </span>
              {isStreaming && (
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              )}
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Toggle right panel */}
            <button
              type="button"
              onClick={() => setRightPanelOpen((v) => !v)}
              title="Conversation info"
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all shadow-sm ${
                rightPanelOpen
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-600'
                  : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <PanelRight className="w-4.5 h-4.5" />
            </button>

            {/* User avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0F2B5B] to-[#1D4ED8] flex items-center justify-center text-white text-xs font-extrabold shadow-md">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* ── Messages Area ────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Chat Column */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Messages Scroll Container */}
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                // Welcome screen
                <WelcomeScreen
                  onSelectPrompt={(query) => sendMessage(query)}
                  userName={user?.name}
                  language={language}
                />
              ) : (
                // Message list
                <div className="max-w-3xl mx-auto w-full px-4 py-6 space-y-6">
                  {messages.map((msg, idx) => {
                    const isLastAi = msg.id === lastAiMsgId;
                    return (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isLastAiMessage={isLastAi}
                        isStreaming={isStreaming}
                        onLike={() => likeMessage(activeId!, msg.id)}
                        onDislike={() => dislikeMessage(activeId!, msg.id)}
                        onBookmark={() => bookmarkMessage(activeId!, msg.id, !msg.bookmarked)}
                        onRegenerate={regenerateLastResponse}
                        onCopy={() => {}}
                        userName={user?.name}
                        language={language}
                      />
                    );
                  })}

                  {/* Typing indicator when AI hasn't returned first token yet */}
                  {isStreaming && messages[messages.length - 1]?.role !== 'ai' && (
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                      </div>
                      <div className="bg-white border border-gray-200 rounded-3xl rounded-tl-md px-5 py-4 shadow-sm">
                        <TypingIndicator />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* ── Input Bar ──────────────────────────────────── */}
            <div className="flex-shrink-0 max-w-3xl mx-auto w-full">
              <ChatInput
                onSend={handleSend}
                onStop={stopGeneration}
                isStreaming={isStreaming}
                isDisabled={false}
                pendingFile={pendingFile}
                onFileAttach={(file) => setPendingFile(file)}
                onFileRemove={() => setPendingFile(null)}
                language={language}
              />
            </div>
          </div>

          {/* ── Right Panel ──────────────────────────────────── */}
          {rightPanelOpen && (
            <RightPanel
              conversation={activeConversation}
              isOpen={rightPanelOpen}
              onClose={() => setRightPanelOpen(false)}
              onDeleteConversation={(id) => { deleteChat(id); setRightPanelOpen(false); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
