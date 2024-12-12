import { createClient } from "@/utils/supabase/server";
import { auth } from "@/app/(auth)/auth";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { streamResponse } from "@/lib/utils";

const genAI = new GoogleGenerativeAI(
	process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY!,
);

export async function POST(request: Request) {
	const supabase = await createClient();
	const session = (await supabase.auth.getSession()).data.session;

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = session.user.id;
	let { sourceText } = await request.json();
	const { searchParams } = new URL(request.url);
	let conversationId = searchParams.get("conversation_id");

	try {
		const { data: userData, error: messageError } = await supabase
			.from("messages")
			.insert([
				{
					id: uuidv4(),
					conversation_id: conversationId,
					user_id: userId,
					role: "user",
					content: sourceText,
				},
			]);

		// console.log(userData, "USER MESSAGE");

		if (messageError) {
			console.error("Error saving user message:", messageError);
			return NextResponse.json(
				{ error: "Failed to save user message" },
				{ status: 500 },
			);
		}

		const documentGeneration = `
   Provide a comprehensive response to the user query while adhering strictly to the following JSON format. Make sure to populate **ALL** fields, even if some values are minimal. Pay attention to the following important points:

   ${sourceText}

1. **content**: This should be a detailed and well-structured response addressing the user query.
.
   - Use proper formatting for any document content that follows the "CREATE_DOCUMENT:" directive (e.g., clear headings, placeholders for variables like [Debtor's Name], etc.).

2. **judgment**: Provide a brief assessment of the response quality, such as:
   - "Comprehensive explanation with clear steps."
   - "General answer with few details."
   - "Incomplete answer with missing key information."

3. **sources**: Include relevant sources (if any) to back up the content provided. If sources are not available, leave the array empty. Each source should have:
   - A 'title': The title of the source (if available).
   - A 'url': The URL of the source (if available; if not, leave as an empty string).
   - Limit sources to 2-3 relevant references.

4. **createDocument**: This should be a boolean ('true' or 'false'). Set to 'true' if a document should be created as part of the response, otherwise set it to 'false'.

Here is the structure you should follow for the response:

{
  "content": "Provide a detailed response addressing the query. If a document should be created, include the text following 'CREATE_DOCUMENT:'",
  "judgment": {
    "text": "A concise assessment of the response quality (e.g., 'Comprehensive explanation with clear steps')"
  },
  "sources": [
    {
      "title": "Specific Source Name",
      "url": "Optional source URL (can be empty string if no URL)"
    }
  ],
}

Important Response Guidelines:
- Ensure valid JSON syntax.
- Include placeholders in the document content where appropriate (e.g., [Debtor's Name], [Loan Account Number], etc.).
- Be consistent with how you structure each field.


    `;

		// const aiResponse = await fetch("http://127.0.0.1:8000/query", {
		//   method: "POST",
		//   body: JSON.stringify({ query: documentGeneration }),
		//   headers: { "Content-Type": "application/json" },
		// });

		const model = genAI.getGenerativeModel({ model: "gemini-pro" });

		const result = await model.generateContent(`${documentGeneration}`);
		const response = result.response;
		const aiData = response.text();

		let parsedResponse;

		try {
			console.log(aiData, "PARSED RESPONE");
			parsedResponse = JSON.parse(aiData);
		} catch (parseError) {
			const errorMessageId = uuidv4();
			await supabase
				.from("messages")
				.insert({
					id: errorMessageId,
					conversation_id: conversationId,
					user_id: userId,
					role: "assistant",
					content: "invalid format provided",
					metadata: {
						judgment: {
							text: "",
						},
						sources: [],
						isComplete: false,
					},
				})
				.select("*")
				.maybeSingle();

			console.error("Failed to parse AI response", parseError);
			return new Response(
				JSON.stringify({
					error: "Invalid AI response format",
				}),
				{
					status: 500,
				},
			);
		}

		const finalMessageId = uuidv4();

		const { data: aiChatData, error: insertError } = await supabase
			.from("messages")
			.insert({
				id: finalMessageId,
				conversation_id: conversationId,
				user_id: userId,
				role: "assistant",
				content: parsedResponse?.content,
				metadata: {
					judgment: parsedResponse.judgment,
					sources: parsedResponse.sources,
					isComplete: false,
				},
			});

		console.log(aiChatData);

		return NextResponse.json(parsedResponse);
	} catch (error) {
		console.error("Unexpected error:", error);

		const errorMessageId = uuidv4();

		await supabase
			.from("messages")
			.insert({
				id: errorMessageId,
				conversation_id: conversationId,
				user_id: userId,
				role: "assistant",
				content: "unexpected error occured please try again later",
				metadata: {
					judgment: {
						text: "",
					},
					sources: [],
					isComplete: false,
				},
			})
			.select("*")
			.maybeSingle();

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
		const { searchParams } = new URL(request.url);
		const subchatId = searchParams.get("conversation_id");

		if (!subchatId) {
			return NextResponse.json(
				{ error: "Subchat ID is required" },
				{ status: 400 },
			);
		}

		const { data, error } = await supabase
			.from("messages")
			.select("*")
			.eq("conversation_id", subchatId)
			.order("created_at", { ascending: true });

		if (error) {
			console.error("Error fetching messages:", error);
			return NextResponse.json(
				{ error: "Failed to fetch messages" },
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
