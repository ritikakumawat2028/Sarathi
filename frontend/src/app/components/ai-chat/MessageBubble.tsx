import React, { useState } from 'react';
import { Sparkles, Copy, Check, ThumbsUp, ThumbsDown, RotateCcw, Share2, Bookmark, Volume2, VolumeX, User } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { StreamCursor, TypingIndicator } from './TypingIndicator';
import { voiceManager } from './VoiceManager';
import type { Message } from './types';

interface MessageBubbleProps {
  message: Message;
  isLastAiMessage: boolean;
  isStreaming: boolean;
  onLike: () => void;
  onDislike: () => void;
  onBookmark: () => void;
  onRegenerate: () => void;
  onCopy: () => void;
  userName?: string;
  language?: string;
}

export function MessageBubble({
  message,
  isLastAiMessage,
  isStreaming,
  onLike,
  onDislike,
  onBookmark,
  onRegenerate,
  onCopy,
  userName,
  language = 'en',
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const isUser = message.role === 'user';
  const isAI = message.role === 'ai';
  const showStreaming = isAI && isLastAiMessage && isStreaming;
  const showTypingDots = showStreaming && !message.text;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text).then(() => {
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSpeak = () => {
    if (speaking) {
      voiceManager.stopSpeaking();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      voiceManager.speak(message.text, language);
      // Reset after estimated duration
      const words = message.text.split(' ').length;
      const estimatedMs = (words / 2.5) * 1000 + 500;
      setTimeout(() => setSpeaking(false), estimatedMs);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Sarthi Response',
        text: message.text.slice(0, 300),
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(message.text);
    }
  };

  const timeStr = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const initials = userName ? userName[0].toUpperCase() : 'U';

  // ── USER BUBBLE ───────────────────────────────────────────
  if (isUser) {
    return (
      <div className="flex gap-3 justify-end group">
        <div className="max-w-[80%] sm:max-w-[72%]">
          <div className="bg-gradient-to-br from-[#0F2B5B] to-[#1D4ED8] text-white rounded-3xl rounded-tr-md px-5 py-3.5 shadow-md">
            <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{message.text}</p>
          </div>
          <div className="flex justify-end mt-1 px-1">
            <span className="text-[11px] text-gray-400">{timeStr}</span>
          </div>
        </div>
        {/* Avatar */}
        <div className="w-9 h-9 rounded-2xl bg-[#0F2B5B] text-white flex items-center justify-center text-sm font-extrabold flex-shrink-0 self-end shadow-md">
          {initials}
        </div>
      </div>
    );
  }

  // ── AI BUBBLE ─────────────────────────────────────────────
  return (
    <div className="flex gap-3 group">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center flex-shrink-0 self-start mt-0.5 shadow-md">
        <Sparkles className="w-4 h-4 text-yellow-300" />
      </div>

      <div className="flex-1 min-w-0 max-w-[85%] sm:max-w-[78%]">
        {/* Message Card */}
        <div className="bg-white border border-gray-200 rounded-3xl rounded-tl-md px-5 py-4 shadow-sm">
          {showTypingDots ? (
            <TypingIndicator />
          ) : (
            <>
              <MarkdownRenderer text={message.text} />
              {showStreaming && message.text && <StreamCursor />}
            </>
          )}

          {/* Sources */}
          {message.sources && message.sources.length > 0 && !showStreaming && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Sources</p>
              <div className="flex flex-wrap gap-1.5">
                {message.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200 hover:bg-indigo-100 transition-colors"
                  >
                    {src.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Time + Action Bar */}
        <div className="flex items-center gap-1 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-[11px] text-gray-400 mr-2">{timeStr} · Sarthi</span>

          {/* Action Buttons */}
          <ActionButton
            icon={copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            title="Copy response"
            onClick={handleCopy}
            active={copied}
          />
          <ActionButton
            icon={<ThumbsUp className="w-3.5 h-3.5" />}
            title="Good response"
            onClick={onLike}
            active={message.liked}
            activeClass="text-green-600 bg-green-50"
          />
          <ActionButton
            icon={<ThumbsDown className="w-3.5 h-3.5" />}
            title="Poor response"
            onClick={onDislike}
            active={message.disliked}
            activeClass="text-red-500 bg-red-50"
          />
          <ActionButton
            icon={<Bookmark className="w-3.5 h-3.5" />}
            title="Bookmark"
            onClick={onBookmark}
            active={message.bookmarked}
            activeClass="text-yellow-600 bg-yellow-50"
          />
          <ActionButton
            icon={speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            title={speaking ? 'Stop speaking' : 'Read aloud'}
            onClick={handleSpeak}
            active={speaking}
            activeClass="text-purple-600 bg-purple-50"
          />
          <ActionButton
            icon={<Share2 className="w-3.5 h-3.5" />}
            title="Share"
            onClick={handleShare}
          />
          {isLastAiMessage && !isStreaming && (
            <ActionButton
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              title="Regenerate response"
              onClick={onRegenerate}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Action Button Helper ─────────────────────────────────────

function ActionButton({
  icon,
  title,
  onClick,
  active = false,
  activeClass = 'text-indigo-600 bg-indigo-50',
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  active?: boolean;
  activeClass?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all text-gray-400 hover:text-gray-700 hover:bg-gray-100 ${
        active ? activeClass : ''
      }`}
    >
      {icon}
    </button>
  );
}
