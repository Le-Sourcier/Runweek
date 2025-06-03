import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { SendHorizontal, User, Bot, HelpCircle, Loader2 } from 'lucide-react';

// 1. Define Types/Interfaces
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
}

export interface Suggestion {
  id: string;
  text: string;
}

export interface ChatInterfaceProps {
  initialMessages?: ChatMessage[];
  onSendMessage: (messageText: string) => Promise<void>;
  suggestionChips?: Suggestion[];
  onSuggestionClick?: (suggestion: Suggestion) => void; // Optional, as not all chats need suggestions
  onTalkToHumanClick?: () => void; // Optional
  isLoadingAiResponse?: boolean;
  className?: string; // To allow parent to set height/width etc.
}

// 2. Component Structure
const ChatInterface: React.FC<ChatInterfaceProps> = ({
  initialMessages = [],
  onSendMessage,
  suggestionChips,
  onSuggestionClick,
  onTalkToHumanClick,
  isLoadingAiResponse = false,
  className = "h-full", // Default to full height of its container
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState<string>('');
  // isAiTyping state is directly controlled by isLoadingAiResponse prop
  // const [isAiTyping, setIsAiTyping] = useState<boolean>(false);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const textareaRef = useRef<null | HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoadingAiResponse]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set to scroll height
    }
  }, [inputValue]);


  // 3. Handler Functions (Internal)
  const handleSendMessageInternal = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    // Optionally, add user message to local state immediately for responsiveness
    // Or wait for parent to update initialMessages if it's managing the full state
    // For this example, let's assume parent updates initialMessages, which flows down.
    // If not, you'd do:
    // setMessages(prev => [...prev, { id: Date.now().toString(), text: trimmedInput, sender: 'user', timestamp: new Date() }]);

    await onSendMessage(trimmedInput);
    setInputValue('');
  };

  const handleSuggestionClickInternal = (suggestion: Suggestion) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
    // Optionally, send suggestion as a message directly
    // onSendMessage(suggestion.text);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessageInternal();
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col bg-background rounded-lg ${className}`}>
      {/* Message display area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end gap-2 ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.sender === 'ai' && (
              <Bot size={24} className="text-primary flex-shrink-0 mb-1" />
            )}
            <div
              className={`p-2.5 rounded-lg shadow-sm break-words ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground self-end rounded-br-none max-w-[70%] sm:max-w-[60%]'
                  : message.sender === 'ai'
                  ? 'bg-muted text-muted-foreground self-start rounded-bl-none max-w-[70%] sm:max-w-[60%]'
                  : 'text-xs text-center text-muted-foreground w-full py-1 my-1' // System message
              }`}
            >
              <p className="text-sm">{message.text}</p>
              {message.sender !== 'system' && (
                 <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70 text-left'}`}>
                    {formatTimestamp(message.timestamp)}
                 </p>
              )}
            </div>
            {message.sender === 'user' && (
              <User size={24} className="text-muted-foreground flex-shrink-0 mb-1" />
            )}
          </div>
        ))}
        {isLoadingAiResponse && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground self-start">
            <Bot size={24} className="text-primary flex-shrink-0" />
            <div className="bg-muted p-2.5 rounded-lg rounded-bl-none shadow-sm">
              <Loader2 size={16} className="animate-spin mr-1 inline-block" />
              AI is typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion chips area */}
      {suggestionChips && suggestionChips.length > 0 && onSuggestionClick && (
        <div className="p-2 flex flex-wrap gap-2 border-t border-border">
          {suggestionChips.map((chip) => (
            <button
              key={chip.id}
              onClick={() => handleSuggestionClickInternal(chip)}
              className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-foreground rounded-full transition-colors"
            >
              {chip.text}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-border p-2 flex items-center gap-2 bg-card rounded-b-lg">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 p-2.5 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-primary max-h-24 overflow-y-auto text-sm"
          rows={1}
        />
        <button
          onClick={handleSendMessageInternal}
          disabled={!inputValue.trim() || isLoadingAiResponse}
          className="p-2.5 bg-primary text-primary-foreground rounded-lg disabled:opacity-60 hover:bg-primary/90 transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
          aria-label="Send message"
        >
          <SendHorizontal size={20} />
        </button>
      </div>

      {/* "Talk to Human" button area */}
      {onTalkToHumanClick && (
         <div className="p-2 border-t border-border text-center bg-card rounded-b-lg"> {/* Ensure consistent bg for rounded corners */}
          <button
            onClick={onTalkToHumanClick}
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            <HelpCircle size={14} />
            Talk to a Human
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
