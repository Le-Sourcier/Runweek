// import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
// import { SendHorizontal, User, Bot, HelpCircle } from "lucide-react";
// import { Message } from "../../types/AiCoach";

import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import {
  SendHorizontal,
  User,
  Bot,
  HelpCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Message } from "../../types/AiCoach";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(localizedFormat);

// 1. Define Types/Interfaces
export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai" | "system";
  timestamp: Date;
}

export interface Suggestion {
  id: string;
  text: string;
}

export interface ChatInterfaceProps {
  initialMessages?: Message[];
  onSendMessage: (messageText: string) => Promise<void>;
  suggestionChips?: Suggestion[];
  onSuggestionClick?: (suggestion: Suggestion) => void; // Optional, as not all chats need suggestions
  onTalkToHumanClick?: () => void; // Optional
  isLoadingAiResponse?: boolean;
  pendingMessages?: Set<string>;
  failedMessages?: Map<string, string>;
  onRetryMessage?: (messageId: string) => void;
  className?: string; // To allow parent to set height/width etc.
}

// 2. Component Structure
// const ChatInterface: React.FC<ChatInterfaceProps> = ({
//   initialMessages = [],
//   onSendMessage,
//   suggestionChips,
//   onSuggestionClick,
//   onTalkToHumanClick,
//   isLoadingAiResponse = false,
//   className = "h-full",
// }) => {
//   const [messages, setMessages] = useState<Message[]>(initialMessages);
//   const [inputValue, setInputValue] = useState<string>("");

//   const chatScrollRef = useRef<HTMLDivElement | null>(null);

//   const textareaRef = useRef<null | HTMLTextAreaElement>(null);

//   useEffect(() => {
//     setMessages(initialMessages);
//   }, [initialMessages]);

//   useEffect(() => {
//     if (chatScrollRef.current) {
//       chatScrollRef.current.scrollTo({
//         top: chatScrollRef.current.scrollHeight,
//         behavior: "smooth",
//       });
//     }
//   }, [messages, isLoadingAiResponse]);

//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto";
//       textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
//     }
//   }, [inputValue]);

//   const handleSendMessageInternal = async () => {
//     const trimmedInput = inputValue.trim();
//     if (!trimmedInput) return;
//     await onSendMessage(trimmedInput);
//     setInputValue("");
//   };

//   const handleSuggestionClickInternal = (suggestion: Suggestion) => {
//     if (onSuggestionClick) {
//       onSuggestionClick(suggestion);
//     }
//   };

//   const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
//     if (event.key === "Enter" && !event.shiftKey) {
//       event.preventDefault();
//       handleSendMessageInternal();
//     }
//   };

//   // Correction principale : affichage du texte du message selon le type
//   const getMessageText = (message: Message) => {
//     // Pour compatibilité, on affiche message.message ou message.text ou message.content
//     return message.message;
//   };

//   return (
//     <div className={`flex flex-col bg-background rounded-lg ${className}`}>
//       {/* Message display area */}
//       <div
//         className="flex-1 overflow-y-auto p-4 space-y-4"
//         ref={chatScrollRef}
//         id="chat-scrollable"
//       >
//         {messages.map((message) => {
//           // Détection du type de message
//           const isUser = message.sender === "user";
//           const isBot = message.sender === "bot";
//           const isSystem = message.sender === "system";

//           return (
//             <div
//               key={message.id}
//               className={`w-full flex ${
//                 isUser
//                   ? "justify-end"
//                   : isBot
//                   ? "justify-start"
//                   : "justify-center"
//               }`}
//             >
//               {/* Bulle pour BOT */}
//               {isBot && (
//                 <div className="flex items-end gap-2 max-w-[75%]">
//                   <Bot size={22} className="text-primary flex-shrink-0 mb-1" />
//                   <div className="bg-muted text-muted-foreground rounded-2xl rounded-bl-sm px-4 py-2 shadow-md border border-border">
//                     <p className="text-sm whitespace-pre-line dark:text-white">
//                       {getMessageText(message)}
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {/* Bulle pour USER */}
//               {isUser && (
//                 <div className="flex items-end gap-2 max-w-[75%] flex-row-reverse">
//                   <User size={22} className="text-primary flex-shrink-0 mb-1" />
//                   <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2 shadow-md border border-primary">
//                     <p className="text-sm whitespace-pre-line text-white">
//                       {getMessageText(message)}
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {/* Message SYSTEM */}
//               {isSystem && (
//                 <div className="w-full flex justify-center">
//                   <div className="bg-accent text-accent-foreground text-xs px-3 py-1 rounded-full shadow-sm border border-border opacity-80">
//                     {getMessageText(message)}
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })}

//         {isLoadingAiResponse && (
//           <div className="flex items-center gap-2 text-sm text-muted-foreground self-start">
//             <Bot size={24} className="text-primary flex-shrink-0" />
//             <div className="bg-muted p-2.5 rounded-lg rounded-bl-none shadow-sm flex items-center">
//               <span className="inline-flex gap-1">
//                 <span
//                   className="w-2 h-2 bg-primary rounded-full animate-bounce"
//                   style={{ animationDelay: "0ms" }}
//                 />
//                 <span
//                   className="w-2 h-2 bg-primary rounded-full animate-bounce"
//                   style={{ animationDelay: "150ms" }}
//                 />
//                 <span
//                   className="w-2 h-2 bg-primary rounded-full animate-bounce"
//                   style={{ animationDelay: "300ms" }}
//                 />
//               </span>
//               <span className="ml-2">AI is typing...</span>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Suggestion chips area */}
//       {suggestionChips && suggestionChips.length > 0 && onSuggestionClick && (
//         <div className="p-2 flex flex-wrap gap-2 border-t border-border">
//           {suggestionChips.map((chip) => (
//             <button
//               key={chip.id}
//               onClick={() => handleSuggestionClickInternal(chip)}
//               className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-foreground rounded-full transition-colors"
//             >
//               {chip.text}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* Input area */}
//       <div className="border-t border-border p-2 flex items-center gap-2 bg-card rounded-b-lg">
//         <textarea
//           ref={textareaRef}
//           value={inputValue}
//           onChange={(e) => setInputValue(e.target.value)}
//           onKeyDown={handleKeyDown}
//           placeholder="Type your message..."
//           className="flex-1 p-2.5 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-primary max-h-24 overflow-y-auto text-sm"
//           rows={1}
//         />
//         <button
//           onClick={handleSendMessageInternal}
//           disabled={!inputValue.trim() || isLoadingAiResponse}
//           className="p-2.5 bg-primary text-primary-foreground rounded-lg disabled:opacity-60 hover:bg-primary/90 transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
//           aria-label="Send message"
//         >
//           <SendHorizontal size={20} />
//         </button>
//       </div>

//       {/* "Talk to Human" button area */}
//       {onTalkToHumanClick && (
//         <div className="p-2 border-t border-border text-center bg-card rounded-b-lg">
//           <button
//             onClick={onTalkToHumanClick}
//             className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1 mx-auto"
//           >
//             <HelpCircle size={14} />
//             Talk to a Human
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  initialMessages = [],
  onSendMessage,
  suggestionChips,
  onSuggestionClick,
  onTalkToHumanClick,
  isLoadingAiResponse = false,
  pendingMessages = new Set(),
  failedMessages = new Map(),
  onRetryMessage,
  className = "h-full",
}) => {
  const messages = initialMessages;
  const [inputValue, setInputValue] = useState<string>("");

  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<null | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoadingAiResponse]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSendMessageInternal = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;
    await onSendMessage(trimmedInput);
    setInputValue("");
  };

  const handleSuggestionClickInternal = (suggestion: Suggestion) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessageInternal();
    }
  };

  // Affichage du texte du message
  const getMessageText = (message: Message) => message.message;

  // Fonction pour formater l'heure d'un message
  const formatMessageTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = dayjs(dateString);
    return date.format("HH:mm");
  };

  // Fonction pour grouper les messages par jour
  const groupMessagesByDay = (messages: Message[]) => {
    const groups: { label: string; date: string; items: Message[] }[] = [];
    let lastLabel = "";
    messages.forEach((msg) => {
      const date = dayjs(msg.createdAt);
      let label = "";
      if (date.isToday()) label = "Aujourd'hui";
      else if (date.isYesterday()) label = "Hier";
      else if (dayjs().diff(date, "day") < 7) label = date.format("dddd");
      else label = date.format("DD/MM/YYYY");

      if (label !== lastLabel) {
        groups.push({ label, date: date.format("YYYY-MM-DD"), items: [msg] });
        lastLabel = label;
      } else {
        groups[groups.length - 1].items.push(msg);
      }
    });
    return groups;
  };

  const groupedMessages = groupMessagesByDay(messages);

  return (
    <div className={`flex flex-col bg-background rounded-lg ${className}`}>
      {/* Message display area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        ref={chatScrollRef}
        id="chat-scrollable"
      >
        {groupedMessages.map((group) => (
          <React.Fragment key={group.date}>
            {/* Bandeau de date */}
            <div className="flex justify-center my-2">
              <span className="bg-accent text-accent-foreground text-xs px-3 py-1 rounded-full shadow-sm border border-border opacity-80">
                {group.label}
              </span>
            </div>
            {group.items.map((message) => {
              const isUser = message.sender === "user";
              const isBot = message.sender === "bot";
              const isSystem = message.sender === "system";
              return (
                <div
                  key={message.id}
                  className={`w-full flex ${
                    isUser
                      ? "justify-end"
                      : isBot
                      ? "justify-start"
                      : "justify-center"
                  }`}
                >
                  {/* Bulle pour BOT */}
                  {isBot && (
                    <div className="flex items-end gap-2 max-w-[75%]">
                      <Bot
                        size={22}
                        className="text-primary flex-shrink-0 mb-1"
                      />
                      <div className="bg-muted text-muted-foreground rounded-2xl rounded-bl-sm px-4 py-2 shadow-md border border-border relative">
                        <p className="text-sm whitespace-pre-line dark:text-white">
                          {getMessageText(message)}
                        </p>
                        <span className="absolute bottom-1 right-2 text-[10px] text-muted-foreground opacity-70">
                          {formatMessageTime(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Bulle pour USER */}
                  {isUser && (
                    <div className="flex items-end gap-2 max-w-[75%] flex-row-reverse">
                      <User
                        size={22}
                        className="text-primary flex-shrink-0 mb-1"
                      />
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2 shadow-md border border-primary relative">
                        <p className="text-sm whitespace-pre-line text-white mb-[9px]">
                          {getMessageText(message)}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className=" absolute bottom-[-3px] right-2 text-[10px] text-primary-foreground opacity-70">
                            {formatMessageTime(message.createdAt)}
                          </span>
                          {/* Status indicators */}
                          <div className="flex items-center gap-1 absolute bottom-[-3px] right-12">
                            {pendingMessages.has(message.id!) && (
                              <Clock
                                size={12}
                                className="text-primary-foreground opacity-70 animate-pulse"
                                title="Message en cours d'envoi..."
                              />
                            )}
                            {failedMessages.has(message.id) && (
                              <div className="flex items-center gap-1">
                                <AlertTriangle
                                  size={12}
                                  className="text-red-300 cursor-help"
                                  title={
                                    failedMessages.get(message.id) ||
                                    "Échec d'envoi"
                                  }
                                />
                                {onRetryMessage && (
                                  <RotateCcw
                                    size={12}
                                    className="text-primary-foreground opacity-70 cursor-pointer hover:opacity-100"
                                    title="Renvoyer le message"
                                    onClick={() => onRetryMessage(message.id)}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message SYSTEM */}
                  {isSystem && (
                    <div className="w-full flex justify-center">
                      <div className="bg-accent text-accent-foreground text-xs px-3 py-1 rounded-full shadow-sm border border-border opacity-80">
                        {getMessageText(message)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}

        {isLoadingAiResponse && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground self-start">
            <Bot size={24} className="text-primary flex-shrink-0" />
            <div className="bg-muted p-2.5 rounded-lg rounded-bl-none shadow-sm flex items-center">
              <span className="inline-flex gap-1">
                <span
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </span>
              <span className="ml-2">AI is typing...</span>
            </div>
          </div>
        )}
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
        <div className="p-2 border-t border-border text-center bg-card rounded-b-lg">
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
