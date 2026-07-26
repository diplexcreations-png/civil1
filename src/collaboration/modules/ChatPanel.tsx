import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { useCollab } from '../CollaborationContext';
import { Card } from './shared';

export default function ChatPanel() {
  const { state, currentChatMessages, sendChatMessage } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChatMessages]);

  const handleSend = () => {
    sendChatMessage(pid, text);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-220px)]">
      <Card className="flex-1 flex flex-col mb-3">
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {currentChatMessages.map(msg => (
            <div key={msg.id} className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] text-[9px] font-bold shrink-0">
                {msg.senderName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#0F172A] dark:text-white">{msg.senderName}</span>
                  <span className="text-[8px] text-[#94A3B8]">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-[11px] text-[#475569] dark:text-[#CBD5E1] whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {currentChatMessages.length === 0 && (
            <p className="text-[#94A3B8] text-center py-8 text-xs">No messages yet. Start the conversation!</p>
          )}
          <div ref={bottomRef} />
        </div>
      </Card>

      <div className="flex items-center gap-2 bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-2">
        <button className="p-1.5 text-[#64748B] hover:text-[#2563EB] rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] cursor-pointer">
          <Paperclip className="w-4 h-4" />
        </button>
        <input type="text" value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="Type a message..." className="flex-1 bg-transparent border-none outline-none text-xs text-[#0F172A] dark:text-white placeholder:text-[#94A3B8]" />
        <button onClick={handleSend} disabled={!text.trim()}
          className="p-1.5 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors cursor-pointer disabled:opacity-50">
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
