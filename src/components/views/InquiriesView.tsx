"use client";

import React, { useState } from "react";
import type { ContactInquiry, InquiryStatus, TenantBrand } from "@/types/crm";
import { formatDateTime } from "@/lib/utils";

interface InquiriesViewProps {
  selectedBrand: TenantBrand;
  inquiries: ContactInquiry[];
  onUpdateStatus: (id: string, status: InquiryStatus) => Promise<void>;
}

export function InquiriesView({
  selectedBrand,
  inquiries,
  onUpdateStatus,
}: InquiriesViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const isMeta = selectedBrand === "metamindful";

  // Strictly isolated to the active brand
  const filtered = inquiries.filter((inq) => {
    const matchesBrand = inq.brand === selectedBrand;
    const matchesStatus = filterStatus === "ALL" || inq.status === filterStatus;
    return matchesBrand && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="bg-white border border-[#E4E7EC] p-4 sm:p-5 rounded-[20px] shadow-[0_2px_12px_rgba(21,156,240,0.04)] flex flex-col sm:flex-row items-center justify-between gap-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#161525] text-base tracking-tight">
              {isMeta ? "MetaMindful User Support Inquiries" : "AIREC Enterprise Consultation Quotes"}
            </h3>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase border font-mono ${
                isMeta
                  ? "bg-[#EAF6FF] text-[#159CF0] border-[#D0E7FF]"
                  : "bg-cyan-50 text-cyan-800 border-cyan-200"
              }`}
            >
              {isMeta ? "metamindful.ai" : "airec.tech"}
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            {isMeta
              ? "Reader questions, user feedback, and mental wellness app inquiries"
              : "B2B client project requests, LLM architecture inquiries & enterprise discovery calls"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center bg-[#F4F7FA] p-1 rounded-[11px] border border-[#E4E7EC] text-xs font-medium">
            {["ALL", "NEW", "REPLIED", "ARCHIVED"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-[8px] transition-all cursor-pointer ${
                  filterStatus === st
                    ? isMeta
                      ? "bg-[#159CF0] text-white font-semibold shadow-xs"
                      : "bg-cyan-600 text-white font-semibold shadow-xs"
                    : "text-[#667085] hover:text-[#161525]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="space-y-3.5">
        {filtered.length === 0 ? (
          <div className="bg-white border border-[#E4E7EC] rounded-[20px] p-12 text-center text-[#667085] text-xs">
            No contact inquiries found for {isMeta ? "MetaMindful" : "AIREC"} under this status filter.
          </div>
        ) : (
          filtered.map((inq) => (
            <div
              key={inq.id}
              className="bg-white border border-[#E4E7EC] hover:border-[#B8D5FF] rounded-[20px] p-5 sm:p-6 shadow-[0_2px_12px_rgba(21,156,240,0.04)] hover:shadow-[0_8px_24px_rgba(21,156,240,0.08)] transition-all space-y-3.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full border font-mono ${
                      inq.brand === "airec"
                        ? "bg-cyan-50 text-cyan-800 border-cyan-200"
                        : "bg-[#EAF6FF] text-[#159CF0] border-[#D0E7FF]"
                    }`}
                  >
                    {inq.brand}
                  </span>

                  <h4 className="font-semibold text-[#161525] text-sm">
                    {inq.name}
                  </h4>

                  {inq.organization && (
                    <span className="text-xs text-[#667085] font-normal">
                      ({inq.organization})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase border font-mono ${
                      inq.status === "NEW"
                        ? isMeta
                          ? "bg-[#EAF6FF] text-[#159CF0] border-[#D0E7FF]"
                          : "bg-cyan-50 text-cyan-700 border-cyan-200"
                        : inq.status === "REPLIED"
                        ? "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]"
                        : "bg-[#F4F7FA] text-[#667085] border-[#E4E7EC]"
                    }`}
                  >
                    {inq.status}
                  </span>

                  <select
                    value={inq.status}
                    onChange={(e) => onUpdateStatus(inq.id, e.target.value as InquiryStatus)}
                    className="bg-[#FAFDFF] border border-[#E4E7EC] text-xs text-[#344054] rounded-[9px] px-2.5 py-1 font-medium focus:outline-none focus:border-[#159CF0] cursor-pointer"
                  >
                    <option value="NEW">Mark New</option>
                    <option value="REPLIED">Mark Replied</option>
                    <option value="ARCHIVED">Archive</option>
                  </select>
                </div>
              </div>

              {/* Service Interest Pill */}
              {inq.serviceInterest && (
                <div className="inline-block text-[11px] font-medium text-[#159CF0] bg-[#EAF6FF] px-2.5 py-1 rounded-full border border-[#D0E7FF]">
                  Service/Topic: <strong className="font-semibold">{inq.serviceInterest}</strong>
                </div>
              )}

              {/* Message Box */}
              <div className="bg-[#FAFDFF] p-4 rounded-[14px] border border-[#EDF2F7] text-xs text-[#344054] leading-relaxed">
                "{inq.message}"
              </div>

              {/* Footer Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#667085] pt-1 border-t border-[#EDF2F7]">
                <span className="font-mono">
                  Email: <a href={`mailto:${inq.email}`} className="text-[#159CF0] hover:underline font-medium">{inq.email}</a>
                </span>
                <span>Submitted: {formatDateTime(inq.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
