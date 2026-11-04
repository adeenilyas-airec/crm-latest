"use client";

import React, { useState } from "react";
import type { BlogPost } from "@/types/crm";

interface BlogsViewProps {
  blogs: BlogPost[];
  onSaveBlog: (blog: Partial<BlogPost> & { title: string; slug: string }) => Promise<void>;
  onLikeBlog: (slug: string) => Promise<void>;
}

export function BlogsView({ blogs, onSaveBlog, onLikeBlog }: BlogsViewProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");

  const categories = ["all", ...Array.from(new Set(blogs.map((b) => b.category)))];

  const filtered = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.slug.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "all" || b.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;
    setIsSaving(true);
    try {
      await onSaveBlog({
        ...editingBlog,
        version: commitMessage ? `v${(parseFloat(editingBlog.version?.replace("v", "") || "1.0") + 0.1).toFixed(1)}` : editingBlog.version,
      });
      setEditingBlog(null);
      setCommitMessage("");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Category Filter - MetaMindful Styling */}
      <div className="bg-white border border-[#E4E7EC] p-4 sm:p-5 rounded-[20px] shadow-[0_2px_12px_rgba(21,156,240,0.04)] flex flex-col sm:flex-row items-center justify-between gap-3.5">
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder={`Search ${blogs.length || 21} MetaMindful articles...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAFDFF] border border-[#E4E7EC] rounded-[11px] px-3.5 py-2 text-xs text-[#161525] placeholder-[#98A2B3] focus:outline-none focus:border-[#159CF0] focus:ring-2 focus:ring-[#159CF0]/15 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.slice(0, 6).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all whitespace-nowrap ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-[#159CF0] text-white shadow-xs font-semibold"
                  : "bg-white text-[#667085] hover:text-[#161525] hover:bg-[#F4F7FA] border border-[#E4E7EC]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((blog) => (
          <div
            key={blog.id}
            className="bg-white border border-[#E4E7EC] hover:border-[#B8D5FF] rounded-[22px] overflow-hidden flex flex-col justify-between shadow-[0_2px_12px_rgba(21,156,240,0.04)] hover:shadow-[0_8px_30px_rgba(21,156,240,0.08)] hover:-translate-y-0.5 transition-all duration-300"
          >
            {/* Top Info Header */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#159CF0] bg-[#EAF6FF] px-2.5 py-0.5 rounded-full text-[11px] border border-[#D0E7FF]">
                  {blog.category}
                </span>
                <span className="font-mono text-[10px] font-bold text-[#166534] bg-[#F0FDF4] px-2 py-0.5 rounded-full border border-[#BBF7D0] uppercase">
                  {blog.status}
                </span>
              </div>

              <h4 className="font-medium text-[#161525] text-[16px] line-clamp-2 leading-snug tracking-[-0.3px] hover:text-[#159CF0] transition-colors">
                {blog.title}
              </h4>

              <p className="text-xs text-[#667085] line-clamp-2 leading-relaxed">
                {blog.description}
              </p>
            </div>

            {/* Engagement Stats & Actions Bar */}
            <div className="px-5 py-3.5 bg-[#FAFDFF] border-t border-[#EDF2F7] flex items-center justify-between text-xs text-[#667085]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onLikeBlog(blog.slug)}
                  title="Simulate reader like"
                  className="hover:text-[#159CF0] transition-colors cursor-pointer font-medium flex items-center gap-1"
                >
                  <span className="text-[#159CF0]">♥</span> {blog.likesCount || 0}
                </button>
                <span>💬 {blog.commentsCount || 0}</span>
                <span>↗ {blog.sharesCount || 0}</span>
              </div>

              <button
                onClick={() => setEditingBlog(blog)}
                className="px-3 py-1.5 rounded-[9px] bg-white hover:bg-[#EAF6FF] text-[#159CF0] font-semibold text-xs border border-[#D0E7FF] hover:border-[#159CF0] transition-all cursor-pointer shadow-2xs"
              >
                Edit Post
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Clean Edit Blog Modal */}
      {editingBlog && (
        <div className="fixed inset-0 bg-[#161525]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4E7EC] rounded-[24px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="px-6 py-4.5 border-b border-[#EDF2F7] flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <div>
                <h3 className="font-bold text-[#161525] text-base tracking-tight">
                  Edit Article Details
                </h3>
                <p className="text-xs text-[#667085] font-mono mt-0.5">
                  Slug: /blog/{editingBlog.slug}
                </p>
              </div>
              <button
                onClick={() => setEditingBlog(null)}
                className="text-[#667085] hover:text-[#161525] text-sm font-bold p-1 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 flex-1">
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
                  className="w-full bg-[#FAFDFF] border border-[#E4E7EC] rounded-[11px] p-2.5 text-sm text-[#161525] focus:outline-none focus:border-[#159CF0]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  Summary Description
                </label>
                <textarea
                  rows={3}
                  value={editingBlog.description}
                  onChange={(e) =>
                    setEditingBlog({ ...editingBlog, description: e.target.value })
                  }
                  className="w-full bg-[#FAFDFF] border border-[#E4E7EC] rounded-[11px] p-2.5 text-sm text-[#161525]"
                />
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
                  className="px-4.5 py-2 rounded-[11px] bg-[#159CF0] hover:bg-[#0879DC] text-white text-xs font-semibold shadow-[0_4px_12px_rgba(21,156,240,0.28)] transition-all cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Save Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
