import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { generateTitleFromUserMessage } from "../../actions";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY!
);

export const maxDuration = 300;
export async function POST(request: Request) {
  const supabase = await createClient();
  const session = (await supabase.auth.getSession()).data.session;
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = session?.user.id;
  const { searchParams } = new URL(request.url);
  let conversationId = searchParams.get("conversation_id");
  try {
    const { query } = await request.json();

    if (!conversationId) {
      const title = await generateTitleFromUserMessage({ message: query });
      conversationId = uuidv4();

      const { error: conversationError } = await supabase
        .from("conversations")
        .insert({
          id: conversationId,
          user_id: userId,
          title,
          parent_conversation_id: null,
        });

      if (conversationError) {
        console.log(conversationError, "CON ERROR");
        return new Response(
          JSON.stringify({ error: "Conversation creation failed" }),
          { status: 500 }
        );
      }
    }

    if (conversationId) {
      console.log("CHECKING");
      const title = await generateTitleFromUserMessage({ message: query });

      const { data, error } = await supabase
        .from("conversations")
        .select()
        .eq("id", conversationId);
      if (error === null) {
        console.log("hit");
        const { error: conversationError } = await supabase
          .from("conversations")
          .insert({
            id: conversationId,
            user_id: userId,
            title,
            parent_conversation_id: null,
          });
      }
    }

    const userMessageId = uuidv4();
    const { error: messageError } = await supabase.from("messages").insert({
      id: userMessageId,
      conversation_id: conversationId,
      user_id: userId,
      role: "user",
      content: query,
    });

    if (messageError) {
      console.log("messageErr", messageError);
      return new Response(JSON.stringify({ error: "Message save failed" }), {
        status: 500,
      });
    }

    const documentGeneration = `
   Provide a comprehensive response to the user query while adhering strictly to the following JSON format. Make sure to populate **ALL** fields, even if some values are minimal. Pay attention to the following important points:

   ${query}

1. **content**: This should be a detailed and well-structured response addressing the user query.
   - If a document should be created, start the content with "CREATE_DOCUMENT:" followed by the document content (e.g., a letter or request).
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
  "createDocument": true or false
}

Important Response Guidelines:
- Ensure valid JSON syntax.
- Include placeholders in the document content where appropriate (e.g., [Debtor's Name], [Loan Account Number], etc.).
- Be consistent with how you structure each field.
- If no document is required, omit the "CREATE_DOCUMENT:" section.

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

    console.log(aiData, "AI DATA");

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiData);
    } catch (parseError) {
      console.error("Failed to parse AI response", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
        {
          status: 500,
        }
      );
    }

    if (parsedResponse.content.includes("CREATE_DOCUMENT")) {
      const documentContent = parsedResponse.content
        .replace("CREATE_DOCUMENT", "")
        .trim();
      const documentId = uuidv4();
      const documentTitle = await generateTitleFromUserMessage({
        message: documentContent,
      });

      const { error: docError } = await supabase.from("documents").insert({
        id: documentId,
        user_id: userId,
        conversation_id: conversationId,
        title: documentTitle || "Untitled Document",
        content: "",
      });

      if (docError) {
        console.log(docError, "DOC ERROR");
        return new Response(
          JSON.stringify({ error: "Document creation failed" }),
          { status: 500 }
        );
      }

      const initialMessageId = uuidv4();
      const { error: initialMessageError } = await supabase
        .from("messages")
        .insert({
          id: initialMessageId,
          conversation_id: conversationId,
          user_id: userId,
          role: "assistant",
          content: `Document ${documentTitle} creating...`,
          document_id: documentId,
          metadata: {
            judgment: parsedResponse.judgment,
            sources: parsedResponse.sources,
          },
        });

      if (initialMessageError) {
        return new Response(
          JSON.stringify({ error: "Initial message save failed" }),
          { status: 500 }
        );
      }

      const CHUNK_SIZE = 120;
      const contentChunks = [];
      for (let i = 0; i < documentContent.length; i += CHUNK_SIZE) {
        contentChunks.push(documentContent.slice(i, i + CHUNK_SIZE));
      }

      let processedContent = "";

      for (const chunk of contentChunks) {
        processedContent += chunk;

        await supabase
          .from("documents")
          .update({ content: processedContent.trim() })
          .eq("id", documentId);
      }

      const finalMessageId = uuidv4();
      const { error: finalMessageError } = await supabase
        .from("messages")
        .insert({
          id: finalMessageId,
          conversation_id: conversationId,
          user_id: userId,
          role: "assistant",
          content: `Document created on ${documentTitle}`,
        });

      if (finalMessageError) {
        return new Response(
          JSON.stringify({ error: "Final message save failed" }),
          { status: 500 }
        );
      }
    } else {
      // Handle regular message insertion
      let processedContent = "";
      const CHUNK_SIZE = 120;
      const contentChunks = [];
      const finalMessageId = uuidv4();

      for (let i = 0; i < parsedResponse.content.length; i += CHUNK_SIZE) {
        contentChunks.push(parsedResponse.content.slice(i, i + CHUNK_SIZE));
      }

      const { error: insertError } = await supabase.from("messages").insert({
        id: finalMessageId,
        conversation_id: conversationId,
        user_id: userId,
        role: "assistant",
        content: contentChunks[0],
        metadata: {
          judgment: parsedResponse.judgment,
          sources: parsedResponse.sources,
          isComplete: false,
        },
      });

      if (insertError) {
        console.error("Error inserting initial message:", insertError);
        return new Response(
          JSON.stringify({ error: "Message insert failed" }),
          {
            status: 500,
          }
        );
      }

      for (const chunk of contentChunks) {
        processedContent += chunk;
        const { error: updateError } = await supabase
          .from("messages")
          .update({
            content: processedContent,
          })
          .eq("id", finalMessageId);

        if (updateError) {
          console.error(`Error updating message chunk: ${chunk}`, updateError);
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      console.log(parsedResponse.metadata, "META");
    }

    return new Response(
      JSON.stringify({
        conversationId,
        message: "Request processed successfully",
        responseMetadata: {
          judgment: parsedResponse.judgment,
          sources: parsedResponse.sources,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (conversationId) {
      await supabase.from("messages").insert({
        id: uuidv4(),
        conversation_id: conversationId,
        user_id: userId,
        role: "assistant",
        content: `Unexpected error occurred, please try again after some time.`,
        metadata: {
          error: "Unexpected Error",
        },
      });
    }
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }
  const supabase = await createClient();
  const session = (await supabase.auth.getSession()).data.session;
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { error } = await supabase
      .from("conversation")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) {
      throw error;
    }

    return new Response("Conversation deleted", { status: 200 });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return new Response("Error deleting conversation", { status: 500 });
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
    const conversationId = searchParams.get("conversation_id");

    if (!conversationId) {
      const { data: conversations, error: conversationsError } = await supabase
        .from("conversation")
        .select(
          `
          *,
          messages:message(*)
        `
        )
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (conversationsError) {
        throw conversationsError;
      }

      return NextResponse.json({ conversations });
    }

    const { data: conversation, error: conversationError } = await supabase
      .from("conversation")
      .select(
        `
        *,
        messages:message(*)
      `
      )
      .eq("id", conversationId)
      .eq("user_id", session.user.id)
      .single();

    if (conversationError) {
      if (conversationError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }
      throw conversationError;
    }

    // Format messages for the client
    const formattedMessages = conversation.messages.map((message: any) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      createdAt: message.created_at,
    }));

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.created_at,
        messages: formattedMessages,
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
