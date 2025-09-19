import React, { useState } from 'react';
import { chat } from '../../api/aiClient';

export default function AIChat() {
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    if (msgs.length === 0) {
      setMsgs((m) => [
        ...m,
        { id: crypto.randomUUID(), role: 'assistant', text: 'Hi there! How can I help you today?' },
      ]);
    }
    setIsOpen(!isOpen);
  };

  type Message = {
    id: string;
    role: 'user' | 'assistant';
    text: string;
  };

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text };
    setMsgs((m) => [...m, userMsg]);
    setLoading(true);
    setInput('');

    try {
      const response = await chat(text);
      const reply = response.response;

      const aiMsg: Message = { id: crypto.randomUUID(), role: 'assistant', text: reply || '…' };
      setMsgs((m) => [...m, aiMsg]);
    } catch (e) {
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: 'Sorry, Something went wrong, please contact support.',
      };
      setMsgs((m) => [...m, aiMsg]);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function onKeyDown(e: any) {
    if (e.key === 'Enter' && !loading) {
      await send(input);
      e.preventDefault();
    }
  }

  return (
    <div className="z-50">
      {/* Chat Window */}
      <div
        className={`fixed bottom-32 right-12 w-[448px] bg-white rounded-xl shadow-2xl transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        {/* Chat Header */}
        <div className="bg-accent_secondary text-white p-4 rounded-t-xl flex justify-between items-center">
          <h3 className="font-bold text-lg">Peri</h3>
          <button onClick={toggleChat} className="hover:opacity-75">
            Close
          </button>
        </div>

        {/* Message Area */}
        <div className="p-4 h-96 overflow-y-auto flex flex-col space-y-4">
          {/* Existing Messages */}
          {msgs.map((m) => (
            <div
              key={m.id}
              className={m.role === 'assistant' ? 'flex justify-start' : 'flex justify-end'}
            >
              <div
                className={
                  m.role === 'assistant'
                    ? 'bg-gray-200 text-gray-800 p-3 rounded-lg max-w-xs'
                    : 'bg-accent_secondary text-white p-3 rounded-lg max-w-xs'
                }
              >
                {m.text}
              </div>
            </div>
          ))}

          {/* Loading Indicator Start ⏳ */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-xs">
                <div className="flex items-center justify-center space-x-1">
                  <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
          {/* Loading Indicator End */}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder={loading ? 'Thinking...' : 'Type your message...'}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent_secondary text-black"
              onChange={(e) => setInput(e.target.value)}
              value={input}
              disabled={loading}
              onKeyDown={onKeyDown}
            />
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={toggleChat}
        className="fixed bottom-12 right-12 bg-accent_secondary font-bold text-white rounded-full w-40 py-4 shadow-lg hover:bg-accent_secondary/70 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent_primary"
        aria-label="Toggle Chat"
      >
        {isOpen ? <p>Close</p> : <p>Chat with Peri</p>}
      </button>
    </div>
  );
}
