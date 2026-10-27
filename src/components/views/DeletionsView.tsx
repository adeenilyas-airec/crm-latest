"use client";

import React, { useState } from "react";
import type { DeletionRequest, DeletionStatus } from "@/types/crm";
import { formatDateTime } from "@/lib/utils";

interface DeletionsViewProps {
  deletions: DeletionRequest[];
  onUpdateStatus: (id: string, status: DeletionStatus, notes?: string) => Promise<void>;
}

export function DeletionsView({ deletions, onUpdateStatus }: DeletionsViewProps) {
  const [filter, setFilter] = useState<string>("ALL");

  const filtered = deletions.filter((d) => {
    if (filter === "ALL") return true;
    return d.status === filter;
  });

  const getRemainingDays = (graceEndsAt: string) => {
    const remainingMs = new Date(graceEndsAt).getTime() - Date.now();
    const days = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days remaining` : "Grace period expired";
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner - MetaMindful Style */}
      <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-[20px] p-5.5 space-y-1">
        <h3 className="font-bold text-[#991B1B] text-sm tracking-tight">
          GDPR / CCPA Account Deletion Compliance Desk
        </h3>
        <p className="text-xs text-[#344054] leading-relaxed">
          Requests submitted via MetaMindful account settings appear in this queue. Statutory privacy guidelines mandate user data and conversation histories be permanently scrubbed upon expiry of the 30-day retention grace period.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-[20px] border border-[#E4E7EC] shadow-[0_2px_12px_rgba(21,156,240,0.04)]">
        <span className="text-xs font-semibold text-[#161525]">
          Total Compliance Records: <span className="font-mono text-[#159CF0]">{deletions.length}</span>
        </span>
        <div className="flex items-center gap-1 bg-[#F4F7FA] p-1 rounded-[11px] border border-[#E4E7EC]">
          {["ALL", "PENDING", "VERIFIED", "COMPLETED", "CANCELLED"].map((st) => (
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

      {/* Deletions Table */}
      <div className="space-y-3.5">
        {filtered.length === 0 ? (
          <div className="bg-white border border-[#E4E7EC] rounded-[20px] p-12 text-center text-[#667085] text-sm">
            No deletion requests found for this filter.
          </div>
        ) : (
          filtered.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-[#E4E7EC] hover:border-[#FECACA] rounded-[20px] p-5 sm:p-6 shadow-[0_2px_12px_rgba(21,156,240,0.04)] hover:shadow-[0_8px_24px_rgba(239,68,68,0.08)] flex flex-col md:flex-row items-start justify-between gap-4 transition-all"
            >
              <div className="space-y-2.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-[#161525] text-sm font-mono">
                    {req.email}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase border font-mono ${
                      req.status === "COMPLETED"
                        ? "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]"
                        : req.status === "PENDING"
                        ? "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]"
                        : req.status === "VERIFIED"
                        ? "bg-[#EAF6FF] text-[#159CF0] border-[#D0E7FF]"
                        : "bg-[#F4F7FA] text-[#667085] border-[#E4E7EC]"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="text-xs text-[#344054] bg-[#FAFDFF] p-3.5 rounded-[12px] border border-[#EDF2F7]">
                  <span className="font-semibold text-[#161525]">User Reason: </span>
                  {req.reason || "No reason specified."}
                </div>

                <div className="flex flex-wrap items-center gap-6 text-xs text-[#667085] pt-1">
                  <span>Requested: {formatDateTime(req.requestedAt)}</span>
                  <span className="font-semibold text-[#EF4444]">
                    Retention Clock: {getRemainingDays(req.gracePeriodEndsAt)}
                  </span>
                </div>

                {req.notes && (
                  <p className="text-xs text-[#667085] italic">
                    Audit Note: {req.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                {req.status === "PENDING" && (
                  <button
                    onClick={() =>
                      onUpdateStatus(req.id, "VERIFIED", "Identity confirmed with user.")
                    }
                    className="px-3.5 py-1.5 rounded-[10px] bg-[#159CF0] hover:bg-[#0879DC] text-white text-xs font-semibold cursor-pointer shadow-[0_4px_12px_rgba(21,156,240,0.25)] transition-all"
                  >
                    Verify Identity
                  </button>
                )}

                {req.status !== "COMPLETED" && (
                  <button
                    onClick={() =>
                      onUpdateStatus(req.id, "COMPLETED", "All PII scrubbed from database.")
                    }
                    className="px-3.5 py-1.5 rounded-[10px] bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                  >
                    Mark Scrubbed
                  </button>
                )}

                {req.status !== "CANCELLED" && (
                  <button
                    onClick={() =>
                      onUpdateStatus(req.id, "CANCELLED", "User cancelled deletion request.")
                    }
                    className="px-3.5 py-1.5 rounded-[10px] bg-white hover:bg-[#F4F7FA] text-[#667085] border border-[#E4E7EC] text-xs font-medium cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
