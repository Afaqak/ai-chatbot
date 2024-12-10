import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4, validate } from "uuid";

export async function POST(request: Request) {
  const supabase = await createClient();
  const session = (await supabase.auth.getSession()).data.session;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, content, conversationId, documentId } = await request.json();
    const userId = session.user.id;

    if (documentId && !validate(documentId)) {
      return NextResponse.json(
        { error: "Invalid documentId format" },
        { status: 400 }
      );
    }

    const newDocumentId = documentId || uuidv4();

    const { data: existingDocuments, error: fetchError } = await supabase
      .from("documents")
      .select("version")
      .eq("id", newDocumentId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching existing documents:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch document version" },
        { status: 500 }
      );
    }

    const newVersion = existingDocuments ? existingDocuments?.version + 1 : 1;

    const { error: docError } = await supabase.from("documents").insert([
      {
        id: newDocumentId,
        user_id: userId,
        conversation_id: conversationId,
        title: title || "Untitled Document",
        content: content || "",
        version: newVersion,
      },
    ]);

    if (docError) {
      console.error("Error creating document:", docError);
      return NextResponse.json(
        { error: "Failed to create document" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      documentId: newDocumentId,
      version: newVersion,
      message: "Document created successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
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
    const documentId = searchParams.get("id");
    const conversationId = searchParams.get("conversationId");

    if (documentId) {
      // Fetch specific document
      const { data: document, error } = await supabase
        .from("documents")
        .select("*")
        .eq("id", documentId)
        .eq("user_id", session.user.id);

      if (error) {
        console.log(error);
        return NextResponse.json(
          { error: "Document not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(document);
    }

    if (conversationId) {
      const { data: documents, error } = await supabase
        .from("documents")
        .select("*")
        .eq("conversation_id", conversationId)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json(
          { error: "Failed to fetch documents" },
          { status: 500 }
        );
      }

      return NextResponse.json({ documents });
    }

    const { data: documents, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch documents" },
        { status: 500 }
      );
    }

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const session = (await supabase.auth.getSession()).data.session;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, title, content, status } = await request.json();

    const { data: existingDoc, error: fetchError } = await supabase
      .from("documents")
      .select("id")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (fetchError || !existingDoc) {
      return NextResponse.json(
        { error: "Document not found or unauthorized" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (status !== undefined) updateData.status = status;

    const { error: updateError } = await supabase
      .from("documents")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update document" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Document updated successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const session = (await supabase.auth.getSession()).data.session;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    const { data: existingDoc, error: fetchError } = await supabase
      .from("documents")
      .select("id")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (fetchError || !existingDoc) {
      return NextResponse.json(
        { error: "Document not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete document
    const { error: deleteError } = await supabase
      .from("documents")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to delete document" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
