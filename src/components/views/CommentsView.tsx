"use client";

import React, { useState } from "react";
import type { BlogComment, CommentStatus } from "@/types/crm";
import { formatDateTime } from "@/lib/utils";

interface CommentsViewProps {
  comments: BlogComment[];
  onUpdateStatus: (id: string, status: CommentStatus) => Promise<void>;
}

export function CommentsView({ comments, onUpdateStatus }: CommentsViewProps) {
  const [filter, setFilter] = useState<string>("ALL");

  const filtered = comments.filter((c) => {
    if (filter === "ALL") return true;
    return c.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white border border-[#E4E7EC] rounded-[20px] p-5 shadow-[0_2px_12px_rgba(21,156,240,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#161525] tracking-tight">
            Community Comment Moderation
          </h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Incoming reader comments on MetaMindful articles require approval before appearing on the public blog
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 bg-[#F4F7FA] p-1 rounded-[11px] border border-[#E4E7EC]">
          {["ALL", "PENDING", "APPROVED", "SPAM"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1 rounded-[8px] text-xs font-semibold transition-all ${
                filter === st
                  ? "bg-[#159CF0] text-white shadow-xs"
                  : "text-[#667085] hover:text-[#161525]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3.5">
        {filtered.length === 0 ? (
          <div className="bg-white border border-[#E4E7EC] rounded-[20px] p-12 text-center text-[#667085] text-sm">
            No comments found for this status filter.
          </div>
        ) : (
          filtered.map((comment) => (
            <div
              key={comment.id}
              className="bg-white border border-[#E4E7EC] hover:border-[#B8D5FF] rounded-[20px] p-5 sm:p-6 shadow-[0_2px_12px_rgba(21,156,240,0.04)] hover:shadow-[0_8px_24px_rgba(21,156,240,0.08)] flex flex-col md:flex-row items-start justify-between gap-4 transition-all"
            >
              <div className="space-y-2.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[#161525] text-sm">
                    {comment.authorName}
                  </span>
                  <span className="text-xs text-[#667085] font-mono">
                    ({comment.authorEmail})
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border uppercase ${
                      comment.status === "APPROVED"
                        ? "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]"
                        : comment.status === "PENDING"
                        ? "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]"
                        : "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]"
                    }`}
                  >
                    {comment.status}
                  </span>
                </div>

                <div className="text-xs text-[#667085]">
                  Article: <span className="font-semibold text-[#159CF0] font-mono">/blog/{comment.blogSlug}</span>
                </div>

                <div className="text-xs text-[#344054] bg-[#FAFDFF] p-4 rounded-[14px] border border-[#EDF2F7] leading-relaxed">
                  "{comment.content}"
                </div>

                <p className="text-xs text-[#667085]">
                  Submitted: {formatDateTime(comment.createdAt)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {comment.status !== "APPROVED" && (
                  <button
                    onClick={() => onUpdateStatus(comment.id, "APPROVED")}
                    className="px-3.5 py-1.5 rounded-[10px] bg-[#159CF0] hover:bg-[#0879DC] text-white text-xs font-semibold cursor-pointer shadow-[0_4px_12px_rgba(21,156,240,0.25)] transition-all"
                  >
                    Approve
                  </button>
                )}

                {comment.status !== "SPAM" && (
                  <button
                    onClick={() => onUpdateStatus(comment.id, "SPAM")}
                    className="px-3.5 py-1.5 rounded-[10px] bg-white hover:bg-[#F4F7FA] text-[#667085] border border-[#E4E7EC] text-xs font-medium cursor-pointer transition-colors"
                  >
                    Mark Spam
                  </button>
                )}

                <button
                  onClick={() => onUpdateStatus(comment.id, "REJECTED")}
                  className="px-3.5 py-1.5 rounded-[10px] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] text-xs font-medium cursor-pointer transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
