import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage } from '../types';

interface ChatRoomProps {
  apiKey: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ apiKey }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Hello! I am Gemnai, your AI host. Welcome to the lounge! I can chat, tell stories, or just hang out. What is on your mind?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use a ref to persist the chat session across renders
  const chatSessionRef = useRef<Chat | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getChatSession = () => {
    if (!chatSessionRef.current) {
      const ai = new GoogleGenAI({ apiKey });
      chatSessionRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: 'You are Gemnai, a smart, witty, and friendly AI host in a virtual social app called "ChatBot". You speak fluent Bengali and English. You love to chat, help users, and play text-based games. Keep responses conversational and concise.',
        },
      });
    }
    return chatSessionRef.current;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const chat = getChatSession();
      const resultStream = await chat.sendMessageStream({ message: userMsg.text });

      // Create a placeholder message for the AI response
      const botMsgId = (Date.now() + 1).toString();
      let fullText = '';
      
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        text: '',
        timestamp: new Date()
      }]);

      for await (const chunk of resultStream) {
        const textChunk = chunk.text || '';
        fullText += textChunk;
        
        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId ? { ...msg, text: fullText } : msg
        ));
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Sorry, I lost connection for a moment. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <div className="p-4 border-b border-pink-100 bg-white/70 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
            <div className="absolute top-0 left-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75"></div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Global Chat</h2>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">Gemnai</span>
              <span className="text-xs text-slate-400">is active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {msg.role === 'model' && (
              <span className="text-[10px] font-bold text-violet-600 mb-1 ml-1 tracking-wider uppercase">Gemnai ✨</span>
            )}
            <div
              className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-4 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-tr-none shadow-pink-200'
                  : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-slate-100'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed font-medium">{msg.text}</p>
              <span className={`text-[10px] mt-2 block ${msg.role === 'user' ? 'text-pink-100' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start">
             <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-pink-100 flex items-center gap-2 shadow-sm">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white/80 border-t border-pink-100 backdrop-blur-sm">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Message Gemnai..."
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 px-5 py-3 rounded-2xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all placeholder:text-slate-400 shadow-inner"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-pink-200 transition-all transform hover:scale-105"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;