import { createClient } from "@/utils/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { v4 } from "uuid";

const genAI = new GoogleGenerativeAI(
	process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY!,
);

export async function PATCH(request: Request) {
	const supabase = await createClient();
	const { text } = await request.json();
	const session = (await supabase.auth.getSession()).data.session;

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { searchParams } = new URL(request.url);
	const conversationId = searchParams.get("conversation_id");
	const documentId = searchParams.get("document_id");

	try {
		// Validate conversation
		const { data: conversationData } = await supabase
			.from("conversations")
			.select("id")
			.eq("id", conversationId)
			.maybeSingle();

		if (!conversationData) {
			return NextResponse.json(
				{ error: "No conversation found for this ID" },
				{ status: 404 },
			);
		}

		// Validate document
		const { data: documentData } = await supabase
			.from("documents")
			.select("id, content")
			.eq("id", documentId)
			.maybeSingle();

		if (!documentData) {
			return NextResponse.json(
				{ error: "No document found for this ID" },
				{ status: 404 },
			);
		}

		// Insert user message
		const messageId = v4();
		await supabase.from("messages").insert({
			content: text,
			conversation_id: conversationId,
			id: messageId,
			role: "user",
		});

		// Generate AI content
		const model = genAI.getGenerativeModel({ model: "gemini-pro" });
		const query = `
        ${text}
        this is the previous content
        ${documentData?.content}        
      `;

		const generateDoc = async () => {
			const result = await model.generateContent(query);
			const response = result.response;
			const aiData = response.text();
			return aiData;
		};

		// Create new document for updates
		const { data: documentToUpdate } = await supabase
			.from("documents")
			.insert({
				id: v4(),
				content: "",
				conversation_id: conversationData.id,
			})
			.select("id , title")
			.maybeSingle();

		// Insert message about document update
		await supabase.from("messages").insert({
			id: v4(),
			content: `updating document ${documentToUpdate?.title}`,
			document_id: documentToUpdate?.id,
		});

		// Generate and chunk AI data
		const aiData = await generateDoc();
		const splittedData = [];
		const ChunkSize = 20;

		for (let i = 0; i < aiData.length; i += ChunkSize) {
			let dataToPush = aiData.slice(i, i + ChunkSize);
			splittedData.push(dataToPush);
		}

		let parsedData = "";
		for (let i = 0; i < splittedData.length; i++) {
			const content = splittedData[i];
			parsedData += content;

			await supabase
				.from("documents")
				.update({
					content: parsedData,
				})
				.eq("id", documentToUpdate?.id);

			await new Promise((resolve) => setTimeout(resolve, 50));
		}

		await supabase.from("messages").insert({
			id: v4(),
			content: `updated document ${documentToUpdate?.title}`,
			document_id: documentToUpdate?.id,
		});

		return NextResponse.json({ success: true }, { status: 200 });
	} catch (error) {
		console.error("Error processing document update:", error);
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
