
import React, { useState, useEffect, useRef } from 'react';
import { UserProfileData, ChatMessage } from '../types';
import { createContentStrategistChat } from '../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';
import ReactMarkdown from 'react-markdown';

interface Props {
  userData: UserProfileData;
  systemInstruction: string;
  initialHistory: ChatMessage[];
  onHistoryUpdate: (history: ChatMessage[]) => void;
}

const PostWriter: React.FC<Props> = ({ userData, systemInstruction, initialHistory, onHistoryUpdate }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(initialHistory);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat with the CUSTOM system instruction generated in ProfileBuilder
    // We pass existing history to context window
    const chatInstance = createContentStrategistChat(systemInstruction, initialHistory);
    setChat(chatInstance);

    // If empty history, add a welcoming message (local only, technically model didn't say it yet but it's good UX)
    if (initialHistory.length === 0) {
       const welcomeMsg: ChatMessage = { 
           role: 'model', 
           text: `Hello ${userData.fullName}. I have been trained on your approved profile strategy.\n\n**Headline:** *Loaded*\n**About:** *Loaded*\n**Tone:** *${userData.tone}*\n\nI am ready to write your next LinkedIn post. What's on your mind?` 
       };
       setMessages([welcomeMsg]);
       onHistoryUpdate([welcomeMsg]);
    }
  }, [systemInstruction]); // Re-init if instruction changes

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim() || !chat) return;

    const userMsgText = inputText;
    const newUserMsg: ChatMessage = { role: 'user', text: userMsgText };
    
    // UI update immediate
    const newHistory = [...messages, newUserMsg];
    setMessages(newHistory);
    onHistoryUpdate(newHistory); // Persist
    
    setInputText('');
    setIsTyping(true);

    try {
      const result = await chat.sendMessageStream({ message: userMsgText });
      
      let fullResponse = "";
      // Add placeholder for model response
      setMessages(prev => [...prev, { role: 'model', text: "" }]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        const text = c.text || "";
        fullResponse += text;
        
        setMessages(prev => {
            const newArr = [...prev];
            newArr[newArr.length - 1].text = fullResponse;
            return newArr;
        });
      }

      // Final update to persistence after stream done
      onHistoryUpdate([...newHistory, { role: 'model', text: fullResponse }]);

    } catch (error) {
      console.error("Chat Error", error);
      const errorMsg: ChatMessage = { role: 'model', text: "Connection error. Please check your API key or internet connection." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
       <div className="mb-4 flex-shrink-0 flex justify-between items-end">
        <div>
            <h2 className="text-3xl font-bold text-slate-900">Content Studio</h2>
            <p className="text-slate-600">Your fully trained AI strategist is ready.</p>
        </div>
        <div className="text-xs text-slate-400 px-3 py-1 bg-slate-100 rounded-full">
            Connected as {userData.businessName}
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
              }`}>
                 {msg.role === 'user' ? (
                   <p className="whitespace-pre-wrap">{msg.text}</p>
                 ) : (
                   <div className="prose prose-indigo max-w-none text-sm">
                     <ReactMarkdown>{msg.text}</ReactMarkdown>
                   </div>
                 )}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-4 shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Draft a post about..."
              className="w-full p-4 pr-16 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none shadow-sm"
              rows={3}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isTyping}
              className="absolute right-3 bottom-3 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostWriter;
