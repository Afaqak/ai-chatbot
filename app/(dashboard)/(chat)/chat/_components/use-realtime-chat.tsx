import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";


interface Document {
  id: string;
  title: string;
  content: string;
  version: number;
  user_id: string;
  conversation_id: string;
}

interface Message {
  id: string;
  content: string;
  conversation_id: string;
  document_id?: string; 
  documents?: Document; 
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useRealtimeChat(
  conversationId: string,
  initialMessages: Message[]
) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const messagesChannel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;

          if (newMessage?.document_id) {
            const { data: document, error } = await supabase
              .from("documents")
              .select("*")
              .eq("id", newMessage?.document_id)
              .maybeSingle();

            if (error) {
              console.error("Error fetching document:", error);
            } else {
              newMessage.documents = document; 
            }
          }

          setMessages((prev) => {
            const messageIndex = prev.findIndex(
              (message) => message.id === newMessage.id
            );

            if (messageIndex !== -1) {
              const updatedMessages = [...prev];
              updatedMessages[messageIndex] = {
                ...updatedMessages[messageIndex],
                ...newMessage,
              };
              return updatedMessages;
            }

            if (payload.eventType === "INSERT") {
              const messageIndex = prev.findIndex(
                (message) => message.content === newMessage.content
              );

              if (messageIndex !== -1) {
                const updatedMessages = [...prev];
                updatedMessages[messageIndex] = {
                  ...updatedMessages[messageIndex],
                  ...newMessage, 
                };
                return updatedMessages;
              }

              return [...prev, newMessage];
            }

            return prev;
          });
        }
      )
      .subscribe();

    const documentsChannel = supabase
      .channel(`documents:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "documents",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedDocument = payload.new as Document;

          setDocuments((prev) => {
            const existingDocIndex = prev.findIndex(
              (doc) => doc.id === updatedDocument.id
            );

            if (existingDocIndex !== -1) {
              const updatedDocs = [...prev];
              updatedDocs[existingDocIndex] = {
                ...updatedDocs[existingDocIndex],
                ...updatedDocument,
              };
              return updatedDocs;
            }

            return [...prev, updatedDocument];
          });

          const relatedMessageIndex = messages.findIndex(
            (msg) =>
              msg.document_id === updatedDocument.id &&
              msg.content.includes("creating")
          );

          if (relatedMessageIndex !== -1) {
            setMessages((prev) => {
              const updatedMessages = [...prev];
              updatedMessages[relatedMessageIndex] = {
                ...updatedMessages[relatedMessageIndex],
                content: `Document ${updatedDocument.title} creating...`,
              };
              return updatedMessages;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(documentsChannel);
    };
  }, [conversationId, messages]);

  const sendMessage = async (content: string) => {
    console.log(conversationId, "ASA");
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/chat?conversation_id=${conversationId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: content }),
        }
      );

      if (!response.ok) {
        throw new Error("Message send failed");
      }

      const responseData = await response.json();

      console.log("Message sent successfully", responseData);
    } catch (error) {
      console.error("Send message error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    documents,
    sendMessage,
    isLoading,
    setMessages,
  };
}
