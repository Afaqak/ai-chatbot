import { createClient } from "@/utils/supabase/server";
import { auth } from "@/app/(auth)/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const session =  (await supabase.auth.getUser()).data
// console.log('conversation hit')
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(
        `
        id ,
        title ,
        user_id ,
        created_at
      `
      )
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });


      console.log(conversations)

    if (error) {
      console.error("Error fetching conversations:", error);
      return NextResponse.json(
        { error: "Failed to fetch conversations" },
        { status: 500 }
      );
    }

    // Format the conversations data
    // const formattedConversations = conversations.map((conv) => ({
    //   id: conv.,
    //   title: conv.title,
    //   createdAt: conv.created_at,
    //   user_id:conv.user_id
    // //   parentId: conv.parent_conversation_id,
    // //   messages: conv.messages.map((msg: any) => ({
    // //     id: msg.id,
    // //     role: msg.role,
    // //     content: msg.content,
    // //     createdAt: msg.created_at,
    // //   })),
    //   // Get the last message for preview
    // //   lastMessage:
    // //     conv.messages.length > 0
    // //       ? conv.messages[conv.messages.length - 1].content
    // //       : null,
    // //   // Get message count
    // //   messageCount: conv.messages.length,
    // }));

    return NextResponse.json({
      conversations,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
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
