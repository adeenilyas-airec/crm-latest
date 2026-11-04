import type { BlogPost, PublicationStatus } from "@/types/crm";

const WP_API_BASE = "https://metamindful.ai/wp-json/wp/v2";

/**
 * In-memory fallback cache to guarantee dashboard resilience
 * even during intermittent network interruptions.
 */
let memoryPostsCache: BlogPost[] = [];
let lastFetchTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

/**
 * Decodes standard HTML entities commonly returned by WordPress REST API.
 */
export function decodeHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&hellip;/g, "…")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}

/**
 * Cleans raw WordPress HTML to eliminate empty spacer tags, non-breaking spaces,
 * and Gutenberg artifacts while strictly preserving all semantic HTML tags.
 */
export function cleanWpHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<p>\s*&nbsp;\s*<\/p>/gi, "")
    .replace(/<p>\s*<\/p>/gi, "")
    .trim();
}

const CATEGORY_MATCHERS = [
  { match: /adhd|attention/i, category: "ADHD & Attention" },
  { match: /work|desk|office|career|boss|meeting/i, category: "Work & Focus" },
  { match: /judged|social|awkward|silent|people/i, category: "Social Confidence" },
  { match: /anger|boiling|rage|emotional|panic|anxiety/i, category: "Emotional Regulation" },
  { match: /self-talk|compassion|smart-enough|worth|critic/i, category: "Self-Compassion" },
  { match: /overthink|spiral|circling|ruminat|racing/i, category: "Overthinking" },
  { match: /sleep|insomnia|bedtime|night/i, category: "Sleep & Rest" },
];

function deriveCategory(slug: string, title: string, wpTermCategory?: string): string {
  if (wpTermCategory && wpTermCategory !== "Blog" && wpTermCategory.trim().length > 0) {
    return decodeHtml(wpTermCategory);
  }
  const target = `${slug} ${title}`;
  for (const entry of CATEGORY_MATCHERS) {
    if (entry.match.test(target)) return entry.category;
  }
  return "Mindfulness";
}

/**
 * Maps a raw WordPress REST API post item to our strongly-typed BlogPost schema.
 */
export function mapWordPressPostToBlogPost(
  wpPost: Record<string, any>,
  index: number
): BlogPost {
  const rawTitle = wpPost.title?.rendered || "Untitled Post";
  const title = decodeHtml(rawTitle).trim();
  const slug = wpPost.slug;
  const id = String(wpPost.id || `wp_${slug}`);

  // Published Date formatting
  const rawDate = wpPost.date;
  const publishedAt = rawDate
    ? new Date(rawDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "Recently Published";

  const updatedAt = wpPost.modified
    ? new Date(wpPost.modified).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : undefined;

  // Clean HTML Content directly from WordPress
  const rawContent = wpPost.content?.rendered || "";
  const content = cleanWpHtml(rawContent);

  // Excerpt / Description
  const rawExcerpt = wpPost.excerpt?.rendered || "";
  let description = decodeHtml(
    rawExcerpt.replace(/<[^>]+>/g, "").replace(/\[&hellip;\]/g, "…")
  ).trim();

  if (!description && content) {
    const textOnly = decodeHtml(content.replace(/<[^>]+>/g, " ").trim());
    description = textOnly.slice(0, 180) + (textOnly.length > 180 ? "…" : "");
  }

  // Word count & Reading time calculation
  const textOnlyForWords = decodeHtml(content.replace(/<[^>]+>/g, " ").trim());
  const words = textOnlyForWords.split(/\s+/).filter(Boolean).length;
  const readingTime = `${Math.max(1, Math.ceil(words / 200))} min read`;

  // Featured Media / Cover Image
  const mediaObj = wpPost._embedded?.["wp:featuredmedia"]?.[0];
  const coverImageSrc =
    mediaObj?.source_url || `/images/blog/${slug}.webp`;
  const coverImageAlt =
    mediaObj?.alt_text || mediaObj?.title?.rendered || title;
  const coverImageWidth = mediaObj?.media_details?.width || 1536;
  const coverImageHeight = mediaObj?.media_details?.height || 1024;

  // Category
  const termCategories = wpPost._embedded?.["wp:term"]?.[0];
  const wpCategory =
    termCategories && termCategories.length > 0 ? termCategories[0].name : undefined;
  const categoryName = deriveCategory(slug, title, wpCategory);

  // Author
  const authorName =
    wpPost._embedded?.author?.[0]?.name || "MetaMindful Editorial Team";

  // Status
  const status: PublicationStatus =
    wpPost.status === "publish" ? "PUBLISHED" : "DRAFT";

  // Comments count
  const replies = wpPost._embedded?.replies?.[0];
  const commentsCount = Array.isArray(replies) ? replies.length : 0;

  return {
    id,
    slug,
    title,
    description,
    category: categoryName,
    readingTime,
    featured: index === 0,
    status,
    authorInfo: {
      name: authorName,
      role: "Editorial Team",
      avatarUrl: "/icons/logo-mark.svg",
    },
    coverImage: {
      src: coverImageSrc,
      alt: coverImageAlt,
      width: coverImageWidth,
      height: coverImageHeight,
    },
    seo: {
      title: `${title} | MetaMindful`,
      description,
      canonical: `/blog/${slug}`,
    },
    relatedSlugs: [],
    structuredSections: [],
    content,
    publishedAt,
    updatedAt,
    likesCount: 0,
    commentsCount,
    sharesCount: 0,
    version: "v1.0",
  };
}

/**
 * Fetches all published blog posts live from WordPress REST API.
 * Uses a 60-second in-memory cache to ensure fast responses and resilience.
 */
export async function fetchLiveWordPressBlogs(forceRefresh = true): Promise<BlogPost[]> {
  const now = Date.now();
  if (
    !forceRefresh &&
    memoryPostsCache.length > 0 &&
    now - lastFetchTimestamp < CACHE_TTL_MS
  ) {
    return memoryPostsCache;
  }

  try {
    const res = await fetch(`${WP_API_BASE}/posts?per_page=100&_embed`, {
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`WordPress API returned status ${res.status}`);
    }

    const data: Record<string, any>[] = await res.json();
    const posts = data.map((item, index) =>
      mapWordPressPostToBlogPost(item, index)
    );

    if (posts.length > 0) {
      memoryPostsCache = posts;
      lastFetchTimestamp = now;
    }

    return memoryPostsCache;
  } catch (error) {
    console.error("[WordPress Blog Fetch Error]", error);
    // Graceful fallback to cached memory posts if network drops
    return memoryPostsCache;
  }
}

/**
 * Fetches a single blog post by its unique URL slug from live WordPress data.
 */
export async function fetchLiveWordPressBlogBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(
      `${WP_API_BASE}/posts?slug=${encodeURIComponent(slug)}&_embed`,
      {
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error(`WordPress API returned status ${res.status}`);
    }

    const data: Record<string, any>[] = await res.json();
    if (data.length > 0) {
      return mapWordPressPostToBlogPost(data[0], 0);
    }

    // Fallback check in cache
    const cached = memoryPostsCache.find((p) => p.slug === slug);
    return cached || null;
  } catch (error) {
    console.error(`[WordPress Blog Slug Error: ${slug}]`, error);
    const cached = memoryPostsCache.find((p) => p.slug === slug);
    return cached || null;
  }
}

/**
 * Creates Authorization header for WordPress REST API using Application Password.
 */
function getWpAuthHeader(): string {
  const username = process.env.WORDPRESS_USERNAME || "airec.tech";
  const password = process.env.WORDPRESS_APP_PASSWORD || "dDrC CCA1 tEns O2mM vkl7 ucwE";
  return "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
}

/**
 * Updates a blog post in WordPress via authenticated REST API.
 */
export async function updateWordPressPost(
  postId: string | number,
  data: {
    title?: string;
    description?: string;
    content?: string;
    status?: PublicationStatus;
  }
): Promise<BlogPost> {
  const wpBody: Record<string, any> = {};
  if (data.title !== undefined) wpBody.title = data.title;
  if (data.description !== undefined) wpBody.excerpt = data.description;
  if (data.content !== undefined) wpBody.content = data.content;
  if (data.status !== undefined) {
    wpBody.status = data.status === "PUBLISHED" ? "publish" : "draft";
  }

  const res = await fetch(`${WP_API_BASE}/posts/${postId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getWpAuthHeader(),
    },
    body: JSON.stringify(wpBody),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`WordPress update failed (${res.status}): ${errorBody}`);
  }

  const updatedRaw = await res.json();
  const updatedPost = mapWordPressPostToBlogPost(updatedRaw, 0);

  // Update memory cache immediately
  lastFetchTimestamp = 0;
  const idx = memoryPostsCache.findIndex(
    (p) => p.id === String(postId) || p.slug === updatedPost.slug
  );
  if (idx >= 0) {
    memoryPostsCache[idx] = {
      ...memoryPostsCache[idx],
      ...updatedPost,
    };
  } else {
    memoryPostsCache.unshift(updatedPost);
  }

  return updatedPost;
}

/**
 * Creates a new blog post in WordPress via authenticated REST API.
 */
export async function createWordPressPost(data: {
  title: string;
  description?: string;
  content?: string;
  status?: PublicationStatus;
}): Promise<BlogPost> {
  const wpBody: Record<string, any> = {
    title: data.title,
    excerpt: data.description || "",
    content: data.content || "",
    status: data.status === "PUBLISHED" ? "publish" : "draft",
  };

  const res = await fetch(`${WP_API_BASE}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getWpAuthHeader(),
    },
    body: JSON.stringify(wpBody),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`WordPress create failed (${res.status}): ${errorBody}`);
  }

  const createdRaw = await res.json();
  const createdPost = mapWordPressPostToBlogPost(createdRaw, 0);
  memoryPostsCache.unshift(createdPost);

  return createdPost;
}

/**
 * Deletes or trashes a blog post in WordPress via authenticated REST API.
 */
export async function deleteWordPressPost(postId: string | number): Promise<boolean> {
  const res = await fetch(`${WP_API_BASE}/posts/${postId}`, {
    method: "DELETE",
    headers: {
      Authorization: getWpAuthHeader(),
    },
  });

  if (!res.ok) {
    console.error(`WordPress delete failed (${res.status})`);
    return false;
  }

  memoryPostsCache = memoryPostsCache.filter((p) => p.id !== String(postId));
  return true;
}
