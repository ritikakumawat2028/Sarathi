import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@/app/context/LanguageContext';
import {
  Plus,
  Search,
  Pin,
  Trash2,
  MoreHorizontal,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Sparkles,
  Landmark,
  Settings,
  PenLine,
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  LogOut,
  X,
} from 'lucide-react';
import type { Conversation, ChatFolder } from './types';

// Time grouping helpers
function groupByTime(conversations: Conversation[]): {
  pinned: Conversation[];
  today: Conversation[];
  yesterday: Conversation[];
  older: Conversation[];
} {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);

  const pinned = conversations.filter((c) => c.pinned);
  const unpinned = conversations.filter((c) => !c.pinned);

  const today = unpinned.filter((c) => new Date(c.updatedAt) >= todayStart);
  const yesterday = unpinned.filter(
    (c) => new Date(c.updatedAt) >= yesterdayStart && new Date(c.updatedAt) < todayStart
  );
  const older = unpinned.filter((c) => new Date(c.updatedAt) < yesterdayStart);

  return { pinned, today, yesterday, older };
}

interface LeftSidebarProps {
  conversations: Conversation[];
  folders: ChatFolder[];
  activeId: string | null;
  searchQuery: string;
  isOpen: boolean;
  onClose: () => void;
  onSearchChange: (q: string) => void;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onPinConversation: (id: string) => void;
  onRenameConversation: (id: string, title: string) => void;
  onMoveChatToFolder: (id: string, folderId: string | undefined) => void;
  onAddFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onLogout: () => void;
  userName?: string;
  userEmail?: string;
}

export function LeftSidebar({
  conversations,
  folders,
  activeId,
  searchQuery,
  isOpen,
  onClose,
  onSearchChange,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onPinConversation,
  onRenameConversation,
  onMoveChatToFolder,
  onAddFolder,
  onDeleteFolder,
  onLogout,
  userName,
  userEmail,
}: LeftSidebarProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [foldersOpen, setFoldersOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const { pinned, today, yesterday, older } = groupByTime(conversations);
  const initials = userName ? userName.slice(0, 2).toUpperCase() : 'SA';

  const handleRenameSubmit = (id: string) => {
    if (renameValue.trim()) onRenameConversation(id, renameValue.trim());
    setRenamingId(null);
    setRenameValue('');
  };

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      onAddFolder(newFolderName.trim());
      setNewFolderName('');
      setShowFolderInput(false);
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: t('dashboard') || 'Dashboard', path: '/dashboard' },
    { icon: GraduationCap, label: t('studentSupport') || 'Student Support', path: '/student-support' },
    { icon: ShieldCheck, label: t('govSchemes') || 'Gov. Schemes', path: '/government-schemes' },
    { icon: Briefcase, label: t('careerGuidance') || 'Career Guidance', path: '/career-guidance' },
  ];

  return (
    <>
      {/* Overlay on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:relative top-0 left-0 h-full z-40 lg:z-auto flex flex-col bg-[#0A1E40] text-white transition-all duration-300 ease-in-out ${
          isOpen ? 'w-72 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 flex-shrink-0">
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1D4ED8] to-purple-600 flex items-center justify-center shadow-lg">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-black tracking-tight leading-none">SARTHI</p>
              <p className="text-[10px] text-white/50 mt-0.5 leading-none">National AI Portal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── New Chat Button ─────────────────────────────── */}
        <div className="px-3 pt-3 flex-shrink-0">
          <button
            type="button"
            onClick={onNewChat}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#1D4ED8] to-purple-600 hover:from-purple-600 hover:to-[#1D4ED8] text-white text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {t('newChat') || 'New Chat'}
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 ml-auto" />
          </button>
        </div>

        {/* ── Search ─────────────────────────────────────── */}
        <div className="px-3 pt-2.5 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('searchChats') || 'Search chats...'}
              className="w-full bg-white/10 border border-white/10 hover:border-white/20 focus:border-white/30 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-white/40 outline-none transition-all"
            />
          </div>
        </div>

        {/* ── Navigation ─────────────────────────────────── */}
        <div className="px-3 pt-3 flex-shrink-0">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider px-1 mb-1.5">
            {t('navigate') || 'Navigate'}
          </p>
          {navItems.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/10 transition-all text-left mb-0.5"
            >
              <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </div>

        {/* ── Divider ────────────────────────────────────── */}
        <div className="mx-3 my-2 border-t border-white/10 flex-shrink-0" />

        {/* ── Conversation History (scrollable) ──────────── */}
        <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-0.5 scrollbar-thin scrollbar-thumb-white/10">
          {conversations.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-xs text-white/30">{t('noConversations') || 'No conversations yet'}</p>
            </div>
          )}

          {pinned.length > 0 && (
            <ConvSection
              title={t('pinned') || '📌 Pinned'}
              items={pinned}
              activeId={activeId}
              renamingId={renamingId}
              renameValue={renameValue}
              openMenuId={openMenuId}
              onSelect={onSelectConversation}
              onDelete={onDeleteConversation}
              onPin={onPinConversation}
              onRenameStart={(id, title) => { setRenamingId(id); setRenameValue(title); }}
              onRenameSubmit={handleRenameSubmit}
              onRenameChange={setRenameValue}
              onMenuOpen={setOpenMenuId}
              folders={folders}
              onMoveToFolder={onMoveChatToFolder}
            />
          )}

          {today.length > 0 && (
            <ConvSection
              title={t('today') || 'Today'}
              items={today}
              activeId={activeId}
              renamingId={renamingId}
              renameValue={renameValue}
              openMenuId={openMenuId}
              onSelect={onSelectConversation}
              onDelete={onDeleteConversation}
              onPin={onPinConversation}
              onRenameStart={(id, title) => { setRenamingId(id); setRenameValue(title); }}
              onRenameSubmit={handleRenameSubmit}
              onRenameChange={setRenameValue}
              onMenuOpen={setOpenMenuId}
              folders={folders}
              onMoveToFolder={onMoveChatToFolder}
            />
          )}

          {yesterday.length > 0 && (
            <ConvSection
              title={t('yesterday') || 'Yesterday'}
              items={yesterday}
              activeId={activeId}
              renamingId={renamingId}
              renameValue={renameValue}
              openMenuId={openMenuId}
              onSelect={onSelectConversation}
              onDelete={onDeleteConversation}
              onPin={onPinConversation}
              onRenameStart={(id, title) => { setRenamingId(id); setRenameValue(title); }}
              onRenameSubmit={handleRenameSubmit}
              onRenameChange={setRenameValue}
              onMenuOpen={setOpenMenuId}
              folders={folders}
              onMoveToFolder={onMoveChatToFolder}
            />
          )}

          {older.length > 0 && (
            <ConvSection
              title={t('older') || 'Older'}
              items={older}
              activeId={activeId}
              renamingId={renamingId}
              renameValue={renameValue}
              openMenuId={openMenuId}
              onSelect={onSelectConversation}
              onDelete={onDeleteConversation}
              onPin={onPinConversation}
              onRenameStart={(id, title) => { setRenamingId(id); setRenameValue(title); }}
              onRenameSubmit={handleRenameSubmit}
              onRenameChange={setRenameValue}
              onMenuOpen={setOpenMenuId}
              folders={folders}
              onMoveToFolder={onMoveChatToFolder}
            />
          )}
        </div>

        {/* ── Folders Section ────────────────────────────── */}
        <div className="px-3 pb-2 flex-shrink-0 border-t border-white/10 pt-2">
          <button
            type="button"
            onClick={() => setFoldersOpen((v) => !v)}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            {foldersOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <span className="font-bold uppercase tracking-wider">{t('folders') || 'Folders'}</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowFolderInput((v) => !v); }}
              className="ml-auto w-5 h-5 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center"
            >
              <Plus className="w-3 h-3" />
            </button>
          </button>

          {showFolderInput && (
            <div className="flex gap-1 mt-1 px-1">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddFolder(); }}
                placeholder="Folder name..."
                autoFocus
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs text-white placeholder-white/30 outline-none"
              />
              <button
                type="button"
                onClick={handleAddFolder}
                className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
              >
                Add
              </button>
            </div>
          )}

          {foldersOpen && folders.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 cursor-pointer group"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: folder.color }}
                  />
                  <span className="text-xs text-white/70 flex-1 truncate">{folder.name}</span>
                  <button
                    type="button"
                    onClick={() => onDeleteFolder(folder.id)}
                    className="hidden group-hover:flex w-4 h-4 items-center justify-center rounded text-white/40 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── User Profile Footer ─────────────────────────── */}
        <div className="px-3 py-3 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{userName || 'Citizen'}</p>
              <p className="text-[10px] text-white/40 truncate">{userEmail || 'sarathi.gov.in'}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              title={t('logout') || 'Sign out'}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-red-500/30 hover:text-red-300 text-white/50 flex items-center justify-center transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ── Conversation Section ──────────────────────────────────────

interface ConvSectionProps {
  title: string;
  items: Conversation[];
  activeId: string | null;
  renamingId: string | null;
  renameValue: string;
  openMenuId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  onRenameStart: (id: string, title: string) => void;
  onRenameSubmit: (id: string) => void;
  onRenameChange: (v: string) => void;
  onMenuOpen: (id: string | null) => void;
  folders: ChatFolder[];
  onMoveToFolder: (id: string, folderId: string | undefined) => void;
}

function ConvSection({ title, items, activeId, renamingId, renameValue, openMenuId, onSelect, onDelete, onPin, onRenameStart, onRenameSubmit, onRenameChange, onMenuOpen, folders, onMoveToFolder }: ConvSectionProps) {
  return (
    <div className="mb-2">
      <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider px-1 mb-1">{title}</p>
      {items.map((conv) => (
        <ConvItem
          key={conv.id}
          conv={conv}
          isActive={conv.id === activeId}
          isRenaming={renamingId === conv.id}
          renameValue={renameValue}
          menuOpen={openMenuId === conv.id}
          onSelect={() => onSelect(conv.id)}
          onDelete={() => onDelete(conv.id)}
          onPin={() => onPin(conv.id)}
          onRenameStart={() => onRenameStart(conv.id, conv.title)}
          onRenameSubmit={() => onRenameSubmit(conv.id)}
          onRenameChange={onRenameChange}
          onMenuOpen={(open) => onMenuOpen(open ? conv.id : null)}
          folders={folders}
          onMoveToFolder={(fId) => onMoveToFolder(conv.id, fId)}
        />
      ))}
    </div>
  );
}

// ── Individual Conversation Row ───────────────────────────────

interface ConvItemProps {
  conv: Conversation;
  isActive: boolean;
  isRenaming: boolean;
  renameValue: string;
  menuOpen: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onPin: () => void;
  onRenameStart: () => void;
  onRenameSubmit: () => void;
  onRenameChange: (v: string) => void;
  onMenuOpen: (open: boolean) => void;
  folders: ChatFolder[];
  onMoveToFolder: (folderId: string | undefined) => void;
}

function ConvItem({ conv, isActive, isRenaming, renameValue, menuOpen, onSelect, onDelete, onPin, onRenameStart, onRenameSubmit, onRenameChange, onMenuOpen, folders, onMoveToFolder }: ConvItemProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen, onMenuOpen]);

  return (
    <div className="relative group">
      <div
        onClick={onSelect}
        className={`flex items-center gap-2 px-2 py-2 rounded-xl cursor-pointer transition-all ${
          isActive
            ? 'bg-white/15 text-white'
            : 'text-white/60 hover:text-white/90 hover:bg-white/10'
        }`}
      >
        <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />

        {isRenaming ? (
          <input
            type="text"
            value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onRenameSubmit(); if (e.key === 'Escape') onRenameChange(''); }}
            onBlur={onRenameSubmit}
            autoFocus
            className="flex-1 bg-white/10 border border-white/30 rounded-lg px-1.5 py-0.5 text-xs text-white outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 text-xs truncate min-w-0">{conv.title}</span>
        )}

        {conv.pinned && <Pin className="w-3 h-3 text-yellow-400 flex-shrink-0 opacity-70" />}

        {/* Menu button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onMenuOpen(!menuOpen); }}
          className="hidden group-hover:flex w-5 h-5 items-center justify-center rounded text-white/40 hover:text-white/80"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Context Menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute left-full top-0 ml-1 z-50 bg-[#111D36] border border-white/10 rounded-xl shadow-2xl w-44 py-1 text-xs"
        >
          <MenuItem icon={<PenLine className="w-3.5 h-3.5" />} label="Rename" onClick={() => { onRenameStart(); onMenuOpen(false); }} />
          <MenuItem icon={<Pin className="w-3.5 h-3.5" />} label={conv.pinned ? 'Unpin' : 'Pin'} onClick={() => { onPin(); onMenuOpen(false); }} />
          {folders.length > 0 && (
            <div className="border-t border-white/10 mt-1 pt-1">
              <p className="px-3 py-1 text-[10px] text-white/30 uppercase tracking-wider">Move to folder</p>
              {folders.map((f) => (
                <MenuItem key={f.id} label={f.name} onClick={() => { onMoveToFolder(f.id); onMenuOpen(false); }}>
                  <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: f.color }} />
                </MenuItem>
              ))}
            </div>
          )}
          <div className="border-t border-white/10 mt-1 pt-1">
            <MenuItem icon={<Trash2 className="w-3.5 h-3.5" />} label="Delete" onClick={() => { onDelete(); onMenuOpen(false); }} danger />
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger = false, children }: {
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 transition-colors ${
        danger ? 'text-red-400 hover:bg-red-500/10' : 'text-white/70 hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
      {icon}
      <span>{label}</span>
    </button>
  );
}
