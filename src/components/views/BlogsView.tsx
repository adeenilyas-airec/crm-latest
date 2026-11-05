"use client";

import React, { useState } from "react";
import type { BlogPost } from "@/types/crm";

interface BlogsViewProps {
  blogs: BlogPost[];
  onSaveBlog: (blog: Partial<BlogPost> & { title: string; slug: string }) => Promise<void>;
  onLikeBlog: (slug: string) => Promise<void>;
}

/**
 * Mirror preview component that matches MetaMindful's exact design system:
 * (H2 borders, callout cards with gradients, numbered steps, blue bullet dots).
 */
function BlogContentPreview({ content }: { content: string }) {
  if (!content || !content.trim()) {
    return (
      <div className="p-8 text-center text-xs text-[#98A2B3] italic border border-dashed border-[#E4E7EC] rounded-[12px] bg-[#FAFDFF]">
        No article content provided yet. Type in the Editor tab to preview formatted text here.
      </div>
    );
  }

  const isHtml = /<(h2|h3|h4|p|ul|ol|blockquote|aside)[^>]*>/i.test(content);

  if (isHtml) {
    return (
      <div
        className="prose prose-sm max-w-none text-[#242533] p-5 bg-white border border-[#E4E7EC] rounded-[14px] max-h-[420px] overflow-y-auto space-y-3.5 shadow-inner
        [&_h2]:text-[20px] [&_h2]:font-semibold [&_h2]:text-[#161525] [&_h2]:border-t [&_h2]:border-black/[0.06] [&_h2]:pt-4 [&_h2]:mt-6 [&_h2:first-child]:border-0 [&_h2:first-child]:pt-0
        [&_h3]:text-[17px] [&_h3]:font-semibold [&_h3]:text-[#161525] [&_h3]:mt-4
        [&_p]:text-[14px] [&_p]:text-[#242533] [&_p]:leading-[25px] [&_p]:m-0
        [&_strong]:font-semibold [&_strong]:text-[#161525]
        [&_aside]:rounded-[14px] [&_aside]:bg-gradient-to-br [&_aside]:from-[#F4F9FF] [&_aside]:to-[#EBF4FE] [&_aside]:border [&_aside]:border-[#D5E7FA] [&_aside]:p-5 [&_aside]:my-4 [&_aside]:shadow-xs
        [&_aside_p]:text-[14.5px] [&_aside_p]:text-[#1E293B] [&_aside_p]:font-medium
        [&_ul]:my-3 [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:list-disc
        [&_li]:text-[14px] [&_li]:text-[#242533]"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Fallback plain text renderer
  const paragraphs = content.split(/\n\n+/).filter(Boolean);
  return (
    <div className="p-5 bg-white border border-[#E4E7EC] rounded-[14px] max-h-[420px] overflow-y-auto space-y-3 shadow-inner">
      {paragraphs.map((p, idx) => (
        <p key={idx} className="text-[14px] text-[#242533] leading-[25px] m-0">
          {p}
        </p>
      ))}
    </div>
  );
}

export function BlogsView({ blogs, onSaveBlog, onLikeBlog }: BlogsViewProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");
  const [contentTab, setContentTab] = useState<"edit" | "preview">("edit");

  const categories = ["all", ...Array.from(new Set(blogs.map((b) => b.category)))];

  const filtered = blogs
    .filter((b) => {
      const matchesSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.slug.toLowerCase().includes(search.toLowerCase()) ||
        b.category.toLowerCase().includes(search.toLowerCase());
      const matchesCat = selectedCategory === "all" || b.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      const timeA = new Date(a.publishedAt).getTime();
      const timeB = new Date(b.publishedAt).getTime();
      if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
        return timeB - timeA;
      }
      return Number(a.id) - Number(b.id);
    });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;
    setIsSaving(true);
    try {
      await onSaveBlog({
        ...editingBlog,
        content: editingBlog.content,
        version: commitMessage ? `v${(parseFloat(editingBlog.version?.replace("v", "") || "1.0") + 0.1).toFixed(1)}` : editingBlog.version,
      });
      setEditingBlog(null);
      setCommitMessage("");
    } finally {
      setIsSaving(false);
    }
  };

  const insertSnippet = (snippet: string) => {
    if (!editingBlog) return;
    const current = editingBlog.content || "";
    const updated = current ? `${current}\n\n${snippet}` : snippet;
    setEditingBlog({ ...editingBlog, content: updated });
  };

  return (
    <div className="space-y-6">
      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#E4E7EC] rounded-[12px] px-3.5 py-2 text-sm text-[#161525] placeholder-[#98A2B3] focus:outline-none focus:border-[#159CF0]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-[9px] text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#159CF0] text-white shadow-xs"
                  : "bg-white text-[#667085] border border-[#E4E7EC] hover:bg-[#F9FAFB]"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((blog) => (
          <div
            key={blog.id}
            className="bg-white border border-[#E4E7EC] rounded-[18px] p-5 shadow-xs flex flex-col justify-between hover:border-[#B2DDFF] transition-all group"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-[#667085] mb-2 font-mono">
                <span className="bg-[#F2F4F7] text-[#344054] px-2 py-0.5 rounded-[6px] font-sans font-semibold">
                  {blog.category}
                </span>
                <span>{blog.readingTime}</span>
              </div>

              <h4 className="font-bold text-[#161525] text-base leading-snug group-hover:text-[#159CF0] transition-colors mb-2 line-clamp-2">
                {blog.title}
              </h4>

              <p className="text-xs text-[#667085] line-clamp-3 mb-4 leading-relaxed">
                {blog.description}
              </p>
            </div>

            <div className="pt-4 border-t border-[#F2F4F7] flex items-center justify-between text-xs text-[#667085]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onLikeBlog(blog.slug)}
                  className="flex items-center gap-1 hover:text-[#159CF0] transition-colors cursor-pointer"
                  title="Like article"
                >
                  <span>♥</span> {blog.likesCount || 0}
                </button>
                <span>💬 {blog.commentsCount || 0}</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://metamindful-latest.vercel.app/blog/${blog.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-[8px] bg-[#F2F4F7] hover:bg-[#E4E7EC] text-[#344054] text-xs font-semibold transition-all"
                  title="View on MetaMindful website"
                >
                  View Live ↗
                </a>
                <button
                  onClick={() => {
                    setEditingBlog(blog);
                    setContentTab("edit");
                  }}
                  className="px-3 py-1.5 rounded-[8px] bg-[#159CF0]/10 text-[#159CF0] hover:bg-[#159CF0] hover:text-white font-semibold transition-all cursor-pointer"
                >
                  Edit Article
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Clean Full-Feature Edit Blog Modal */}
      {editingBlog && (
        <div className="fixed inset-0 bg-[#161525]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white border border-[#E4E7EC] rounded-[24px] w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="px-6 py-4.5 border-b border-[#EDF2F7] flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <div>
                <h3 className="font-bold text-[#161525] text-base tracking-tight flex items-center gap-2">
                  <span>Edit Article & Full Content</span>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-[6px] bg-[#EAF6FF] text-[#159CF0]">
                    Live WordPress Sync
                  </span>
                </h3>
                <p className="text-xs text-[#667085] font-mono mt-0.5">
                  Slug: /blog/{editingBlog.slug}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingBlog(null)}
                className="text-[#667085] hover:text-[#161525] text-sm font-bold p-1 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 flex-1">
              <div>
                <label className="text-xs font-semibold text-[#344054] block mb-1">
                  Article Title
                </label>
                <input
                  type="text"
                  value={editingBlog.title}
                  onChange={(e) =>
                    setEditingBlog({ ...editingBlog, title: e.target.value })
                  }
                  className="w-full bg-[#FAFDFF] border border-[#E4E7EC] rounded-[11px] p-2.5 text-sm font-medium text-[#161525] focus:outline-none focus:border-[#159CF0]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#344054] block mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editingBlog.category}
                    onChange={(e) =>
                      setEditingBlog({ ...editingBlog, category: e.target.value })
                    }
                    className="w-full bg-[#FAFDFF] border border-[#E4E7EC] rounded-[11px] p-2.5 text-sm text-[#161525]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#344054] block mb-1">
                    Reading Time
                  </label>
                  <input
                    type="text"
                    value={editingBlog.readingTime}
                    onChange={(e) =>
                      setEditingBlog({ ...editingBlog, readingTime: e.target.value })
                    }
                    className="w-full bg-[#FAFDFF] border border-[#E4E7EC] rounded-[11px] p-2.5 text-sm text-[#161525] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#344054] block mb-1">
                  Summary Description (Lead Excerpt)
                </label>
                <textarea
                  rows={2}
                  value={editingBlog.description}
                  onChange={(e) =>
                    setEditingBlog({ ...editingBlog, description: e.target.value })
                  }
                  className="w-full bg-[#FAFDFF] border border-[#E4E7EC] rounded-[11px] p-2.5 text-sm text-[#161525]"
                />
              </div>

              {/* ─── FULL ARTICLE CONTENT EDITOR & PREVIEW ───────────────────────── */}
              <div className="border border-[#D0E7FF] rounded-[16px] p-4 bg-[#F8FAFC]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                  <div>
                    <label className="text-xs font-bold text-[#161525] block">
                      Article Full Content
                    </label>
                    <p className="text-[11px] text-[#667085]">
                      Prefilled live from WordPress. Supports HTML tags (<code className="text-[#159CF0]">&lt;h2&gt;</code>, <code className="text-[#159CF0]">&lt;h3&gt;</code>, <code className="text-[#159CF0]">&lt;p&gt;</code>, <code className="text-[#159CF0]">&lt;aside&gt;</code>, <code className="text-[#159CF0]">&lt;ul&gt;</code>) or clean text.
                    </p>
                  </div>

                  {/* Mode Switcher Tabs */}
                  <div className="flex items-center gap-1 bg-[#E4E7EC] p-1 rounded-[10px] self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setContentTab("edit")}
                      className={`px-3 py-1 rounded-[8px] text-xs font-semibold transition-all cursor-pointer ${
                        contentTab === "edit"
                          ? "bg-white text-[#161525] shadow-xs"
                          : "text-[#667085] hover:text-[#161525]"
                      }`}
                    >
                      ✏️ Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentTab("preview")}
                      className={`px-3 py-1 rounded-[8px] text-xs font-semibold transition-all cursor-pointer ${
                        contentTab === "preview"
                          ? "bg-white text-[#159CF0] shadow-xs"
                          : "text-[#667085] hover:text-[#161525]"
                      }`}
                    >
                      👁️ MetaMindful Preview
                    </button>
                  </div>
                </div>

                {/* Quick Insert Snippet Toolbar (Only in Edit mode) */}
                {contentTab === "edit" && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-3 pt-1 border-t border-[#E4E7EC]/80">
                    <span className="text-[10.5px] font-semibold text-[#667085] uppercase tracking-wider mr-1">
                      Quick Insert:
                    </span>
                    <button
                      type="button"
                      onClick={() => insertSnippet("<h2>Section Heading</h2>\n<p>Your paragraph text goes here.</p>")}
                      className="text-[11px] font-medium bg-white hover:bg-[#F2F4F7] text-[#344054] px-2.5 py-1 rounded-[7px] border border-[#D0D5DD] transition-all cursor-pointer"
                    >
                      + H2 Heading
                    </button>
                    <button
                      type="button"
                      onClick={() => insertSnippet("<h3>1. Step Title</h3>\n<p>Actionable routine step instructions.</p>")}
                      className="text-[11px] font-medium bg-white hover:bg-[#F2F4F7] text-[#344054] px-2.5 py-1 rounded-[7px] border border-[#D0D5DD] transition-all cursor-pointer"
                    >
                      + Step Card
                    </button>
                    <button
                      type="button"
                      onClick={() => insertSnippet("<aside>\n  <p><strong>Short answer:</strong> Your key takeaway or executive summary.</p>\n</aside>")}
                      className="text-[11px] font-medium bg-white hover:bg-[#EAF6FF] text-[#159CF0] px-2.5 py-1 rounded-[7px] border border-[#B2DDFF] transition-all cursor-pointer"
                    >
                      + Short Answer Box
                    </button>
                    <button
                      type="button"
                      onClick={() => insertSnippet("<ul>\n  <li>First point</li>\n  <li>Second point</li>\n</ul>")}
                      className="text-[11px] font-medium bg-white hover:bg-[#F2F4F7] text-[#344054] px-2.5 py-1 rounded-[7px] border border-[#D0D5DD] transition-all cursor-pointer"
                    >
                      + Bullet List
                    </button>
                  </div>
                )}

                {/* Tab 1: Editor View */}
                {contentTab === "edit" && (
                  <div>
                    <textarea
                      rows={12}
                      value={editingBlog.content || ""}
                      onChange={(e) =>
                        setEditingBlog({ ...editingBlog, content: e.target.value })
                      }
                      placeholder="Write or paste full article HTML/text here..."
                      className="w-full bg-white border border-[#D0E7FF] rounded-[12px] p-3.5 text-xs text-[#161525] font-mono leading-relaxed focus:outline-none focus:border-[#159CF0] focus:ring-1 focus:ring-[#159CF0]"
                    />
                    <div className="flex items-center justify-between text-[11px] text-[#667085] mt-1.5 px-1 font-mono">
                      <span>{(editingBlog.content || "").length} characters</span>
                      <span>
                        {(editingBlog.content || "")
                          .replace(/<[^>]+>/g, " ")
                          .split(/\s+/)
                          .filter(Boolean).length}{" "}
                        words
                      </span>
                    </div>
                  </div>
                )}

                {/* Tab 2: Live MetaMindful Formatted Preview */}
                {contentTab === "preview" && (
                  <BlogContentPreview content={editingBlog.content || ""} />
                )}
              </div>

              {/* SEO Controls */}
              <div className="p-4 bg-[#FAFDFF] rounded-[14px] border border-[#E4E7EC] space-y-3">
                <span className="text-xs font-bold uppercase text-[#159CF0] tracking-wider block">
                  SEO Metadata
                </span>
                <div>
                  <label className="text-xs font-medium text-[#667085] block mb-1">
                    SEO Title ({editingBlog.seo?.title?.length || 0}/60 chars)
                  </label>
                  <input
                    type="text"
                    value={editingBlog.seo?.title || ""}
                    onChange={(e) =>
                      setEditingBlog({
                        ...editingBlog,
                        seo: { ...editingBlog.seo, title: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-[#E4E7EC] rounded-[9px] p-2 text-xs text-[#161525]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#667085] block mb-1">
                    SEO Description ({editingBlog.seo?.description?.length || 0}/160 chars)
                  </label>
                  <textarea
                    rows={2}
                    value={editingBlog.seo?.description || ""}
                    onChange={(e) =>
                      setEditingBlog({
                        ...editingBlog,
                        seo: { ...editingBlog.seo, description: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-[#E4E7EC] rounded-[9px] p-2 text-xs text-[#161525]"
                  />
                </div>
              </div>

              {/* Revision Commit */}
              <div className="p-4 bg-[#EAF6FF]/60 rounded-[14px] border border-[#D0E7FF] space-y-1.5">
                <label className="text-xs font-bold text-[#161525] block">
                  Revision Commit Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Updated advice for workplace mindfulness"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="w-full bg-white border border-[#D0E7FF] rounded-[9px] p-2 text-xs text-[#161525] focus:outline-none focus:border-[#159CF0]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EDF2F7]">
                <button
                  type="button"
                  onClick={() => setEditingBlog(null)}
                  className="px-4 py-2 rounded-[11px] bg-white hover:bg-[#F4F7FA] text-[#667085] text-xs font-semibold border border-[#E4E7EC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-[11px] bg-[#159CF0] hover:bg-[#0879DC] text-white text-xs font-bold shadow-[0_4px_12px_rgba(21,156,240,0.28)] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSaving ? "Saving..." : "Save Article & Sync Live"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
