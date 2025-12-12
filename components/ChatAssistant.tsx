import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Zap, BrainCircuit, RefreshCw, Mic, MicOff, Image as ImageIcon, X } from 'lucide-react';
import { BusinessStrategy, ChatMessage } from '../types';
import { chatWithStrategy } from '../services/geminiService';

interface ChatAssistantProps {
  strategy: BusinessStrategy;
}

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ strategy }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hi, I’m your StratGen AI Assistant. I can analyze images, edit them with Nano Banana technology, or find locations using Google Maps. How can I help?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
         setInput(prev => {
            const trailingSpace = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
            return prev + trailingSpace + finalTranscript;
         });
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e?: React.FormEvent, textOverride?: string) => {
    if (e) e.preventDefault();
    
    // Determine the text content to send (override or input state)
    const textToSend = textOverride !== undefined ? textOverride : input;

    if ((!textToSend.trim() && !selectedImage) || isLoading) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = textToSend;
    const currentImage = selectedImage || undefined;
    
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await chatWithStrategy(
        messages, 
        currentInput, 
        strategy, 
        useThinking,
        currentImage
      );

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        image: response.image,
        isThinking: useThinking
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I encountered an issue connecting to the AI. Please try again."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm flex flex-col h-[600px] overflow-hidden animate-fadeIn relative" aria-label="AI Chat Assistant">
       {/* Header */}
      <div className="bg-zinc-950/50 p-4 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20" aria-hidden="true">
                <Bot className="w-6 h-6 text-black" />
            </div>
            <div>
                <h3 className="font-bold text-white">StratGen Consultant</h3>
                <p className="text-xs text-zinc-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" aria-hidden="true"></span>
                    Online
                </p>
            </div>
        </div>

        <button 
            onClick={() => setUseThinking(!useThinking)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                useThinking 
                ? 'bg-purple-500/10 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
            }`}
            aria-pressed={useThinking}
        >
            {useThinking ? (
                <>
                    <BrainCircuit className="w-3.5 h-3.5" aria-hidden="true" />
                    Reasoning Mode (Pro)
                </>
            ) : (
                <>
                    <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                    Fast Mode & Maps
                </>
            )}
        </button>
      </div>

      {/* Messages */}
      <div 
        className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
        role="log"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.map((msg) => (
            <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
                {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700" aria-hidden="true">
                        <Bot className="w-4 h-4 text-zinc-400" />
                    </div>
                )}
                
                <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                    {msg.image && (
                        <div className={`p-1 bg-zinc-800 rounded-xl border border-zinc-700 inline-block ${msg.role === 'user' ? 'float-right' : ''}`}>
                            <img src={msg.image} alt="Attached" className="max-w-full h-auto max-h-48 rounded-lg" />
                        </div>
                    )}
                    {msg.text && (
                        <div 
                            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                                msg.role === 'user' 
                                ? 'bg-yellow-500 text-black font-medium rounded-tr-none' 
                                : 'bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-tl-none'
                            }`}
                        >
                            {msg.text}
                            {msg.isThinking && (
                                <div className="mt-2 pt-2 border-t border-zinc-700/50 flex items-center gap-1.5 text-[10px] text-purple-400 font-medium uppercase tracking-wider">
                                    <BrainCircuit className="w-3 h-3" aria-hidden="true" />
                                    Thought Process Used
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0 border border-yellow-500/20" aria-hidden="true">
                        <User className="w-4 h-4 text-yellow-500" />
                    </div>
                )}
            </div>
        ))}
        {isLoading && (
            <div className="flex gap-3 justify-start" aria-live="polite">
                 <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700">
                    <Bot className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="bg-zinc-800 px-4 py-3 rounded-2xl rounded-tl-none border border-zinc-700 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
                    <span className="text-xs text-zinc-400 animate-pulse">
                        {useThinking ? "Reasoning..." : "Processing..."}
                    </span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-800">
        {selectedImage && (
            <div className="mb-3 flex items-start">
                <div className="relative group">
                    <img src={selectedImage} alt="Selected" className="h-20 w-auto rounded-lg border border-zinc-700" />
                    <button 
                        onClick={() => setSelectedImage(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                        aria-label="Remove attached image"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
                <div className="ml-3 text-xs text-zinc-400 mt-2">
                    Image attached. Ask to "Analyze this" or "Add a filter".
                </div>
            </div>
        )}
        
        <form onSubmit={(e) => handleSend(e)} className="relative flex items-center gap-2">
             <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageSelect}
                aria-hidden="true"
                tabIndex={-1}
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700 transition-all flex items-center justify-center shrink-0 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                title="Attach Image"
                aria-label="Attach Image"
            >
                <ImageIcon className="w-5 h-5" aria-hidden="true" />
            </button>

            <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-xl transition-all flex items-center justify-center shrink-0 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                    isListening
                    ? 'bg-red-500/20 text-red-500 animate-pulse border border-red-500/50'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700'
                }`}
                title="Voice Command"
                aria-label={isListening ? "Stop Voice Input" : "Start Voice Input"}
                aria-pressed={isListening}
            >
                {isListening ? <MicOff className="w-5 h-5" aria-hidden="true" /> : <Mic className="w-5 h-5" aria-hidden="true" />}
            </button>

            <label htmlFor="chat-input" className="sr-only">Type your message</label>
            <input 
                id="chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                    isListening ? "Listening..." : 
                    selectedImage ? "Describe what to do with the image..." : 
                    "Ask strategy or describe image..."
                }
                className="w-full bg-zinc-900 text-white rounded-xl pl-4 pr-12 py-3 border border-zinc-800 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 placeholder-zinc-500 text-sm transition-all min-w-[50px]"
            />
            <button 
                type="submit"
                disabled={(!input.trim() && !selectedImage) || isLoading}
                className="absolute right-2 p-1.5 rounded-lg bg-yellow-500 text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Send Message"
            >
                <Send className="w-4 h-4" aria-hidden="true" />
            </button>
        </form>
        <div className="text-center mt-2 flex items-center justify-center gap-2">
            <p className="text-[10px] text-zinc-500">
                AI can make mistakes. Check important info.
            </p>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;