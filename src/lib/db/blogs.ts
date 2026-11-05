import { query, isDatabaseConfigured } from "./postgres";
import { triggerMetaMindfulRevalidation } from "./faqs";
import type { BlogPost, PublicationStatus } from "@/types/crm";

function mapRowToBlogPost(row: Record<string, any>): BlogPost {
  let relatedSlugs: string[] = [];
  if (row.related_slugs) {
    relatedSlugs =
      typeof row.related_slugs === "string"
        ? JSON.parse(row.related_slugs)
        : row.related_slugs;
  }

  return {
    id: String(row.id || row.wp_id || `post_${row.slug}`),
    slug: row.slug,
    title: row.title,
    description: row.description || "",
    content: row.content || "",
    category: row.category || "Mindfulness",
    readingTime: row.reading_time || "5 min read",
    featured: Boolean(row.featured),
    status: "PUBLISHED" as PublicationStatus,
    publishedAt: row.published_at || "Recently Published",
    updatedAt: row.updated_at || undefined,
    authorInfo: {
      name: row.author_name || "MetaMindful Editorial Team",
      role: row.author_role || "Editorial Team",
      avatarUrl: row.author_avatar_url || "/icons/logo-mark.svg",
    },
    coverImage: {
      src: row.cover_image_src || `/images/blog/${row.slug}.webp`,
      alt: row.cover_image_alt || row.title,
      width: Number(row.cover_image_width) || 1536,
      height: Number(row.cover_image_height) || 1024,
    },
    seo: {
      title: row.seo_title || `${row.title} | MetaMindful`,
      description: row.seo_description || row.description || "",
      canonical: row.canonical || `/blog/${row.slug}`,
    },
    relatedSlugs,
    structuredSections: [],
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    version: "v1.0",
  };
}

/**
 * Retrieves all published blog posts directly from PostgreSQL.
 */
export async function getDbBlogs(): Promise<BlogPost[]> {
  if (!isDatabaseConfigured()) return [];

  const rows = await query<any>(
    "SELECT * FROM blog_posts ORDER BY COALESCE(published_date, created_at) DESC, id ASC"
  );
  return rows.map(mapRowToBlogPost);
}

/**
 * Retrieves a single blog post by slug from PostgreSQL.
 */
export async function getDbBlogBySlug(slug: string): Promise<BlogPost | null> {
  if (!isDatabaseConfigured()) return null;

  const rows = await query<any>(
    "SELECT * FROM blog_posts WHERE slug = $1 LIMIT 1",
    [slug]
  );
  if (rows.length === 0) return null;
  return mapRowToBlogPost(rows[0]);
}

/**
 * Updates or inserts a blog post into PostgreSQL using parameterized queries,
 * then triggers instant on-demand revalidation on MetaMindful.
 */
export async function saveDbBlog(
  blog: Partial<BlogPost> & { title: string; slug: string }
): Promise<BlogPost> {
  const numericId = blog.id && !isNaN(Number(blog.id)) ? Number(blog.id) : null;
  const now = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // 1. Try Parameterized UPDATE first
  const updateResult = await query(
    `UPDATE blog_posts SET
       title = $1,
       description = $2,
       content = $3,
       category = $4,
       reading_time = $5,
       seo_title = $6,
       seo_description = $7,
       updated_at = $8
     WHERE slug = $9 OR ($10::int IS NOT NULL AND id = $10::int)
     RETURNING *`,
    [
      blog.title,
      blog.description || "",
      blog.content || "",
      blog.category || "Mindfulness",
      blog.readingTime || "5 min read",
      blog.seo?.title || `${blog.title} | MetaMindful`,
      blog.seo?.description || blog.description || "",
      now,
      blog.slug,
      numericId,
    ]
  );

  let savedRow: any;

  if (updateResult.length > 0) {
    savedRow = updateResult[0];
  } else {
    // 2. Parameterized INSERT if not found
    const insertResult = await query(
      `INSERT INTO blog_posts (
         slug, title, description, content, category, reading_time,
         published_at, updated_at, featured, cover_image_src, cover_image_alt,
         cover_image_width, cover_image_height, author_name, author_role,
         author_avatar_url, seo_title, seo_description, canonical, related_slugs
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
       ) RETURNING *`,
      [
        blog.slug,
        blog.title,
        blog.description || "",
        blog.content || "",
        blog.category || "Mindfulness",
        blog.readingTime || "5 min read",
        now,
        now,
        Boolean(blog.featured),
        blog.coverImage?.src || `/images/blog/${blog.slug}.webp`,
        blog.coverImage?.alt || blog.title,
        blog.coverImage?.width || 1536,
        blog.coverImage?.height || 1024,
        blog.authorInfo?.name || "MetaMindful Editorial Team",
        blog.authorInfo?.role || "Editorial Team",
        blog.authorInfo?.avatarUrl || "/icons/logo-mark.svg",
        blog.seo?.title || `${blog.title} | MetaMindful`,
        blog.seo?.description || blog.description || "",
        blog.seo?.canonical || `/blog/${blog.slug}`,
        JSON.stringify(blog.relatedSlugs || []),
      ]
    );
    savedRow = insertResult[0];
  }

  // 3. Trigger instant cache purge on deployed MetaMindful
  triggerMetaMindfulRevalidation({ slug: blog.slug });

  return mapRowToBlogPost(savedRow);
}

/**
 * Deletes a blog post from PostgreSQL and purges the MetaMindful cache.
 */
export async function deleteDbBlog(idOrSlug: string): Promise<boolean> {
  const numericId = !isNaN(Number(idOrSlug)) ? Number(idOrSlug) : null;

  await query(
    `DELETE FROM blog_posts WHERE slug = $1 OR ($2::int IS NOT NULL AND id = $2::int)`,
    [idOrSlug, numericId]
  );

  triggerMetaMindfulRevalidation({ slug: idOrSlug, path: "/blog" });

  return true;
}

