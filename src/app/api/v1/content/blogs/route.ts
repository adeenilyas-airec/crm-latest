import { NextResponse } from "next/server";
import { getBlogs, saveBlog } from "@/lib/firebase/db";
import { z } from "zod";

const blogSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().optional(),
  category: z.string().optional(),
  readingTime: z.string().optional(),
  featured: z.boolean().optional(),
  status: z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
  content: z.string().optional(),
  seo: z.object({
    title: z.string(),
    description: z.string(),
    canonical: z.string().optional(),
    noIndex: z.boolean().optional(),
  }).optional(),
  structuredSections: z.array(z.any()).optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const blogs = await getBlogs(category);
    return NextResponse.json({ success: true, count: blogs.length, data: blogs });
  } catch (error) {
    console.error("[API Blogs GET Error]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch blogs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = blogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
    }

    const saved = await saveBlog(body);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    console.error("[API Blogs POST Error]", error);
    return NextResponse.json({ success: false, error: "Failed to save blog" }, { status: 500 });
  }
}
