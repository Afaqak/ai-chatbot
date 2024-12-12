import { createClient } from "@/utils/supabase/server";
import { auth } from "@/app/(auth)/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const supabase = await createClient();
	const session = (await supabase.auth.getUser()).data;

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { data: conversations, error } = await supabase
			.from("conversations")
			.select(
				`
        id,
        title,
        user_id,
        created_at,
        parent_conversation_id,
        type
      `,
			)
			.eq("user_id", session.user.id)
			.or(`type.eq.chat,type.eq.subchat`)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching conversations:", error);
			return NextResponse.json(
				{ error: "Failed to fetch conversations" },
				{ status: 500 },
			);
		}

		const conversationMap = new Map<string, any>();
		const rootConversations: any[] = [];
		const subConversations: any[] = [];

		conversations.forEach((conv) => {
			if (!conv.parent_conversation_id) {
				rootConversations.push(conv);
				conversationMap.set(conv.id, conv);
			} else {
				subConversations.push(conv);
			}
		});

		subConversations.forEach((subConv) => {
			const parentConv = conversationMap.get(subConv.parent_conversation_id);
			if (parentConv) {
				if (!parentConv.subConversations) {
					parentConv.subConversations = [];
				}
				parentConv.subConversations.push(subConv);
			}
		});

		return NextResponse.json(rootConversations);
	} catch (error) {
		console.error("Unexpected error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
	createdAt: string;
}

export interface Conversation {
	id: string;
	title: string;
	createdAt: string;
	parentId: string | null;
	messages: Message[];
	lastMessage: string | null;
	messageCount: number;
}

export interface ConversationsResponse {
	conversations: Conversation[];
}
