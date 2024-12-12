"use client";

import React, { useState, useEffect, useRef } from "react";
import {
	ChevronDown,
	MessageSquare,
	X,
	User,
	Bot,
	Menu,
	Send,
	SparklesIcon,
} from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { Markdown } from "@/components/markdown";
import { cx } from "class-variance-authority";

type Message = {
	id: string;
	role: "user" | "assistant";
	content: string;
};

type Conversation = {
	id: string;
	title: string;
	is_open: boolean;
};

export function SubChatSidebar() {
	const [isOpen, setIsOpen] = useState(true);
	const [isMobile, setIsMobile] = useState(false);
	const [openConvoId, setOpenConvoId] = useState<string | null>(null);
	const [inputMessage, setInputMessage] = useState("");

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const { data: subConvos } = useSWR<any[]>(
		"/api/conversation/subconversation",
		fetcher,
	);

	const { data: chatMessages = [], mutate: mutateChatMessages } = useSWR<any[]>(
		openConvoId ? `/api/chat/subchat?conversation_id=${openConvoId}` : null,
		fetcher,
	);

	console.log(chatMessages, "CHAT MESSAGES");

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	useEffect(() => {
		if (subConvos) {
			const openConvo = subConvos.find((convo) => convo.is_open);

			console.log("OPEN CONVO");
			if (openConvo) {
				setOpenConvoId(openConvo.id);

				console.log("conversation added");

				mutateChatMessages();
			}
		}
	}, [subConvos, mutateChatMessages]);

	const handleSendMessage = async (convoId: string) => {
		if (!inputMessage.trim()) return;

		const optimisticUserMessage: any = {
			id: `temp-user-${Date.now()}`,
			content: inputMessage,
			role: "user",
		};

		const optimisticAssistantMessage: any = {
			id: `temp-assistant-${Date.now()}`,
			content: "",
			role: "assistant",
		};

		mutateChatMessages(
			(prev) => [
				...(prev || []),
				optimisticUserMessage,
				optimisticAssistantMessage,
			],
			{ revalidate: false },
		);

		setInputMessage("");

		try {
			const response = await fetch("/api/chat/subchat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					conversationId: convoId,
					message: inputMessage,
				}),
			});

			if (!response.ok) throw new Error("Failed to send message");

			const fullText = await response.text();

			const streamText = (text: string) => {
				let currentIndex = 0;
				const streamChunk = () => {
					const chunkSize = Math.floor(Math.random() * 10) + 5;
					const chunk = text.slice(currentIndex, currentIndex + chunkSize);

					mutateChatMessages(
						(prev) => {
							const updatedMessages = [...(prev || [])];
							const lastMessageIndex = updatedMessages.length - 1;
							if (lastMessageIndex >= 0) {
								updatedMessages[lastMessageIndex] = {
									...updatedMessages[lastMessageIndex],
									content: updatedMessages[lastMessageIndex].content + chunk,
								};
							}
							return updatedMessages;
						},
						{ revalidate: false },
					);

					currentIndex += chunkSize;
					if (currentIndex < text.length) {
						setTimeout(streamChunk, Math.random() * 50 + 30);
					}
				};
				streamChunk();
			};

			streamText(fullText);
		} catch (error) {
			console.error("Error sending message:", error);
			mutateChatMessages();
		}
	};

	const toggleSidebar = () => setIsOpen(!isOpen);

	return (
		<>
			{/* <button
        onClick={toggleSidebar}
        className="right-0 top-1/2 z-50 -translate-y-1/2 bg-primary text-primary-foreground p-2 rounded-l-md"
        aria-label="Toggle Sidebar"
      >
        <Menu size={24} />
      </button> */}
			<aside
				className={` h-full bg-background border-l transition-all duration-300 ease-in-out z-40 ${
					isOpen ? "translate-x-0" : "translate-x-full"
				} ${isMobile ? "w-full" : "w-96"}`}
			>
				<div className="h-full flex flex-col">
					<div className="p-4 border-b flex justify-between items-center">
						<h2 className="text-lg font-semibold">Sub Chats</h2>
						<button
							onClick={toggleSidebar}
							className="p-2"
							aria-label="Close Sidebar"
						>
							<X size={24} />
						</button>
					</div>
					<div className="flex-1 overflow-y-auto p-4 space-y-2">
						{subConvos?.map((convo) => (
							<div key={convo.id} className="border rounded-lg">
								<button
									className="flex w-full items-center justify-between p-2 font-medium bg-secondary hover:bg-secondary/80"
									onClick={() =>
										setOpenConvoId(openConvoId === convo.id ? null : convo.id)
									}
								>
									<div className="flex items-center">
										<MessageSquare className="shrink-0 h-4 w-4 mr-2" />
										<span className="line-clamp-1 text-sm">{convo.title}</span>
									</div>
									<ChevronDown
										className={`size-4 shrink-0 transition-transform ${
											openConvoId === convo.id ? "rotate-180" : ""
										}`}
									/>
								</button>
								{openConvoId === convo.id && (
									<div className="mt-2 flex flex-col h-[calc(100vh-200px)]">
										<div className="flex-1 overflow-y-auto p-2 border-t">
											<div className="space-y-4 flex flex-col">
												{chatMessages?.map((message, index) => (
													// `          <div
													//             key={message.id || index}
													//             className={`flex items-start space-x-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
													//           >
													//             {message.role === 'assistant' && <Bot className="h-6 w-6 text-blue-500 shrink-0" />}
													//             <div className={`p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'} max-w-[80%]`}>
													//               <Markdown>{message.content}</Markdown>
													//             </div>
													//             {message.role === 'user' && <User className="h-6 w-6 text-green-500 shrink-0" />}
													//           </div>`

													<div
														key={message.id}
														className={cx(
															"group-data-[role=user]/message:bg-primary group-data-[role=user]/message:text-primary-foreground flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
														)}
													>
														{message.role === "assistant" && (
															<div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
																<SparklesIcon size={14} />
															</div>
														)}

														{message.content && !message?.document_id ? (
															<div className="flex flex-col gap-4">
																<Markdown>{message.content as string}</Markdown>
															</div>
														) : (
															message?.content &&
															message?.document_id && (
																<div
																	// onClick={(event) => {
																	//   const rect =
																	//     event.currentTarget.getBoundingClientRect();
																	//   const boundingBox = {
																	//     top: rect.top,
																	//     left: rect.left,
																	//     width: rect.width,
																	//     height: rect.height,
																	//   };
																	//   setBlock({
																	//     documentId: message.document_id,
																	//     content: message?.content,
																	//     title: message?.documents?.title,
																	//     isVisible: true,
																	//     status: "idle",
																	//     boundingBox,
																	//   });
																	// }}
																	className="bg-gray-100 cursor-pointer rounded-md shadow p-2 w-fit"
																>
																	<div>{message?.content}</div>
																</div>
															)
														)}

														{/* Metadata Rendering */}
														{/* {message?.metadata?.judgment && ( */}
														<div
														// onClick={() => handleSourceClick(judgment.text)}
														//                   className={`
														//   flex flex-col cursor-pointer gap-2 p-2 rounded-md
														//   ${
														//     judgment.isPositive
														//       ? "bg-green-50 text-green-800"
														//       : "bg-red-50 text-red-800"
														//   }
														// `}
														>
															{/* <span className="font-semibold flex">
                                  {judgment.isPositive ? "✓" : "!"} Judgment:
                                </span> */}
															{/* <span>{message?.metadata?.judgment}</span> */}
														</div>
														{/* )} */}

														{/* Sources Rendering */}
														{/* {sources && sources.length > 0 && (
                              <div className="bg-gray-50 p-2 rounded-md">
                                <h4 className="font-semibold mb-2 text-gray-700">
                                  Sources:
                                </h4>
                                <ul className="space-y-1">
                                  {sources.map(
                                    (
                                      source: { url: string; title: string },
                                      index: number
                                    ) => (
                                      <li
                                        key={index}
                                        className="text-sm text-blue-600 hover:underline cursor-pointer"
                                      >
                                        {source.title}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )} */}
													</div>
												))}
												<div ref={messagesEndRef} />
											</div>
										</div>
										<div className="p-2 border-t bg-background">
											<div className="flex items-center space-x-2">
												<input
													type="text"
													value={inputMessage}
													onChange={(e) => setInputMessage(e.target.value)}
													onKeyPress={(e) =>
														e.key === "Enter" && handleSendMessage(convo.id)
													}
													placeholder="Type a message..."
													className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
												/>
												<button
													onClick={() => handleSendMessage(convo.id)}
													className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
													aria-label="Send message"
												>
													<Send size={20} />
												</button>
											</div>
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</aside>
		</>
	);
}
