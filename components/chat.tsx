"use client";

import type { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { AnimatePresence } from "framer-motion";
import { FormEvent, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useWindowSize } from "usehooks-ts";

import { ChatHeader } from "@/app/(dashboard)/(chat)/chat/_components/chat-header";
import { PreviewMessage, ThinkingMessage } from "@/components/message";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import type { Vote } from "@/lib/db/schema";
import { fetcher } from "@/lib/utils";

import { Block, type UIBlock } from "./block";
import { BlockStreamHandler } from "./block-stream-handler";
import { MultimodalInput } from "./multimodal-input";
import { Overview } from "./overview";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ChevronDown, Send, Upload, LinkIcon, Languages } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useSearchParams } from "next/navigation";
import { useRealtimeChat } from "@/app/(dashboard)/(chat)/chat/_components/use-realtime-chat";

const jurisdictions = [
  { name: "Global", icon: "🌎" },
  { name: "Pakistan", icon: "🇵🇰" },
  { name: "UAE", icon: "🇦🇪" },
  { name: "Saudi Arabia", icon: "🇸🇦" },
  { name: "Qatar", icon: "🇶🇦" },
  { name: "Kuwait", icon: "🇰🇼" },
  { name: "Bahrain", icon: "🇧🇭" },
  { name: "Oman", icon: "🇴🇲" },
];

const languages = [
  { name: "English", code: "en" },
  { name: "Arabic", code: "ar" },
  { name: "Urdu", code: "ur" },
];

const responseOptions = [
  { name: "Default", value: "default" },
  { name: "Longer", value: "longer" },
  { name: "Shorter", value: "shorter" },
  { name: "Explanatory", value: "explanatory" },
  { name: "Cite Precedents", value: "precedents" },
  { name: "Relevant Statutes", value: "statutes" },
];

export function Chat({
  id,
  initialMessages,
  selectedModelId,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
}) {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState(
    jurisdictions[0]
  );

  const searchParams = useSearchParams();
  const conversation_id = searchParams.get("conversation_id");
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [responseOption, setResponseOption] = useState("default");
  const [input, setInput] = useState("");
  const { isLoading, messages, sendMessage, documents, setMessages } =
    useRealtimeChat(id, initialMessages);

  const { mutate } = useSWRConfig();

  // const {
  //   messages,
  //   setMessages,
  //   // handleSubmit,
  //   input,
  //   setInput,
  //   append,
  //   isLoading,
  //   stop,
  //   data: streamingData,
  // } = useChat({
  //   body: { id, modelId: selectedModelId },
  //   initialMessages,

  //   onFinish: () => {
  //     mutate("/api/history");
  //   },
  // });

  const { width: windowWidth = 1920, height: windowHeight = 1080 } =
    useWindowSize();

  const [block, setBlock] = useState<UIBlock>({
    documentId: "init",
    content: "",
    title: "",
    status: "idle",
    isVisible: false,
    boundingBox: {
      top: windowHeight / 4,
      left: windowWidth / 4,
      width: 250,
      height: 50,
    },
  });

  // const { data: votes } = useSWR<Array<Vote>>(
  //   `/api/vote?chatId=${id}`,
  //   fetcher
  // );

  // const fetchMessages = async () => {
  //   return (await fetch("/api/messages")).json();
  // };

  // const { data: messages } = useSWR(
  //   `/api/messages?conversation_id=${conversation_id}`,
  //   fetcher
  // );

  console.log(messages, "MESSAGES");

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const handleSubmit = async (e: FormEvent) => {
    console.log("hit");
    try {
      setMessages((prev) => [
        ...prev,
        {
          content: input,
          id: "",
          role: "user",
        },
      ]);

      const data = await sendMessage(input);
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <div
          ref={messagesContainerRef}
          className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
        >
          {/* {messages.length === 0 && <Overview />} */}

          {messages.map((message, index) => (
            <PreviewMessage
              key={message.id}
              chatId={id}
              message={message}
              block={block}
              setBlock={setBlock}
              isLoading={isLoading && messages.length - 1 === index}
              // vote={
              //   votes
              //     ? votes.find((vote) => vote.messageId === message.id)
              //     : undefined
              // }
            />
          ))}

          {isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "user" && (
              <ThinkingMessage />
            )}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl"
        >
          <MultimodalInput
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            // stop={stop}
            stop={() => {}}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            // setMessages={setMessages}
            // append={append}
          />

          {/* <Input value={input} onChange={(e) => setInput(e.target.value)} /> */}
        </form>
      </div>

      <AnimatePresence>
        {block?.isVisible && (
          <Block
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            // append={append}
            block={block}
            setBlock={setBlock}
            messages={messages}
            // setMessages={setMessages}
            // votes={votes}
          />
        )}
      </AnimatePresence>

      {/* <BlockStreamHandler  setBlock={setBlock} /> */}
    </>
  );
}
