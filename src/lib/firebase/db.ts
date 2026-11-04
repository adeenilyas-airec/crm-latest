import initialDataBundle from "@/lib/seed/initialData.json";
import {
  fetchLiveWordPressBlogs,
  fetchLiveWordPressBlogBySlug,
  updateWordPressPost,
  createWordPressPost,
  deleteWordPressPost,
} from "@/lib/content/wordpress";
import type {
  BlogPost,
  BlogComment,
  LegalDocument,
  FAQItem,
  ServiceItem,
  ProductItem,
  ContactInquiry,
  DeletionRequest,
  CRMMetrics,
  TenantBrand,
  CommentStatus,
  InquiryStatus,
  DeletionStatus
} from "@/types/crm";

interface StoreData {
  airecServices: ServiceItem[];
  airecProducts: ProductItem[];
  faqs: FAQItem[];
  legalDocuments: LegalDocument[];
  comments: BlogComment[];
  inquiries: ContactInquiry[];
  deletions: DeletionRequest[];
  blogOverrides: Map<string, Partial<BlogPost>>;
  deletedBlogSlugs: Set<string>;
  blogLikes: Map<string, number>;
}

const globalStore = global as unknown as { __CRM_STORE__?: StoreData };

if (!globalStore.__CRM_STORE__) {
  // Convert sample leads to real contact inquiries
  const rawLeads = (initialDataBundle.sampleLeads || []) as any[];
  const initialInquiries: ContactInquiry[] = rawLeads.map((l) => ({
    id: l.id,
    brand: l.brand,
    name: l.name,
    email: l.email,
    organization: l.organization,
    message: l.message,
    serviceInterest: l.serviceInterest,
    sourceUrl: l.sourceUrl,
    status: (l.stage === "NEW" ? "NEW" : "REPLIED") as InquiryStatus,
    notes: l.notes,
    createdAt: l.createdAt,
  }));

  globalStore.__CRM_STORE__ = {
    airecServices: (initialDataBundle.airecServices || []) as unknown as ServiceItem[],
    airecProducts: (initialDataBundle.airecProducts || []) as unknown as ProductItem[],
    faqs: [
      ...((initialDataBundle.airecFaqs || []) as unknown as FAQItem[]),
      ...((initialDataBundle.metamindfulFaqs || []) as unknown as FAQItem[])
    ],
    legalDocuments: (initialDataBundle.legalDocuments || []) as unknown as LegalDocument[],
    comments: (initialDataBundle.sampleComments || []) as unknown as BlogComment[],
    inquiries: initialInquiries,
    deletions: (initialDataBundle.sampleDeletions || []) as unknown as DeletionRequest[],
    blogOverrides: new Map(),
    deletedBlogSlugs: new Set(),
    blogLikes: new Map(),
  };
}

const store = globalStore.__CRM_STORE__;

/* ─── BLOGS (LIVE FROM WORDPRESS REST API) ───────────────────────────── */
export async function getBlogs(category?: string): Promise<BlogPost[]> {
  const livePosts = await fetchLiveWordPressBlogs();

  const deletedSlugs = store.deletedBlogSlugs || (store.deletedBlogSlugs = new Set());
  const overrides = store.blogOverrides || (store.blogOverrides = new Map());
  const likes = store.blogLikes || (store.blogLikes = new Map());

  // Apply CRM overrides, likes, and filter out any deleted blogs
  let list = livePosts
    .filter((b) => !deletedSlugs.has(b.slug) && !deletedSlugs.has(b.id))
    .map((b) => {
      const override = overrides.get(b.slug) || overrides.get(b.id);
      const extraLikes = likes.get(b.slug) || 0;
      return {
        ...b,
        ...(override || {}),
        likesCount: (b.likesCount || 0) + extraLikes,
      };
    });

  if (category && category.toLowerCase() !== "all") {
    list = list.filter((b) => b.category.toLowerCase() === category.toLowerCase());
  }

  return list;
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const deletedSlugs = store.deletedBlogSlugs || (store.deletedBlogSlugs = new Set());
  const overrides = store.blogOverrides || (store.blogOverrides = new Map());
  const likes = store.blogLikes || (store.blogLikes = new Map());

  if (deletedSlugs.has(slug)) {
    return null;
  }

  const livePost = await fetchLiveWordPressBlogBySlug(slug);
  if (!livePost) return null;

  const override = overrides.get(slug) || overrides.get(livePost.id);
  const extraLikes = likes.get(slug) || 0;

  return {
    ...livePost,
    ...(override || {}),
    likesCount: (livePost.likesCount || 0) + extraLikes,
  };
}

export async function saveBlog(blog: Partial<BlogPost> & { title: string; slug: string }): Promise<BlogPost> {
  const now = new Date().toISOString();
  const existing = await getBlogBySlug(blog.slug);

  // 1. Live write to WordPress REST API
  const wpPostId = blog.id || existing?.id;
  let liveUpdatedPost: BlogPost | null = null;

  if (wpPostId && !isNaN(Number(wpPostId))) {
    try {
      liveUpdatedPost = await updateWordPressPost(wpPostId, {
        title: blog.title,
        description: blog.description,
        content: blog.content,
        status: blog.status,
      });
      console.log(`[WordPress REST API] Successfully updated post ${wpPostId} live!`);
    } catch (wpErr) {
      console.error(`[WordPress Live Update Error on post ${wpPostId}]:`, wpErr);
    }
  } else if (!existing) {
    try {
      liveUpdatedPost = await createWordPressPost({
        title: blog.title,
        description: blog.description,
        content: blog.content,
        status: blog.status,
      });
      console.log(`[WordPress REST API] Successfully created new post live! ID: ${liveUpdatedPost.id}`);
    } catch (wpErr) {
      console.error("[WordPress Live Create Error]:", wpErr);
    }
  }

  // Trigger instant on-demand revalidation on deployed MetaMindful website
  try {
    const mmUrl = process.env.METAMINDFUL_SITE_URL || "https://metamindful-latest.vercel.app";
    const secret = process.env.REVALIDATION_SECRET || "metamindful_crm_sync_secret_2026";
    fetch(`${mmUrl}/api/revalidate?secret=${secret}&slug=${encodeURIComponent(blog.slug)}`, {
      method: "POST",
    })
      .then((r) => r.json())
      .then((res) => console.log(`[MetaMindful Revalidation] Purged cache on ${mmUrl}:`, res))
      .catch((err) => console.warn(`[MetaMindful Revalidation Notice]:`, err.message));
  } catch (revalErr) {
    console.warn("[Revalidation Error]:", revalErr);
  }

  // 2. Merge with CRM session state
  const base = liveUpdatedPost || existing;
  const updated: BlogPost = {
    ...(base || {
      id: blog.id || `blog_${Date.now()}`,
      slug: blog.slug,
      title: blog.title,
      description: blog.description || "",
      category: blog.category || "Mindfulness",
      readingTime: blog.readingTime || "5 min read",
      featured: Boolean(blog.featured),
      status: blog.status || "PUBLISHED",
      authorInfo: blog.authorInfo || {
        name: "MetaMindful Editorial Team",
        role: "Editorial Team",
        avatarUrl: "/icons/logo-mark.svg",
      },
      coverImage: blog.coverImage || {
        src: `/images/blog/${blog.slug}.webp`,
        alt: blog.title,
        width: 1536,
        height: 1024,
      },
      seo: blog.seo || {
        title: `${blog.title} | MetaMindful`,
        description: blog.description || "",
        canonical: `/blog/${blog.slug}`,
      },
      relatedSlugs: [],
      structuredSections: [],
      publishedAt: now.split("T")[0],
      updatedAt: now,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      version: "v1.0",
    }),
    ...blog,
    updatedAt: now,
  };

  const overrides = store.blogOverrides || (store.blogOverrides = new Map());
  overrides.set(blog.slug, updated);
  if (blog.id) overrides.set(blog.id, updated);
  if (liveUpdatedPost?.id) overrides.set(liveUpdatedPost.id, updated);
  return updated;
}

export async function deleteBlog(idOrSlug: string): Promise<boolean> {
  const deletedSlugs = store.deletedBlogSlugs || (store.deletedBlogSlugs = new Set());
  deletedSlugs.add(idOrSlug);

  // If numeric or matched post has numeric ID, delete in WordPress
  const targetId = !isNaN(Number(idOrSlug))
    ? idOrSlug
    : (await getBlogBySlug(idOrSlug))?.id;

  if (targetId && !isNaN(Number(targetId))) {
    try {
      await deleteWordPressPost(targetId);
      console.log(`[WordPress REST API] Successfully deleted post ${targetId} live!`);

      const mmUrl = process.env.METAMINDFUL_SITE_URL || "https://metamindful-latest.vercel.app";
      const secret = process.env.REVALIDATION_SECRET || "metamindful_crm_sync_secret_2026";
      fetch(`${mmUrl}/api/revalidate?secret=${secret}&slug=${encodeURIComponent(idOrSlug)}`, {
        method: "POST",
      }).catch(() => null);
    } catch (wpErr) {
      console.error(`[WordPress Live Delete Error on post ${targetId}]:`, wpErr);
    }
  }

  return true;
}

export async function likeBlog(slug: string): Promise<number> {
  const likes = store.blogLikes || (store.blogLikes = new Map());
  const currentLikes = likes.get(slug) || 0;
  const newLikes = currentLikes + 1;
  likes.set(slug, newLikes);

  const post = await getBlogBySlug(slug);
  return post?.likesCount || newLikes;
}

/* ─── COMMENTS (MODERATION QUEUE) ────────────────────────────────────── */
export async function getComments(status?: CommentStatus, blogSlug?: string): Promise<BlogComment[]> {
  let list = [...store.comments];
  if (status) {
    list = list.filter((c) => c.status === status);
  }
  if (blogSlug) {
    list = list.filter((c) => c.blogSlug === blogSlug);
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addComment(comment: {
  blogSlug: string;
  authorName: string;
  authorEmail: string;
  content: string;
}): Promise<BlogComment> {
  const blog = await getBlogBySlug(comment.blogSlug);
  const newComment: BlogComment = {
    id: `comment_${Date.now()}`,
    blogId: blog?.id || "",
    blogTitle: blog?.title || comment.blogSlug,
    blogSlug: comment.blogSlug,
    authorName: comment.authorName,
    authorEmail: comment.authorEmail,
    content: comment.content,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };

  store.comments.unshift(newComment);
  if (blog) {
    blog.commentsCount = (blog.commentsCount || 0) + 1;
  }
  return newComment;
}

export async function updateCommentStatus(id: string, status: CommentStatus): Promise<boolean> {
  const comment = store.comments.find((c) => c.id === id);
  if (comment) {
    comment.status = status;
    return true;
  }
  return false;
}

/* ─── AIREC SERVICES ─────────────────────────────────────────────────── */
export async function getServices(): Promise<ServiceItem[]> {
  return [...store.airecServices].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getServiceBySlug(slug: string): Promise<ServiceItem | null> {
  const found = store.airecServices.find((s) => s.slug === slug);
  return found || null;
}

export async function saveService(service: Partial<ServiceItem> & { title: string; slug: string }): Promise<ServiceItem> {
  const existingIdx = store.airecServices.findIndex((s) => s.slug === service.slug || s.id === service.id);
  const now = new Date().toISOString();

  if (existingIdx >= 0) {
    const updated: ServiceItem = {
      ...store.airecServices[existingIdx],
      ...service,
      updatedAt: now,
    };
    store.airecServices[existingIdx] = updated;
    return updated;
  }

  const newItem: ServiceItem = {
    id: service.id || `svc_${Date.now()}`,
    serviceCode: service.serviceCode || `0${store.airecServices.length + 1}`,
    slug: service.slug,
    title: service.title,
    tagline: service.tagline || "",
    subheading: service.subheading || "",
    body: service.body || "",
    introParagraphs: service.introParagraphs || [],
    taglinePills: service.taglinePills || [],
    capabilities: service.capabilities || [],
    primaryButton: service.primaryButton || "Discuss Your Project",
    meta: service.meta || {
      title: `${service.title} | AIREC`,
      description: service.tagline || "",
    },
    sortOrder: service.sortOrder || store.airecServices.length + 1,
    isActive: true,
    updatedAt: now,
  };

  store.airecServices.push(newItem);
  return newItem;
}

/* ─── AIREC PRODUCTS ─────────────────────────────────────────────────── */
export async function getProducts(): Promise<ProductItem[]> {
  return [...store.airecProducts];
}

export async function saveProduct(product: ProductItem): Promise<ProductItem> {
  const idx = store.airecProducts.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    store.airecProducts[idx] = { ...product, updatedAt: new Date().toISOString() };
    return store.airecProducts[idx];
  }
  store.airecProducts.push(product);
  return product;
}

/* ─── FAQS (CROSS-BRAND) ─────────────────────────────────────────────── */
export async function getFaqs(brand?: TenantBrand, serviceSlug?: string): Promise<FAQItem[]> {
  let list = [...store.faqs];
  if (brand) {
    list = list.filter((f) => f.brand === brand);
  }
  if (serviceSlug) {
    list = list.filter((f) => f.serviceSlug === serviceSlug);
  }
  return list.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function saveFaq(faq: Partial<FAQItem> & { question: string; answer: string; brand: TenantBrand }): Promise<FAQItem> {
  const existingIdx = store.faqs.findIndex((f) => f.id === faq.id);
  const now = new Date().toISOString();

  if (existingIdx >= 0) {
    const updated: FAQItem = {
      ...store.faqs[existingIdx],
      ...faq,
      updatedAt: now,
    };
    store.faqs[existingIdx] = updated;
    return updated;
  }

  const newItem: FAQItem = {
    id: `faq_${Date.now()}`,
    brand: faq.brand,
    location: faq.location || (faq.brand === "metamindful" ? "METAMINDFUL_HOME" : "AIREC_SERVICE"),
    serviceSlug: faq.serviceSlug,
    question: faq.question,
    answer: faq.answer,
    vectorTag: faq.vectorTag,
    sortOrder: faq.sortOrder || store.faqs.length + 1,
    isVisible: true,
    updatedAt: now,
  };

  store.faqs.push(newItem);
  return newItem;
}

export async function deleteFaq(id: string): Promise<boolean> {
  const prevCount = store.faqs.length;
  store.faqs = store.faqs.filter((f) => f.id !== id);
  return store.faqs.length < prevCount;
}

/* ─── LEGAL POLICIES ─────────────────────────────────────────────────── */
export async function getLegalDocuments(brand?: TenantBrand): Promise<LegalDocument[]> {
  let list = [...store.legalDocuments];
  if (brand) {
    list = list.filter((d) => d.brand === brand);
  }
  return list;
}

export async function getLegalDocument(brand: TenantBrand, type: "PRIVACY_POLICY" | "TERMS_OF_USE"): Promise<LegalDocument | null> {
  const found = store.legalDocuments.find((d) => d.brand === brand && d.type === type);
  return found || null;
}

export async function saveLegalDocument(doc: LegalDocument): Promise<LegalDocument> {
  const idx = store.legalDocuments.findIndex((d) => d.brand === doc.brand && d.type === doc.type);
  const updated: LegalDocument = {
    ...doc,
    updatedAt: new Date().toISOString(),
  };

  if (idx >= 0) {
    store.legalDocuments[idx] = updated;
  } else {
    store.legalDocuments.push(updated);
  }
  return updated;
}

/* ─── CONTACT INQUIRIES (SUBMISSIONS FROM CONTACT FORMS) ──────────────── */
export async function getInquiries(brand?: TenantBrand, status?: InquiryStatus): Promise<ContactInquiry[]> {
  let list = [...store.inquiries];
  if (brand) {
    list = list.filter((l) => l.brand === brand);
  }
  if (status) {
    list = list.filter((l) => l.status === status);
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createInquiry(inquiry: {
  brand: TenantBrand;
  name: string;
  email: string;
  organization?: string;
  message: string;
  serviceInterest?: string;
  sourceUrl?: string;
}): Promise<ContactInquiry> {
  const newInquiry: ContactInquiry = {
    id: `inq_${Date.now()}`,
    brand: inquiry.brand,
    name: inquiry.name,
    email: inquiry.email,
    organization: inquiry.organization,
    message: inquiry.message,
    serviceInterest: inquiry.serviceInterest,
    sourceUrl: inquiry.sourceUrl,
    status: "NEW",
    createdAt: new Date().toISOString(),
  };

  store.inquiries.unshift(newInquiry);
  return newInquiry;
}

export async function updateInquiryStatus(id: string, status: InquiryStatus, notes?: string): Promise<boolean> {
  const inq = store.inquiries.find((l) => l.id === id);
  if (inq) {
    inq.status = status;
    if (notes !== undefined) inq.notes = notes;
    return true;
  }
  return false;
}

/* ─── ACCOUNT DELETIONS (COMPLIANCE DESK) ────────────────────────────── */
export async function getDeletions(status?: DeletionStatus): Promise<DeletionRequest[]> {
  let list = [...store.deletions];
  if (status) {
    list = list.filter((d) => d.status === status);
  }
  return list.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
}

export async function createDeletion(email: string, reason?: string, ipAddress?: string): Promise<DeletionRequest> {
  const now = new Date();
  const graceEnd = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30); // 30 days

  const newReq: DeletionRequest = {
    id: `del_${Date.now()}`,
    email,
    reason,
    status: "PENDING",
    requestedAt: now.toISOString(),
    gracePeriodEndsAt: graceEnd.toISOString(),
    ipAddress,
  };

  store.deletions.unshift(newReq);
  return newReq;
}

export async function updateDeletionStatus(id: string, status: DeletionStatus, notes?: string): Promise<boolean> {
  const req = store.deletions.find((d) => d.id === id);
  if (req) {
    req.status = status;
    if (notes !== undefined) req.notes = notes;
    return true;
  }
  return false;
}

/* ─── CRM METRICS ────────────────────────────────────────────────────── */
export async function getCRMMetrics(brand?: TenantBrand): Promise<CRMMetrics> {
  const inquiries = brand ? store.inquiries.filter((l) => l.brand === brand) : store.inquiries;
  const faqs = brand ? store.faqs.filter((f) => f.brand === brand) : store.faqs;
  const blogs = brand === "airec" ? [] : await getBlogs();

  return {
    totalBlogs: brand === "airec" ? 0 : blogs.length,
    totalCommentsPending: brand === "airec" ? 0 : store.comments.filter((c) => c.status === "PENDING").length,
    totalDeletionsPending: brand === "airec" ? 0 : store.deletions.filter((d) => d.status === "PENDING").length,
    totalInquiriesNew: inquiries.filter((l) => l.status === "NEW").length,
    totalServices: brand === "metamindful" ? 0 : store.airecServices.length,
    totalFAQs: faqs.length,
    totalProducts: brand === "metamindful" ? 0 : 1,
    totalLegalDocs: brand ? store.legalDocuments.filter((d) => d.brand === brand).length : store.legalDocuments.length,
  };
}
