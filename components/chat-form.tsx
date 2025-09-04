"use client";

import { ChangeEvent, FormEvent } from "react";
import { ChatRequestOptions } from "ai";
import { SendHorizonal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatFormProps {
  input: string;
  isLoading: boolean;
  handleInputChange: (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (
    e: FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions | undefined
  ) => void;
}

const ChatForm = ({ input, isLoading, handleInputChange, onSubmit }: ChatFormProps) => {
  return (
    <form className="border-t border-primary/10 py-4 flex items-center gap-x-2" onSubmit={onSubmit}>
      <Input
        value={input}
        placeholder="Type a message"
        className="rounded-lg bg-primary/10"
        disabled={isLoading}
        onChange={handleInputChange}
      />
      <Button disabled={isLoading} variant="ghost">
        <SendHorizonal className="w-6 h-6" />
      </Button>
    </form>
  );
};

export { ChatForm };
