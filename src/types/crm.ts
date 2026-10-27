export type TenantBrand = "metamindful" | "airec";

/* ─── MetaMindful Blogs & Social Interaction ────────────────────────── */
export interface BlogAuthor {
  name: string;
  role: string;
  avatarUrl: string;
}

export interface BlogMedia {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface BlogSEO {
  title: string;
  description: string;
  canonical?: string;
  noIndex?: boolean;
}

export interface BlogSection {
  id?: string;
  heading?: string;
  paragraphs: string[];
  subsections?: { heading: string; body: string }[];
  callout?: { title: string; body: string };
  inlineImage?: BlogMedia;
}

export type PublicationStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  readingTime: string;
  featured: boolean;
  status: PublicationStatus;
  authorInfo: BlogAuthor;
  coverImage: BlogMedia;
  seo: BlogSEO;
  relatedSlugs: string[];
  structuredSections: BlogSection[];
  content?: string;
  publishedAt: string;
  updatedAt?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  version: string;
}

export interface BlogRevision {
  id: string;
  blogId: string;
  versionTag: string;
  commitMessage: string;
  committedBy: string;
  snapshot: Partial<BlogPost>;
  createdAt: string;
}

export type CommentStatus = "PENDING" | "APPROVED" | "SPAM" | "REJECTED";

export interface BlogComment {
  id: string;
  blogId: string;
  blogTitle?: string;
  blogSlug?: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
}

/* ─── Legal Documents (Privacy & Terms) ─────────────────────────────── */
export interface LegalSection {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  callout?: {
    type?: "warning" | "info" | "emergency";
    title?: string;
    text?: string;
    bullets?: string[];
  };
  link?: { label: string; href: string };
}

export interface LegalDocument {
  id: string;
  brand: TenantBrand;
  type: "PRIVACY_POLICY" | "TERMS_OF_USE";
  title: string;
  versionTag: string; // e.g. "Version 2" or "August 12, 2026"
  lastUpdated: string;
  sections: LegalSection[];
  seo: BlogSEO;
  updatedAt: string;
}

/* ─── FAQs ──────────────────────────────────────────────────────────── */
export type FAQLocation = "METAMINDFUL_HOME" | "AIREC_SERVICE" | "AIREC_CAPABILITY" | "GENERAL";

export interface FAQItem {
  id: string;
  brand: TenantBrand;
  location: FAQLocation;
  serviceSlug?: string;
  question: string;
  answer: string;
  vectorTag?: string;
  sortOrder: number;
  isVisible: boolean;
  updatedAt: string;
}

/* ─── AIREC Services & Products ─────────────────────────────────────── */
export interface ServiceCapability {
  title: string;
  description: string;
  deliverables?: string[];
}

export interface ServiceItem {
  id: string;
  serviceCode: string; // "01", "02"...
  slug: string;
  title: string;
  tagline: string;
  subheading?: string;
  body: string;
  introParagraphs: string[];
  taglinePills: string[];
  capabilities: ServiceCapability[];
  primaryButton?: string;
  meta: {
    title: string;
    description: string;
    keywords?: string[];
  };
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
}

export interface ProductItem {
  id: string;
  name: string;
  label: string; // "Product / 01"
  tagline: string;
  body: string;
  moments: string[];
  boundaries: string[];
  methodSteps: { id: string; title: string; body: string }[];
  externalUrl?: string;
  isActive: boolean;
  updatedAt: string;
}

/* ─── Contact Form Inquiries (Real Form Submissions) ─────────────────── */
export type InquiryStatus = "NEW" | "REPLIED" | "ARCHIVED";

export interface ContactInquiry {
  id: string;
  brand: TenantBrand;
  name: string;
  email: string;
  organization?: string;
  message: string;
  serviceInterest?: string; // auto-tagged if submitted on AIREC service page
  sourceUrl?: string;
  status: InquiryStatus;
  notes?: string;
  createdAt: string;
}

/* ─── Account Deletions (Compliance Desk) ───────────────────────────── */
export type DeletionStatus = "PENDING" | "VERIFIED" | "COMPLETED" | "CANCELLED";

export interface DeletionRequest {
  id: string;
  email: string;
  reason?: string;
  status: DeletionStatus;
  requestedAt: string;
  gracePeriodEndsAt: string; // 30-day countdown
  notes?: string;
  ipAddress?: string;
}

/* ─── Dashboard Metrics ─────────────────────────────────────────────── */
export interface CRMMetrics {
  totalBlogs: number;
  totalCommentsPending: number;
  totalDeletionsPending: number;
  totalInquiriesNew: number;
  totalServices: number;
  totalFAQs: number;
  totalProducts?: number;
  totalLegalDocs?: number;
}

