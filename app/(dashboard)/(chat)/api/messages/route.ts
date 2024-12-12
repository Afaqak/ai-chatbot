import { createClient } from "@/utils/supabase/server";
import { auth } from "@/app/(auth)/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const supabase = await createClient();
	const session = (await supabase.auth.getSession()).data.session;
	console.log("hit messages");
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { searchParams } = new URL(request.url);
		const conversationId = searchParams.get("conversation_id");

		if (!conversationId) {
			return NextResponse.json(
				{ error: "Conversation ID is required" },
				{ status: 400 },
			);
		}

		const { data: conversation, error: conversationError } = await supabase
			.from("conversation")
			.select("id")
			.eq("id", conversationId)
			.eq("user_id", session.user.id)
			.single();

		if (conversationError || !conversation) {
			return NextResponse.json(
				{ error: "Conversation not found or access denied" },
				{ status: 404 },
			);
		}

		// Fetch messages for the conversation
		const { data: messages, error: messagesError } = await supabase
			.from("message")
			.select(
				`
        id,
        role,
        content,
        created_at,
        user_id
      `,
			)
			.eq("conversation_id", conversationId)
			.order("created_at", { ascending: true });

		if (messagesError) {
			console.error("Error fetching messages:", messagesError);
			return NextResponse.json(
				{ error: "Failed to fetch messages" },
				{ status: 500 },
			);
		}

		// Format the messages
		const formattedMessages = messages.map((message) => ({
			id: message.id,
			role: message.role as "user" | "assistant",
			content: message.content,
			createdAt: message.created_at,
			userId: message.user_id,
		}));

		return NextResponse.json({
			messages: formattedMessages,
			conversationId,
		});
	} catch (error) {
		console.error("Unexpected error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// Types for the response data
export interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
	createdAt: string;
	userId: string;
}

export interface MessagesResponse {
	messages: Message[];
	conversationId: string;
}
