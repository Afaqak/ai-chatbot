"use client";

import { AnimatePresence } from "framer-motion";
import {
	FormEvent,
	memo,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import useSWR, { useSWRConfig } from "swr";
import { useWindowSize } from "usehooks-ts";

import { PreviewMessage, ThinkingMessage } from "@/components/message";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";

import { Block, type UIBlock } from "./block";
import { MultimodalInput } from "./multimodal-input";

import { useSearchParams } from "next/navigation";

import { createClient } from "@/utils/supabase/client";
import { v4, v5 } from "uuid";
import { toast } from "sonner";

const supabase = createClient();

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
export const Chat = memo(function Chat({
	id,
	initialMessages,
	selectedModelId,
}: {
	id: string;
	initialMessages: Array<any>;
	selectedModelId: string;
}) {
	const searchParams = useSearchParams();
	const parent_conversation_id = searchParams.get("parent_conversation_id");
	const { mutate } = useSWRConfig();
	const [selectedJurisdiction, setSelectedJurisdiction] = useState(
		jurisdictions[0],
	);
	const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
	const [responseOption, setResponseOption] = useState("default");
	const [input, setInput] = useState("");
	const [attachments, setAttachments] = useState<Array<any>>([]);

	const [messages, setMessages] = useState<any[]>(initialMessages);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		// Validate conversationId
		if (!id) {
			console.warn("No conversation ID provided");
			return;
		}

		// Debugging: Log the channel details
		console.log("Attempting to subscribe to channel:", `conversation:${id}`);

		// Create a more robust channel subscription
		const channel = supabase
			.channel(`conversation:${id}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "messages",
					filter: `conversation_id=eq.${id}`,
				},
				async (payload) => {
					console.log("Realtime Payload Raw:", payload);
					console.log("first sub");
					try {
						// Ensure payload.new exists and is of correct type
						if (!payload.new) {
							console.warn("Payload does not contain new message data");
							return;
						}

						const newMessage = payload.new as any;

						// Enhanced logging
						console.log("New Message Payload:", newMessage);
						console.log("Payload Event Type:", payload.eventType);

						// Document fetching logic
						if (newMessage?.document_id) {
							try {
								const { data: document, error } = await supabase
									.from("documents")
									.select("*")
									.eq("id", newMessage.document_id)
									.maybeSingle();

								if (error) {
									console.error("Document Fetch Error:", error);
								} else if (document) {
									newMessage.documents = document;
								}
							} catch (docError) {
								console.error("Document Fetch Exception:", docError);
							}
						}

						// Update messages state
						setMessages((prevMessages) => {
							// Find existing message
							const existingMessageIndex = prevMessages.findIndex(
								(message) => message.id === newMessage.id,
							);

							// Update existing message
							if (existingMessageIndex !== -1) {
								const updatedMessages = [...prevMessages];
								updatedMessages[existingMessageIndex] = {
									...updatedMessages[existingMessageIndex],
									...newMessage,
								};
								return updatedMessages;
							}

							// Handle INSERT events
							if (payload.eventType === "INSERT") {
								// Prevent duplicate messages
								const isDuplicate = prevMessages.some(
									(msg) =>
										msg.content === newMessage.content &&
										msg.role === newMessage.role,
								);

								if (isDuplicate) {
									console.warn("Duplicate message prevented");
									return prevMessages;
								}

								console.log("Adding new message:", newMessage);
								return [...prevMessages, newMessage];
							}

							return prevMessages;
						});
					} catch (error) {
						console.error("Realtime Subscription Processing Error:", error);
					}
				},
			)
			.subscribe((status, err) => {
				console.log("Supabase Channel Subscription Status:", status);

				if (err) {
					console.error("Subscription Error:", err);
				}
			});

		// Cleanup subscription
		return () => {
			console.log("Removing Supabase channel");
			supabase.removeChannel(channel);
		};
	}, []);

	const sendMessage = useCallback(
		async (content: string) => {
			setIsLoading(true);

			try {
				const response = await fetch(`/api/chat?conversation_id=${id}`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ query: content }),
				});

				if (!response.ok) {
					throw new Error("Message send failed");
				}

				const responseData = await response.json();
				console.log("Message sent successfully", responseData);
				return responseData;
			} catch (error) {
				console.error("Send message error:", error);
			} finally {
				setIsLoading(false);
			}
		},
		[id],
	);
	const onSourceClick = async (sourceText: string) => {
		try {
			const { data: existingConversation, error } = await supabase
				.from("conversations")
				.select("*")
				.eq("id", id)
				.maybeSingle();

			if (error) {
				console.error("Error checking conversation hierarchy:", error);
				throw error;
			}

			// Determine the parent ID
			const parentId = existingConversation?.parent_conversation_id
				? existingConversation.parent_conversation_id
				: existingConversation.id;

			// Generate a new conversation ID
			const conversation_id = v4();
			setMessages([]); // Clear messages for the new conversation

			// Update browser history with the new conversation
			window.history.replaceState(
				{},
				"",
				`/chat/${conversation_id}?parent_id=${parentId}`,
			);

			// Add the user message to the state immediately
			setMessages((prev) => [
				...prev,
				{
					id: v4(),
					role: "user",
					content: sourceText,
				},
			]);

			setIsLoading(true);

			// Subscribe to the new channel before sending the message
			const newChannel = supabase.channel(`conversation:${conversation_id}`);
			newChannel
				.on(
					"postgres_changes",
					{
						event: "*",
						schema: "public",
						table: "messages",
						filter: `conversation_id=eq.${conversation_id}`,
					},
					async (payload) => {
						console.log("Realtime Payload Raw:", payload);
						console.log("first sub");
						try {
							// Ensure payload.new exists and is of correct type
							if (!payload.new) {
								console.warn("Payload does not contain new message data");
								return;
							}

							const newMessage = payload.new as any;

							// Enhanced logging
							console.log("New Message Payload:", newMessage);
							console.log("Payload Event Type:", payload.eventType);

							// Document fetching logic
							if (newMessage?.document_id) {
								try {
									const { data: document, error } = await supabase
										.from("documents")
										.select("*")
										.eq("id", newMessage.document_id)
										.maybeSingle();

									if (error) {
										console.error("Document Fetch Error:", error);
									} else if (document) {
										newMessage.documents = document;
									}
								} catch (docError) {
									console.error("Document Fetch Exception:", docError);
								}
							}

							setMessages((prevMessages) => {
								const existingMessageIndex = prevMessages.findIndex(
									(message) => message.id === newMessage.id,
								);

								if (existingMessageIndex !== -1) {
									const updatedMessages = [...prevMessages];
									updatedMessages[existingMessageIndex] = {
										...updatedMessages[existingMessageIndex],
										...newMessage,
									};
									return updatedMessages;
								}

								if (payload.eventType === "INSERT") {
									const isDuplicate = prevMessages.some(
										(msg) =>
											msg.content === newMessage.content &&
											msg.role === newMessage.role,
									);

									if (isDuplicate) {
										console.warn("Duplicate message prevented");
										return prevMessages;
									}

									console.log("Adding new message:", newMessage);
									return [...prevMessages, newMessage];
								}

								return prevMessages;
							});
						} catch (error) {
							console.error("Realtime Subscription Processing Error:", error);
						}
					},
				)
				.subscribe();

			const response = await fetch(
				`/api/chat?conversation_id=${conversation_id}&parent_conversation_id=${parentId}&type=subchat`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ query: sourceText }),
				},
			);
			mutate("/api/conversation");

			if (!response.ok) {
				throw new Error("Message send failed");
			}

			const responseData = await response.json();
			console.log("Message sent successfully", responseData);

			setIsLoading(false);
		} catch (error) {
			console.error("Error in onSourceClick:", error);
			toast.error("Failed to create conversation");
		}
	};

	const onDocumentUpdate = async ({
		message,
		role,
		id,
	}: {
		message: string;
		role: string;
		id: string;
	}) => {
		const tempId = v4();
		try {
			setIsLoading(true);
			setMessages((prev) => [
				...prev,
				{
					content: message,
					id: tempId,
					role: "user",
				},
			]);

			const res = await fetch(`/api/chat/document/update?document_id=${id}`, {
				method: "PATCH",
				body: JSON.stringify({
					message,
				}),
			});

			if (!res.ok) {
				throw new Error("Error updating document");
			}
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

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

	const [messagesContainerRef, messagesEndRef] =
		useScrollToBottom<HTMLDivElement>();

	const handleSubmit = useCallback(
		(e?: React.FormEvent<HTMLFormElement>) => {
			e?.preventDefault();

			if (!input.trim()) return;

			setMessages((prev) => [
				...prev,
				{
					content: input,
					id: "",
					role: "user",
					conversation_id: id,
				},
			]);

			try {
				sendMessage(input).then(
					(data) => {
						console.log(data);
						setInput("");
					},
					(err) => {
						console.error(err);
					},
				);
			} catch (err) {
				console.error(err);
			}
		},
		[input, id, sendMessage, setMessages],
	);

	const renderedMessages = useMemo(
		() =>
			messages.map((message, index) => (
				<PreviewMessage
					key={message.id || index}
					chatId={id}
					message={message}
					block={block}
					setBlock={setBlock}
					onSourceClick={onSourceClick}
					isLoading={isLoading && messages.length - 1 === index}
				/>
			)),
		[messages, id, block, isLoading],
	);

	const multimodalInput = useMemo(
		() => (
			<MultimodalInput
				chatId={id}
				input={input}
				setInput={setInput}
				handleSubmit={handleSubmit}
				isLoading={isLoading}
				stop={() => {}}
				attachments={attachments}
				setAttachments={setAttachments}
				setMessages={setMessages}
				append={onDocumentUpdate}
				messages={messages}
			/>
		),
		[
			id,
			input,
			handleSubmit,
			isLoading,
			attachments,
			setMessages,
			onDocumentUpdate,
			messages,
		],
	);
	return (
		<div className="flex">
			<div className="flex flex-1 flex-col min-w-0 h-dvh bg-background">
				<div
					ref={messagesContainerRef}
					className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
				>
					{renderedMessages}

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
					{multimodalInput}
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
						stop={() => {}}
						append={onDocumentUpdate}
						attachments={attachments}
						setAttachments={setAttachments}
						block={block}
						setMessages={setMessages}
						votes={[]}
						setBlock={setBlock}
						messages={messages}
					/>
				)}
			</AnimatePresence>
		</div>
	);
});
