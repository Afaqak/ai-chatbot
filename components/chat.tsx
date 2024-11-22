"use client";

import type { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useWindowSize } from "usehooks-ts";

import { ChatHeader } from "@/components/chat-header";
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
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [responseOption, setResponseOption] = useState("default");

  const { mutate } = useSWRConfig();

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    data: streamingData,
  } = useChat({
    body: { id, modelId: selectedModelId },
    initialMessages,

    onFinish: () => {
      mutate("/api/history");
    },
  });

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

  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher
  );

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  console.log(messages);
  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader selectedModelId={selectedModelId} />
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
              vote={
                votes
                  ? votes.find((vote) => vote.messageId === message.id)
                  : undefined
              }
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
        <form className="flex flex-col mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          <MultimodalInput
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            setMessages={setMessages}
            append={append}
          />

          <footer className="border-t bg-white p-4 sticky bottom-0 left-0 right-0">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-white hover:bg-gray-100 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Add documents
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-white hover:bg-gray-100 transition-colors"
                >
                  <LinkIcon className="h-4 w-4" />3 files
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-white hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-sm mr-1">
                        {selectedJurisdiction.icon}
                      </span>
                      {selectedJurisdiction.name}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Select Jurisdiction</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {jurisdictions.map((jurisdiction) => (
                      <DropdownMenuItem
                        key={jurisdiction.name}
                        onClick={() => setSelectedJurisdiction(jurisdiction)}
                        className="flex items-center"
                      >
                        <span className="text-sm mr-2">
                          {jurisdiction.icon}
                        </span>
                        {jurisdiction.name}
                        {selectedJurisdiction.name === jurisdiction.name && (
                          <span className="ml-auto">✓</span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-white hover:bg-gray-100 transition-colors"
                    >
                      <Languages className="h-4 w-4" />
                      {selectedLanguage.name}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {languages.map((language) => (
                      <DropdownMenuItem
                        key={language.code}
                        // onClick={() => setSelectedLanguage(language)}
                      >
                        {language.name}
                        {selectedLanguage.code === language.code && (
                          <span className="ml-auto">✓</span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-white hover:bg-gray-100 transition-colors"
                    >
                      Response Type
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Select Response Type</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {responseOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        // onClick={() => setResponseOption(option.value)}
                      >
                        {option.name}
                        {/* {responseOption === option.value && (
                          <span className="ml-auto">✓</span>
                        )} */}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </footer>
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
            append={append}
            block={block}
            setBlock={setBlock}
            messages={messages}
            setMessages={setMessages}
            votes={votes}
          />
        )}
      </AnimatePresence>

      <BlockStreamHandler streamingData={streamingData} setBlock={setBlock} />
    </>
  );
}
