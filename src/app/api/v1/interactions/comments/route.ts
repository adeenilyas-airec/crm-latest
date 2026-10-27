import { NextResponse } from "next/server";
import { getComments, addComment, updateCommentStatus } from "@/lib/firebase/db";
import { z } from "zod";

const commentSchema = z.object({
  blogSlug: z.string().min(1),
  authorName: z.string().min(2).max(100),
  authorEmail: z.string().email(),
  content: z.string().min(3).max(2000),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") as any) || undefined;
    const blogSlug = searchParams.get("blogSlug") || undefined;
    const comments = await getComments(status, blogSlug);
    return NextResponse.json({ success: true, count: comments.length, data: comments });
  } catch (error) {
    console.error("[API Comments GET Error]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
    }

    const comment = await addComment(parsed.data);
    return NextResponse.json({
      success: true,
      message: "Comment submitted for moderation",
      data: comment,
    }, { status: 201 });
  } catch (error) {
    console.error("[API Comments POST Error]", error);
    return NextResponse.json({ success: false, error: "Failed to submit comment" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ success: false, error: "id and status required" }, { status: 400 });
    }

    const ok = await updateCommentStatus(id, status);
    return NextResponse.json({ success: ok });
  } catch (error) {
    console.error("[API Comments PATCH Error]", error);
    return NextResponse.json({ success: false, error: "Failed to update comment" }, { status: 500 });
  }
}
