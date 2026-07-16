import React from 'react';
import { X, Info, MessageSquare, Clock, Download, Share2, Trash2 } from 'lucide-react';
import type { Conversation } from './types';
import { exportConversationAsText, downloadText } from './ConversationManager';

interface RightPanelProps {
  conversation: Conversation | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleteConversation: (id: string) => void;
}

export function RightPanel({ conversation, isOpen, onClose, onDeleteConversation }: RightPanelProps) {
  if (!isOpen || !conversation) return null;

  const msgCount = conversation.messages.length;
  const userMsgs = conversation.messages.filter((m) => m.role === 'user').length;
  const aiMsgs = conversation.messages.filter((m) => m.role === 'ai').length;
  const bookmarked = conversation.messages.filter((m) => m.bookmarked);
  const liked = conversation.messages.filter((m) => m.liked).length;

  const handleExport = () => {
    const text = exportConversationAsText(conversation);
    downloadText(`${conversation.title.replace(/\s+/g, '_')}.txt`, text);
  };

  const handleShare = () => {
    const summary = `Sarthi conversation: "${conversation.title}"\n${conversation.messages.length} messages`;
    if (navigator.share) {
      navigator.share({ title: 'Sarthi Chat', text: summary, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(summary);
    }
  };

  return (
    <aside className="w-72 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-gray-800">Conversation Info</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Stats */}
      <div className="p-4 border-b border-gray-100">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Statistics</h4>
        <div className="grid grid-cols-2 gap-2">
          <StatCard icon={<MessageSquare className="w-4 h-4 text-indigo-600" />} label="Total" value={msgCount} />
          <StatCard icon={<MessageSquare className="w-4 h-4 text-blue-600" />} label="Your msgs" value={userMsgs} />
          <StatCard icon={<MessageSquare className="w-4 h-4 text-purple-600" />} label="AI msgs" value={aiMsgs} />
          <StatCard icon={<MessageSquare className="w-4 h-4 text-yellow-600" />} label="Liked" value={liked} />
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Created {conversation.createdAt.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated {conversation.updatedAt.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Bookmarked Messages */}
      {bookmarked.length > 0 && (
        <div className="p-4 border-b border-gray-100 flex-1 overflow-y-auto">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            🔖 Bookmarked ({bookmarked.length})
          </h4>
          <div className="space-y-2">
            {bookmarked.map((msg) => (
              <div key={msg.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-2.5">
                <p className="text-xs text-gray-700 line-clamp-3 leading-relaxed">{msg.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-100 space-y-2 mt-auto">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quick Actions</h4>
        <button
          type="button"
          onClick={handleExport}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors text-sm font-semibold"
        >
          <Download className="w-4 h-4" />
          Export as TXT
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors text-sm font-semibold"
        >
          <Share2 className="w-4 h-4" />
          Share Conversation
        </button>
        <button
          type="button"
          onClick={() => onDeleteConversation(conversation.id)}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-semibold"
        >
          <Trash2 className="w-4 h-4" />
          Delete Conversation
        </button>
      </div>
    </aside>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-gray-50 rounded-xl p-2.5 flex items-center gap-2">
      {icon}
      <div>
        <p className="text-xs font-bold text-gray-800">{value}</p>
        <p className="text-[10px] text-gray-500">{label}</p>
      </div>
    </div>
  );
}
