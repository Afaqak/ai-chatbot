import type {
	CoreAssistantMessage,
	CoreMessage,
	CoreToolMessage,
	Message,
	ToolInvocation,
} from "ai";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { Message as DBMessage, Document } from "@/lib/db/schema";
import { SupabaseClient } from "@supabase/supabase-js";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

interface ApplicationError extends Error {
	info: string;
	status: number;
}

export const fetcher = async (url: string) => {
	const res = await fetch(url);

	if (!res.ok) {
		const error = new Error(
			"An error occurred while fetching the data.",
		) as ApplicationError;

		error.info = await res.json();
		error.status = res.status;

		throw error;
	}

	return res.json();
};

export function getLocalStorage(key: string) {
	if (typeof window !== "undefined") {
		return JSON.parse(localStorage.getItem(key) || "[]");
	}
	return [];
}

export function generateUUID(): string {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

function addToolMessageToChat({
	toolMessage,
	messages,
}: {
	toolMessage: any;
	messages: Array<any>;
}): Array<any> {
	return messages.map((message) => {
		if (message.toolInvocations) {
			return {
				...message,
				toolInvocations: message.toolInvocations.map((toolInvocation:any) => {
					const toolResult = toolMessage.content.find(
						(tool:any) => tool.toolCallId === toolInvocation.toolCallId,
					);

					if (toolResult) {
						return {
							...toolInvocation,
							state: "result",
							result: toolResult.result,
						};
					}

					return toolInvocation;
				}),
			};
		}

		return message;
	});
}

export function convertToUIMessages(
	messages: Array<any>,
): Array<any> {
	return messages.reduce((chatMessages: Array<any>, message) => {
		if (message.role === "tool") {
			return addToolMessageToChat({
				toolMessage: message as CoreToolMessage,
				messages: chatMessages,
			});
		}

		let textContent = "";
		const toolInvocations: Array<ToolInvocation> = [];

		if (typeof message.content === "string") {
			textContent = message.content;
		} else if (Array.isArray(message.content)) {
			for (const content of message.content) {
				if (content.type === "text") {
					textContent += content.text;
				} else if (content.type === "tool-call") {
					toolInvocations.push({
						state: "call",
						toolCallId: content.toolCallId,
						toolName: content.toolName,
						args: content.args,
					});
				}
			}
		}

		chatMessages.push({
			id: message.id,
			role: message.role as Message["role"],
			content: textContent,
			toolInvocations,
		});

		return chatMessages;
	}, []);
}

export function sanitizeResponseMessages(
	messages: Array<CoreToolMessage | CoreAssistantMessage>,
): Array<CoreToolMessage | CoreAssistantMessage> {
	const toolResultIds: Array<string> = [];

	for (const message of messages) {
		if (message.role === "tool") {
			for (const content of message.content) {
				if (content.type === "tool-result") {
					toolResultIds.push(content.toolCallId);
				}
			}
		}
	}

	const messagesBySanitizedContent = messages.map((message) => {
		if (message.role !== "assistant") return message;

		if (typeof message.content === "string") return message;

		const sanitizedContent = message.content.filter((content:any) =>
			content.type === "tool-call"
				? toolResultIds.includes(content.toolCallId)
				: content.type === "text"
					? content.text.length > 0
					: true,
		);

		return {
			...message,
			content: sanitizedContent,
		};
	});

	return messagesBySanitizedContent.filter(
		(message) => message.content.length > 0,
	);
}

export function sanitizeUIMessages(messages: Array<Message>): Array<Message> {
	const messagesBySanitizedToolInvocations = messages.map((message) => {
		if (message.role !== "assistant") return message;

		if (!message.toolInvocations) return message;

		const toolResultIds: Array<string> = [];

		for (const toolInvocation of message.toolInvocations) {
			if (toolInvocation.state === "result") {
				toolResultIds.push(toolInvocation.toolCallId);
			}
		}

		const sanitizedToolInvocations = message.toolInvocations.filter(
			(toolInvocation:any) =>
				toolInvocation.state === "result" ||
				toolResultIds.includes(toolInvocation.toolCallId),
		);

		return {
			...message,
			toolInvocations: sanitizedToolInvocations,
		};
	});

	return messagesBySanitizedToolInvocations.filter(
		(message) =>
			message.content.length > 0 ||
			(message.toolInvocations && message.toolInvocations.length > 0),
	);
}

export function getMostRecentUserMessage(messages: Array<CoreMessage>) {
	const userMessages = messages.filter((message) => message.role === "user");
	return userMessages.at(-1);
}

export function getDocumentTimestampByIndex(
	documents: Array<Document>,
	index: number,
) {
	if (!documents) return new Date();
	if (index > documents.length) return new Date();

	return documents[index].createdAt;
}

export function getMessageIdFromAnnotations(message: any) {
	if (!message.annotations) return message.id;

	const [annotation] = message.annotations;
	if (!annotation) return message.id;

	return annotation?.messageIdFromServer;
}

const appendStreamToDb = async (
	text: string,
	message_id: string,
	supabase: SupabaseClient,
) => {
	const { error: updateError } = await supabase
		.from("messages")
		.update({
			content: text,
		})
		.eq("id", message_id);
};

export const streamResponse = async (
	message: string,
	message_id: string,
	supabase: SupabaseClient,
) => {
	let processedContent = "";
	const stream = new ReadableStream({
		async start(controller) {
			try {
				for (let i = 0; i < message.length; i += 50) {
					controller.enqueue(message.slice(i, i + 50));
					processedContent += message.slice(i, i + 50);
					console.log(processedContent, "PROCESSED");
					appendStreamToDb(processedContent, message_id, supabase);

					await new Promise((resolve) => setTimeout(resolve, 50));
				}

				controller.close();
			} catch (error) {
				controller.error(error);
			}
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/plain",
			"Transfer-Encoding": "chunked",
		},
	});
};

// export async function streamResponse(parsedResponse:any) {
//   const encoder = new TextEncoder();

//   const stream = new ReadableStream({
//     start(controller) {
//       try {
//         // Start of JSON object
//         controller.enqueue(encoder.encode('{\n'));

//         // Stream content
//         controller.enqueue(encoder.encode('"content": '));
//         controller.enqueue(encoder.encode(JSON.stringify(parsedResponse.content)));
//         controller.enqueue(encoder.encode(',\n'));

//         // Stream judgment
//         controller.enqueue(encoder.encode('"judgment": '));
//         controller.enqueue(encoder.encode(JSON.stringify(parsedResponse.judgment)));
//         controller.enqueue(encoder.encode(',\n'));

//         // Stream sources
//         controller.enqueue(encoder.encode('"sources": '));
//         controller.enqueue(encoder.encode(JSON.stringify(parsedResponse.sources)));
//         controller.enqueue(encoder.encode('\n'));

//         // End of JSON object
//         controller.enqueue(encoder.encode('}\n'));

//         controller.close();
//       } catch (error) {
//         controller.error(error);
//       }
//     }
//   });

//   return new Response(stream, {
//     headers: {
//       'Content-Type': 'application/json',
//       'Transfer-Encoding': 'chunked'
//     }
//   });
// }
