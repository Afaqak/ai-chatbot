import { createClient } from "@/utils/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

import { v4 as UUIDv4 } from "uuid";

const genAI = new GoogleGenerativeAI(
	process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY!,
);

export async function POST(request: Request) {
	const supabase = await createClient();
	const session = (await supabase.auth.getSession()).data.session;

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { sourceText, parentConversationId } = await request.json();
		const userId = session.user.id;
		console.log(parentConversationId, sourceText);
		const subchatId = UUIDv4();
		const { data, error: conversationError } = await supabase
			.from("conversations")
			.insert({
				id: subchatId,
				user_id: userId,
				title: `${sourceText}`,
				parent_conversation_id: parentConversationId,
				type: "subchat",
			})
			.select("*")
			.maybeSingle();

		console.log(data);

		if (conversationError) {
			console.error("Error creating subchat:", conversationError);
			return NextResponse.json(
				{ error: "Failed to create subchat" },
				{ status: 500 },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Unexpected error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function GET(request: Request) {
	const supabase = await createClient();
	const session = (await supabase.auth.getSession()).data.session;

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { data, error } = await supabase
			.from("conversations")
			.select("*")
			.eq("user_id", session.user.id)
			.eq("type", "subchat")
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching subchats:", error);
			return NextResponse.json(
				{ error: "Failed to fetch subchats" },
				{ status: 500 },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Unexpected error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
