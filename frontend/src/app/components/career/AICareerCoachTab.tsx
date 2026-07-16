import React, { useState } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { api } from '@/app/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Sparkles, Send, Bot, User, Loader2, HelpCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export function AICareerCoachTab() {
  const { language } = useLanguage();
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `### Namaste & Welcome to Sarthi Career Coach!\n\nI am your personal AI Career Mentor. Ask me anything regarding:\n- **Best Career Selection** based on your skills\n- **High ROI Certifications** (Google, AWS, NPTEL)\n- **ATS Resume Strategy** & Keyword Optimization\n- **Mock Interview Preparation** & STAR Frameworks`,
      time: 'Just now'
    }
  ]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMsg;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputMsg('');
    setLoading(true);

    try {
      const res = await api.post<{ response: string }>('/career/chat', {
        message: textToSend,
        userProfile: {
          targetCareer: 'Full Stack & AI Engineer',
          skills: ['Python', 'React', 'Problem Solving']
        }
      });

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.response || 'I am ready to help! Please specify your target job role.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Sorry, I encountered a temporary connection issue. Please try your question again.',
        time: 'Just now'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Which career is best for my current skills?',
    'What should I learn next for AI Engineering?',
    'Which certification gives the highest salary boost?',
    'Give me 3 practical interview tips for technical rounds',
    'How do I switch from non-IT to Full Stack development?'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-yellow-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powered by Google Gemini AI</span>
          </span>
          <h2 className="text-2xl font-extrabold">
            {language === 'hi' ? 'AI करियर कोच व मेंटर' : 'Sarthi Career Coach Assistant'}
          </h2>
          <p className="text-gray-300 text-sm mt-0.5">
            {language === 'hi'
              ? 'करियर चयन, कौशल सुधार, रेज़्यूमे और इंटरव्यू से जुड़े किसी भी सवाल का तुरंत उत्तर पाएं'
              : 'Ask any question about skills, roadmaps, job switching, or certifications'}
          </p>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-gray-500 mr-1">Suggested Questions:</span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200 text-xs font-semibold transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Transcript Area */}
      <Card className="border shadow-md bg-white rounded-2xl overflow-hidden flex flex-col h-[520px]">
        <CardContent className="p-5 flex-1 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div
                className={`max-w-[82%] p-4 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 rounded-bl-none'
                }`}
              >
                <div className="text-xs font-bold mb-1 opacity-70 flex justify-between gap-4">
                  <span>{msg.sender === 'user' ? 'You' : 'Sarthi Coach'}</span>
                  <span>{msg.time}</span>
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-line">
                  {msg.text}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span className="text-xs font-semibold text-gray-700">Gemini AI Coach is thinking...</span>
              </div>
            </div>
          )}
        </CardContent>

        {/* Input Bar */}
        <div className="p-4 bg-gray-50 border-t flex items-center gap-3">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your career question here..."
            className="flex-1 h-12 px-4 rounded-xl border border-gray-300 text-sm focus:border-purple-600 focus:outline-none"
          />
          <Button
            onClick={() => handleSend()}
            disabled={loading || !inputMsg.trim()}
            className="h-12 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl"
          >
            <span>Send</span>
            <Send className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
