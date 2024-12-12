"use client";

// import type { Message } from "ai";
import cx from "classnames";
import { motion } from "framer-motion";
import type { Dispatch, SetStateAction } from "react";

import type { Vote } from "@/lib/db/schema";

import type { UIBlock } from "./block";
import { SparklesIcon } from "./icons";
import { Markdown } from "./markdown";
import { MessageActions } from "./message-actions";
import { PreviewAttachment } from "./preview-attachment";
import { useSWRConfig } from "swr";
import { v4 as uuidv4 } from "uuid";

const CHUNK_SIZE = 30; // Size of each chunk
const CHUNK_DELAY = 50; // Delay in milliseconds between chunks

export const PreviewMessage = ({
	chatId,
	message,
	setBlock,
	vote,
	onSourceClick,
	isLoading,
}: {
	chatId: string;
	message: any;
	block: UIBlock;
	setBlock: Dispatch<SetStateAction<UIBlock>>;
	vote?: any;
	isLoading: boolean;
	onSourceClick?: (sourceText: string) => void;
}) => {
	// Extract metadata safely
	const judgment = message?.metadata?.judgment;
	const sources = message?.metadata?.sources;
	const { mutate } = useSWRConfig();

	// const handleSourceClick = async (title: string) => {
	//   let conversation_id;
	//   if (title) {
	//     try {
	//       const res = await fetch("/api/conversation/subconversation", {
	//         method: "POST",
	//         body: JSON.stringify({
	//           parentConversationId: chatId,
	//           sourceText: title,
	//         }),
	//       });
	//       let data: any = null;
	//       if (res.ok) {
	//         data = await res.json();

	//         console.log(data, "CONVERSATION DATA");

	//         conversation_id = data?.id;

	//         await mutate(
	//           "/api/conversation/subconversation",
	//           (prevData) => {
	//             console.log(prevData, "PREV DATA");
	//             const newSubconversation = {
	//               ...data,
	//               is_open: true,
	//               is_loading: true,
	//             };

	//             return [newSubconversation, ...prevData];
	//           },
	//           { revalidate: false }
	//         );
	//       }

	//       await mutate(
	//         "/api/chat/subchat",
	//         (subchats = []) => {
	//           console.log(subchats, "SUBCHATS");

	//           const newData = {
	//             role: "user",
	//             content: title,
	//             id: uuidv4(),
	//             is_streaming: false,
	//           };
	//           return [...subchats, newData];
	//         },
	//         { revalidate: false }
	//       );

	//       const messageResponse = await fetch(
	//         `/api/chat/subchat?conversation_id=${data?.id}`,
	//         {
	//           method: "POST",
	//           body: JSON.stringify({ sourceText: title }),
	//         }
	//       );

	//       const fullResponse = await messageResponse.json();

	//       if (fullResponse && fullResponse.content) {
	//         const chunks: string[] = [];
	//         const chunkSize = 30;
	//         const content = fullResponse.content;

	//         for (let i = 0; i < content.length; i += chunkSize) {
	//           chunks.push(content.slice(i, i + chunkSize));
	//         }

	//         await mutate(
	//           `/api/chat/subchat?conversation_id=${data.id}`,
	//           (subchats = []) => {
	//             const aiMessagePlaceholder = {
	//               role: "assistant",
	//               content: "",
	//               id: uuidv4(),
	//               is_streaming: true,
	//             };
	//             return [...subchats, aiMessagePlaceholder];
	//           },
	//           { revalidate: false }
	//         );

	//         let accumulatedContent = "";

	//         for (let i = 0; i < chunks.length; i++) {
	//           accumulatedContent += chunks[i];

	//           await new Promise((resolve) => setTimeout(resolve, 50)); // Delay for streaming effect

	//           mutate(
	//             `/api/chat/subchat?conversation_id=${data.id}`,
	//             (subchats = []) => {
	//               const lastMessageIndex = subchats.findLastIndex(
	//                 (msg: { role: string; is_streaming: boolean }) =>
	//                   msg.role === "assistant" && msg.is_streaming
	//               );

	//               if (lastMessageIndex !== -1) {
	//                 const updatedSubchats = [...subchats];
	//                 updatedSubchats[lastMessageIndex] = {
	//                   ...updatedSubchats[lastMessageIndex],
	//                   content: accumulatedContent,
	//                 };
	//                 return updatedSubchats;
	//               }
	//               return subchats;
	//             },
	//             { revalidate: false }
	//           );
	//         }

	//         // Finalize the message with metadata
	//         await mutate(
	//           `/api/chat/subchat?conversation_id=${data.id}`,
	//           (subchats = []) => {
	//             const lastMessageIndex = subchats.findLastIndex(
	//               (msg: { role: string; is_streaming: boolean }) =>
	//                 msg.role === "assistant" && msg.is_streaming
	//             );

	//             if (lastMessageIndex !== -1) {
	//               const updatedSubchats = [...subchats];
	//               updatedSubchats[lastMessageIndex] = {
	//                 ...updatedSubchats[lastMessageIndex],
	//                 is_streaming: false,
	//                 metadata: {
	//                   judgment: fullResponse.judgment || "",
	//                   sources: fullResponse.sources || [],
	//                 },
	//               };
	//               return updatedSubchats;
	//             }
	//             return subchats;
	//           },
	//           { revalidate: false }
	//         );
	//       }
	//     } catch (error) {
	//       await mutate(`/api/chat/subchat?conversation_id=${conversation_id}`);
	//       console.error("Error in handleSourceClick:", error);
	//     }
	//   }
	// };
	return (
		<motion.div
			className="w-full mx-auto max-w-3xl px-4 group/message"
			initial={{ y: 5, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			data-role={message.role}
		>
			<div
				className={cx(
					"group-data-[role=user]/message:bg-primary group-data-[role=user]/message:text-primary-foreground flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
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
							onClick={() =>
								onSourceClick ? onSourceClick(judgment.text) : {}
							}
							className={`
                flex flex-col cursor-pointer gap-2 p-2 rounded-md 
                ${
									judgment.isPositive
										? "bg-green-50 text-green-800"
										: "bg-red-50 text-red-800"
								}
              `}
						>
							<span className="font-semibold flex">
								{judgment.isPositive ? "✓" : "!"} Judgment:
							</span>
							<span>{judgment.text}</span>
						</div>
					)}

					{/* Sources Rendering */}
					{sources && sources.length > 0 && (
						<div className="bg-gray-50 p-2 rounded-md">
							<h4 className="font-semibold mb-2 text-gray-700">Sources:</h4>
							<ul className="space-y-1">
								{sources.map(
									(source: { url: string; title: string }, index: number) => (
										<li
											key={index}
											className="text-sm text-blue-600 hover:underline cursor-pointer"
										>
											{source.title}
										</li>
									),
								)}
							</ul>
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
					},
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
