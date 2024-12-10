"use client";

import type { Message } from "ai";
import cx from "classnames";
import { motion } from "framer-motion";
import type { Dispatch, SetStateAction } from "react";

import type { Vote } from "@/lib/db/schema";

import type { UIBlock } from "./block";
import { SparklesIcon } from "./icons";
import { Markdown } from "./markdown";
import { MessageActions } from "./message-actions";
import { PreviewAttachment } from "./preview-attachment";


export const PreviewMessage = ({
  chatId,
  message,
  block,
  setBlock,
  vote,
  isLoading,
}: {
  chatId: string;
  message: Message;
  block: UIBlock;
  setBlock: Dispatch<SetStateAction<UIBlock>>;
  vote: Vote | undefined;
  isLoading: boolean;
}) => {
  // Extract metadata safely
  const judgment = message?.metadata?.judgment;
  const sources = message?.metadata?.sources;

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={message.role}
    >
      <div
        className={cx(
          "group-data-[role=user]/message:bg-primary group-data-[role=user]/message:text-primary-foreground flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl"
        )}
      >
        {message.role === "assistant" && (
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
            <SparklesIcon size={14} />
          </div>
        )}
        
        <div className="flex flex-col gap-2 w-full">
          {/* Content Rendering */}
          {message.content && !message?.document_id ? (
            <div className="flex flex-col gap-4">
              <Markdown>{message.content as string}</Markdown>
            </div>
          ) : (
            message?.content &&
            message?.document_id && (
              <div
                onClick={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  const boundingBox = {
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                  };
                  setBlock({
                    documentId: message.document_id,
                    content: message?.content,
                    title: message?.documents?.title,
                    isVisible: true,
                    status: "idle",
                    boundingBox,
                  });
                }}
                className="bg-gray-100 cursor-pointer rounded-md shadow p-2 w-fit"
              >
                <div>{message?.content}</div>
              </div>
            )
          )}

          {/* Metadata Rendering */}
          {judgment && (
            <div 
              className={`
                flex flex-col gap-2 p-2 rounded-md 
                ${judgment.isPositive 
                  ? 'bg-green-50 text-green-800' 
                  : 'bg-red-50 text-red-800'}
              `}
            >
              <span className="font-semibold flex">
                {judgment.isPositive ? '✓' : '!'} Judgment:
              </span>
              <span>{judgment.text}</span>
            </div>
          )}

          {/* Sources Rendering */}
          {sources && sources.length > 0 && (
            <div className="bg-gray-50 p-2 rounded-md">
              <h4 className="font-semibold mb-2 text-gray-700">Sources:</h4>
              <ul className="space-y-1">
                {sources.map((source, index) => (
                  <li 
                    key={index} 
                    className="text-sm text-blue-600 hover:underline cursor-pointer"
                    onClick={() => source.url && window.open(source.url, '_blank')}
                  >
                    {source.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Attachments */}
          {message.experimental_attachments && (
            <div className="flex flex-row gap-2">
              {message.experimental_attachments.map((attachment) => (
                <PreviewAttachment
                  key={attachment.url}
                  attachment={attachment}
                />
              ))}
            </div>
          )}

          {/* Message Actions */}
          {!message?.document_id && (
            <MessageActions
              key={`action-${message.id}`}
              chatId={chatId}
              message={message}
              vote={vote}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};
export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          }
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
