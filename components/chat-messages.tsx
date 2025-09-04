"use client";

import { Companion } from "@prisma/client";
import ChatMessage, { ChatMessageProps } from "@/components/chat-message";
import { ComponentRef, useEffect, useRef, useState } from "react";

interface ChatMessagesProps {
  isLoading: boolean;
  companion: Companion;
  messages: ChatMessageProps[];
}

const ChatMessages = ({ isLoading, companion, messages }: ChatMessagesProps) => {
  const scrollRef = useRef<ComponentRef<"div">>(null);
  const [fakeLoading, setFakeLoading] = useState(messages.length === 0 ? true : false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFakeLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-y-auto pr-4">
      <ChatMessage
        role="system"
        isLoading={fakeLoading}
        src={companion.src}
        content={`Hello, I'm ${companion.name}, ${companion.description}.`}
      />
      {messages.map((message) => (
        <ChatMessage
          key={message.content}
          role={message.role}
          content={message.content}
          src={message.src}
        />
      ))}
      {isLoading && <ChatMessage role="system" src={companion.src} isLoading />}
      <div ref={scrollRef} />
    </div>
  );
};

export { ChatMessages };
