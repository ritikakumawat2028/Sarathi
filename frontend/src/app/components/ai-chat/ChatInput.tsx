import React, { useRef, useState, useEffect } from 'react';
import { Send, Mic, MicOff, Paperclip, X, Square, Loader2 } from 'lucide-react';
import { voiceManager } from './VoiceManager';
import { processFile, ACCEPTED_FILE_TYPES, formatFileSize } from './FileUploadManager';
import type { UploadedFile } from './types';

interface ChatInputProps {
  onSend: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  isDisabled?: boolean;
  pendingFile: UploadedFile | null;
  onFileAttach: (file: UploadedFile) => void;
  onFileRemove: () => void;
  language?: string;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onStop,
  isStreaming,
  isDisabled = false,
  pendingFile,
  onFileAttach,
  onFileRemove,
  language = 'en',
  placeholder,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text]);

  const defaultPlaceholder =
    placeholder ||
    (language === 'hi'
      ? 'सरकारी योजना, करियर, कोडिंग या पढ़ाई के बारे में पूछें...'
      : 'Ask about government schemes, career, coding, studies...');

  const canSend = (text.trim().length > 0 || !!pendingFile) && !isDisabled;

  const handleSend = () => {
    if (isStreaming) {
      onStop();
      return;
    }
    if (!canSend) return;
    onSend(text.trim());
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoice = async () => {
    if (!voiceManager.isSupported) return;

    if (isListening) {
      voiceManager.stopListening();
      setIsListening(false);
      setInterimText('');
      return;
    }

    setIsListening(true);
    setInterimText('');

    try {
      const transcript = await voiceManager.startListening(
        language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-IN',
        (partial) => setInterimText(partial)
      );
      if (transcript.trim()) {
        setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setInterimText('');
        textareaRef.current?.focus();
      }
    } catch {
      // Ignore errors silently
    } finally {
      setIsListening(false);
      setInterimText('');
    }
  };

  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileLoading(true);
    try {
      const processed = await processFile(file);
      onFileAttach(processed);
    } catch {
      // silently ignore
    } finally {
      setFileLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="px-4 py-3 sm:px-6 bg-white border-t border-gray-200">
      {/* File Preview Bar */}
      {pendingFile && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="flex items-center gap-2 flex-1 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2">
            <Paperclip className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            {pendingFile.previewUrl && (
              <img src={pendingFile.previewUrl} alt="preview" className="w-8 h-8 rounded object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-indigo-800 truncate">{pendingFile.name}</p>
              <p className="text-[10px] text-indigo-500">{formatFileSize(pendingFile.size)}</p>
            </div>
            <button
              type="button"
              onClick={onFileRemove}
              className="w-5 h-5 rounded-full bg-indigo-200 hover:bg-indigo-300 flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-indigo-700" />
            </button>
          </div>
        </div>
      )}

      {/* Interim voice text */}
      {interimText && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
            <p className="text-xs text-red-700 italic">{interimText}</p>
          </div>
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-end gap-2">
        {/* File Button */}
        <button
          type="button"
          onClick={handleFileClick}
          disabled={isDisabled || fileLoading}
          title="Attach file (PDF, image, TXT, CSV, DOCX)"
          className="w-11 h-11 rounded-2xl border border-gray-300 text-gray-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
        >
          {fileLoading ? (
            <Loader2 className="w-4.5 h-4.5 animate-spin text-indigo-500" />
          ) : (
            <Paperclip className="w-4.5 h-4.5" />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={defaultPlaceholder}
            disabled={isDisabled}
            rows={1}
            className="w-full resize-none rounded-2xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-gray-50 focus:bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '44px', maxHeight: '160px' }}
          />
          {/* Character hint */}
          {text.length > 500 && (
            <span className="absolute bottom-2 right-3 text-[10px] text-gray-400">
              {text.length}
            </span>
          )}
        </div>

        {/* Voice Button */}
        {voiceManager.isSupported && (
          <button
            type="button"
            onClick={handleVoice}
            disabled={isDisabled}
            title={isListening ? 'Stop listening' : 'Voice input'}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all border disabled:opacity-40 ${
              isListening
                ? 'bg-red-100 border-red-300 text-red-600 animate-pulse'
                : 'border-gray-300 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            {isListening ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
          </button>
        )}

        {/* Send / Stop Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!isStreaming && !canSend}
          title={isStreaming ? 'Stop generation' : 'Send message'}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed ${
            isStreaming
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gradient-to-br from-[#0F2B5B] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-purple-600 text-white'
          }`}
        >
          {isStreaming ? (
            <Square className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Footer hint */}
      <p className="text-center text-[10px] text-gray-400 mt-2">
        Enter to send · Shift+Enter for new line · Sarthi may make mistakes — verify critical info
      </p>
    </div>
  );
}
