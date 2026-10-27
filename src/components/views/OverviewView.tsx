"use client";

import React from "react";
import type { CRMMetrics, ContactInquiry, DeletionRequest, BlogComment, TenantBrand } from "@/types/crm";
import { formatDate } from "@/lib/utils";

interface OverviewViewProps {
  selectedBrand: TenantBrand;
  metrics: CRMMetrics;
  recentInquiries: ContactInquiry[];
  recentDeletions: DeletionRequest[];
  recentComments: BlogComment[];
  onNavigate: (tab: string) => void;
}

export function OverviewView({
  selectedBrand,
  metrics,
  recentInquiries = [],
  recentDeletions = [],
  recentComments = [],
  onNavigate,
}: OverviewViewProps) {
  const isMeta = selectedBrand === "metamindful";

  // Filter inquiries strictly to the selected brand
  const brandInquiries = recentInquiries.filter((inq) => inq.brand === selectedBrand);
  const safeInquiries = Array.isArray(brandInquiries) ? brandInquiries : [];
  const safeDeletions = Array.isArray(recentDeletions) ? recentDeletions : [];
  const safeComments = Array.isArray(recentComments) ? recentComments : [];

  return (
    <div className="space-y-6">
      {/* ================================================================ */}
      {/* 1. METAMINDFUL WORKSPACE OVERVIEW                                */}
      {/* ================================================================ */}
      {isMeta ? (
        <>
          {/* MetaMindful Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
            <div
              onClick={() => onNavigate("blogs")}
              className="bg-white border border-[#E4E7EC] hover:border-[#159CF0] p-5 rounded-[18px] shadow-[0_2px_12px_rgba(21,156,240,0.04)] hover:shadow-[0_8px_24px_rgba(21,156,240,0.12)] cursor-pointer transition-all duration-200 group"
            >
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
                Published Blogs
              </span>
              <div className="text-3xl font-bold text-[#161525] mt-1.5 font-sans group-hover:text-[#159CF0] transition-colors">
                {metrics.totalBlogs}
              </div>
              <span className="text-[11px] text-[#667085] mt-1 block">
                Articles & Media
              </span>
            </div>

            <div
              onClick={() => onNavigate("comments")}
              className="bg-white border border-[#E4E7EC] hover:border-[#159CF0] p-5 rounded-[18px] shadow-[0_2px_12px_rgba(21,156,240,0.04)] hover:shadow-[0_8px_24px_rgba(21,156,240,0.12)] cursor-pointer transition-all duration-200 group"
            >
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
                Pending Comments
              </span>
              <div className="text-3xl font-bold text-[#161525] mt-1.5 font-sans group-hover:text-[#159CF0] transition-colors">
                {metrics.totalCommentsPending}
              </div>
              <span className="text-[11px] text-[#667085] mt-1 block">
                To Moderate
              </span>
            </div>

            <div
              onClick={() => onNavigate("deletions")}
              className="bg-white border border-[#E4E7EC] hover:border-[#EF4444] p-5 rounded-[18px] shadow-[0_2px_12px_rgba(239,68,68,0.04)] hover:shadow-[0_8px_24px_rgba(239,68,68,0.12)] cursor-pointer transition-all duration-200 group"
            >
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
                GDPR Deletions
              </span>
              <div className="text-3xl font-bold text-[#EF4444] mt-1.5 font-sans">
                {metrics.totalDeletionsPending}
              </div>
              <span className="text-[11px] text-[#EF4444] font-medium mt-1 block">
                Active Grace Clock
              </span>
            </div>

            <div
              onClick={() => onNavigate("inquiries")}
              className="bg-white border border-[#E4E7EC] hover:border-[#159CF0] p-5 rounded-[18px] shadow-[0_2px_12px_rgba(21,156,240,0.04)] hover:shadow-[0_8px_24px_rgba(21,156,240,0.12)] cursor-pointer transition-all duration-200 group"
            >
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
                Support Inquiries
              </span>
              <div className="text-3xl font-bold text-[#159CF0] mt-1.5 font-sans">
                {metrics.totalInquiriesNew}
              </div>
              <span className="text-[11px] text-[#159CF0] font-medium mt-1 block">
                Pending Response
              </span>
            </div>

            <div
              onClick={() => onNavigate("faqs")}
              className="bg-white border border-[#E4E7EC] hover:border-[#159CF0] p-5 rounded-[18px] shadow-[0_2px_12px_rgba(21,156,240,0.04)] hover:shadow-[0_8px_24px_rgba(21,156,240,0.12)] cursor-pointer transition-all duration-200 group"
            >
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
                App & Web FAQs
              </span>
              <div className="text-3xl font-bold text-[#161525] mt-1.5 font-sans group-hover:text-[#159CF0] transition-colors">
                {metrics.totalFAQs}
              </div>
              <span className="text-[11px] text-[#667085] mt-1 block">
                Mental Wellness Q&As
              </span>
            </div>

            <div
              onClick={() => onNavigate("legal")}
              className="bg-white border border-[#E4E7EC] hover:border-[#159CF0] p-5 rounded-[18px] shadow-[0_2px_12px_rgba(21,156,240,0.04)] hover:shadow-[0_8px_24px_rgba(21,156,240,0.12)] cursor-pointer transition-all duration-200 group"
            >
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
                Privacy & Terms
              </span>
              <div className="text-3xl font-bold text-[#161525] mt-1.5 font-sans group-hover:text-[#159CF0] transition-colors">
                2
              </div>
              <span className="text-[11px] text-[#667085] mt-1 block">
                Enforceable Policies
              </span>
            </div>
          </div>

          {/* MetaMindful Operations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* MetaMindful Inquiries Panel */}
            <div className="bg-white border border-[#E4E7EC] rounded-[22px] p-6 shadow-[0_2px_12px_rgba(21,156,240,0.04)] space-y-4">
              <div className="flex items-center justify-between pb-3.5 border-b border-[#EDF2F7]">
                <div>
                  <h3 className="font-bold text-[#161525] text-base tracking-tight">
                    MetaMindful User Inquiries
                  </h3>
                  <p className="text-xs text-[#667085] mt-0.5">
                    Messages submitted via metamindful.ai/contact
                  </p>
                </div>
                <button
                  onClick={() => onNavigate("inquiries")}
                  className="text-xs text-[#159CF0] hover:text-[#0879DC] font-semibold transition-colors cursor-pointer"
                >
                  View All Inquiries →
                </button>
              </div>

              <div className="space-y-3">
                {safeInquiries.length === 0 ? (
                  <p className="text-xs text-[#667085] py-8 text-center">
                    No recent inquiries for MetaMindful.
                  </p>
                ) : (
                  safeInquiries.slice(0, 3).map((inq) => (
                    <div
                      key={inq.id}
                      className="p-4 rounded-[14px] bg-[#FAFDFF] border border-[#E4E7EC] hover:border-[#D0E7FF] transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#161525]">
                          {inq.name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase border ${
                            inq.status === "NEW"
                              ? "bg-[#EAF6FF] text-[#159CF0] border-[#D0E7FF]"
                              : "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]"
                          }`}
                        >
                          {inq.status}
                        </span>
                      </div>

                      <p className="text-xs text-[#344054] line-clamp-2 leading-relaxed">
                        "{inq.message}"
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-[#667085] pt-1">
                        <span className="font-mono text-[#159CF0] font-medium">
                          {inq.email}
                        </span>
                        <span>{formatDate(inq.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* MetaMindful Compliance & Moderation */}
            <div className="space-y-6">
              {/* Deletions Desk */}
              <div className="bg-white border border-[#E4E7EC] rounded-[22px] p-6 shadow-[0_2px_12px_rgba(21,156,240,0.04)] space-y-3.5">
                <div className="flex items-center justify-between pb-3.5 border-b border-[#EDF2F7]">
                  <div>
                    <h3 className="font-bold text-[#161525] text-base tracking-tight">
                      Account Deletions (30-Day Retention Clock)
                    </h3>
                    <p className="text-xs text-[#667085] mt-0.5">
                      Statutory user deletion requests from MetaMindful app
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate("deletions")}
                    className="text-xs text-[#EF4444] hover:underline font-semibold"
                  >
                    Open Desk →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {safeDeletions.length === 0 ? (
                    <p className="text-xs text-[#667085] py-4 text-center">
                      No active deletion requests.
                    </p>
                  ) : (
                    safeDeletions.slice(0, 2).map((del) => (
                      <div
                        key={del.id}
                        className="p-3.5 rounded-[14px] bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold font-mono text-[#991B1B]">
                            {del.email}
                          </span>
                          <p className="text-[11px] text-[#667085] mt-0.5">
                            Reason: {del.reason || "Not specified"}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EF4444] text-white font-mono uppercase shadow-2xs">
                          {del.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Comments Moderation Desk */}
              <div className="bg-white border border-[#E4E7EC] rounded-[22px] p-6 shadow-[0_2px_12px_rgba(21,156,240,0.04)] space-y-3.5">
                <div className="flex items-center justify-between pb-3.5 border-b border-[#EDF2F7]">
                  <div>
                    <h3 className="font-bold text-[#161525] text-base tracking-tight">
                      Community Blog Comments
                    </h3>
                    <p className="text-xs text-[#667085] mt-0.5">
                      MetaMindful comments awaiting administrator approval
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate("comments")}
                    className="text-xs text-[#159CF0] hover:text-[#0879DC] font-semibold"
                  >
                    Review Comments →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {safeComments.length === 0 ? (
                    <p className="text-xs text-[#667085] py-4 text-center">
                      No comments waiting for review.
                    </p>
                  ) : (
                    safeComments.slice(0, 2).map((c) => (
                      <div
                        key={c.id}
                        className="p-3.5 rounded-[14px] bg-[#FAFDFF] border border-[#E4E7EC] text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#161525]">
                            {c.authorName} ({c.authorEmail})
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] uppercase">
                            {c.status}
                          </span>
                        </div>
                        <p className="text-[#344054] italic">"{c.content}"</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ================================================================ */
        /* 2. AIREC WORKSPACE OVERVIEW                                      */
        /* ================================================================ */
        <>
          {/* AIREC Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
            <div
              onClick={() => onNavigate("services")}
              className="bg-white border border-[#E4E7EC] hover:border-cyan-600 p-5 rounded-[18px] shadow-[0_2px_12px_rgba(8,145,178,0.04)] hover:shadow-[0_8px_24px_rgba(8,145,178,0.12)] cursor-pointer transition-all duration-200 group"
            >
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
                Core Offerings
              </span>
              <div className="text-3xl font-bold text-[#161525] mt-1.5 font-sans group-hover:text-cyan-600 transition-colors">
                {metrics.totalServices}
              </div>
              <span className="text-[11px] text-[#667085] mt-1 block">
                B2B AI Services
              </span>
            </div>

            <div
              onClick={() => onNavigate("products")}
              className="bg-white border border-[#E4E7EC] hover:border-cyan-600 p-5 rounded-[18px] shadow-[0_2px_12px_rgba(8,145,178,0.04)] hover:shadow-[0_8px_24px_rgba(8,145,178,0.12)] cursor-pointer transition-all duration-200 group"
            >
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
                Incubation Lab
              </span>
              <div className="text-3xl font-bold text-[#161525] mt-1.5 font-sans group-hover:text-cyan-600 transition-colors">
                {metrics.totalProducts || 1}
              </div>
              <span className="text-[11px] text-[#667085] mt-1 block">
                MetaMindful & IP
              </span>
            </div>

            <div
              onClick={() => onNavigate("inquiries")}
              className="bg-white border border-[#E4E7EC] hover:border-cyan-600 p-5 rounded-[18px] shadow-[0_2px_12px_rgba(8,145,178,0.04)] hover:shadow-[0_8px_24px_rgba(8,145,178,0.12)] cursor-pointer transition-all duration-200 group"
            >
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
                Client Quotes
              </span>
              <div className="text-3xl font-bold text-cyan-600 mt-1.5 font-sans">
                {metrics.totalInquiriesNew}
              </div>
              <span className="text-[11px] text-cyan-600 font-medium mt-1 block">
                Pending Discovery
              </span>
            </div>

            <div
              onClick={() => onNavigate("services")}
              className="bg-white border border-[#E4E7EC] hover:border-cyan-600 p-5 rounded-[18px] shadow-[0_2px_12px_rgba(8,145,178,0.04)] hover:shadow-[0_8px_24px_rgba(8,145,178,0.12)] cursor-pointer transition-all duration-200 group"
            >
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
                Scope Deliverables
              </span>
              <div className="text-3xl font-bold text-[#161525] mt-1.5 font-sans group-hover:text-cyan-600 transition-colors">
                32
              </div>
              <span className="text-[11px] text-[#667085] mt-1 block">
                Technical Milestones
              </span>
            </div>

            <div
              onClick={() => onNavigate("faqs")}
              className="bg-white border border-[#E4E7EC] hover:border-cyan-600 p-5 rounded-[18px] shadow-[0_2px_12px_rgba(8,145,178,0.04)] hover:shadow-[0_8px_24px_rgba(8,145,178,0.12)] cursor-pointer transition-all duration-200 group"
            >
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
                Enterprise FAQs
              </span>
              <div className="text-3xl font-bold text-[#161525] mt-1.5 font-sans group-hover:text-cyan-600 transition-colors">
                {metrics.totalFAQs}
              </div>
              <span className="text-[11px] text-[#667085] mt-1 block">
                Vectors & Services
              </span>
            </div>

            <div
              onClick={() => onNavigate("legal")}
              className="bg-white border border-[#E4E7EC] hover:border-cyan-600 p-5 rounded-[18px] shadow-[0_2px_12px_rgba(8,145,178,0.04)] hover:shadow-[0_8px_24px_rgba(8,145,178,0.12)] cursor-pointer transition-all duration-200 group"
            >
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
                Corporate Terms
              </span>
              <div className="text-3xl font-bold text-[#161525] mt-1.5 font-sans group-hover:text-cyan-600 transition-colors">
                2
              </div>
              <span className="text-[11px] text-[#667085] mt-1 block">
                Terms of Use & Policy
              </span>
            </div>
          </div>

          {/* AIREC Enterprise Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AIREC Inbound Quote Inquiries */}
            <div className="bg-white border border-[#E4E7EC] rounded-[22px] p-6 shadow-[0_2px_12px_rgba(8,145,178,0.04)] space-y-4">
              <div className="flex items-center justify-between pb-3.5 border-b border-[#EDF2F7]">
                <div>
                  <h3 className="font-bold text-[#161525] text-base tracking-tight">
                    AIREC Client Quote Requests
                  </h3>
                  <p className="text-xs text-[#667085] mt-0.5">
                    Enterprise consultation leads submitted via airec.tech/contact
                  </p>
                </div>
                <button
                  onClick={() => onNavigate("inquiries")}
                  className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold transition-colors cursor-pointer"
                >
                  View All Quotes →
                </button>
              </div>

              <div className="space-y-3">
                {safeInquiries.length === 0 ? (
                  <p className="text-xs text-[#667085] py-8 text-center">
                    No recent inquiries for AIREC.
                  </p>
                ) : (
                  safeInquiries.slice(0, 3).map((inq) => (
                    <div
                      key={inq.id}
                      className="p-4 rounded-[14px] bg-[#FAFDFF] border border-[#E4E7EC] hover:border-cyan-200 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#161525]">
                          {inq.name}{" "}
                          {inq.organization && (
                            <span className="font-normal text-[#667085]">
                              ({inq.organization})
                            </span>
                          )}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase border ${
                            inq.status === "NEW"
                              ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                              : "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]"
                          }`}
                        >
                          {inq.status}
                        </span>
                      </div>

                      {inq.serviceInterest && (
                        <span className="inline-block text-[10px] font-mono text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                          Interest: {inq.serviceInterest}
                        </span>
                      )}

                      <p className="text-xs text-[#344054] line-clamp-2 leading-relaxed">
                        "{inq.message}"
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-[#667085] pt-1">
                        <span className="font-mono text-cyan-700 font-medium">
                          {inq.email}
                        </span>
                        <span>{formatDate(inq.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AIREC Capabilities Matrix */}
            <div className="bg-white border border-[#E4E7EC] rounded-[22px] p-6 shadow-[0_2px_12px_rgba(8,145,178,0.04)] space-y-4">
              <div className="flex items-center justify-between pb-3.5 border-b border-[#EDF2F7]">
                <div>
                  <h3 className="font-bold text-[#161525] text-base tracking-tight">
                    Enterprise Capabilities Overview
                  </h3>
                  <p className="text-xs text-[#667085] mt-0.5">
                    Active deliverables across AIREC's 6 core engineering verticals
                  </p>
                </div>
                <button
                  onClick={() => onNavigate("services")}
                  className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold transition-colors cursor-pointer"
                >
                  Full Catalog →
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-[12px] bg-[#FAFDFF] border border-[#E4E7EC] space-y-1">
                  <span className="font-mono text-[10px] font-bold text-cyan-700">01</span>
                  <h4 className="font-bold text-[#161525]">Generative AI & LLMs</h4>
                  <p className="text-[11px] text-[#667085]">Custom models, RAG architectures & prompt pipelines</p>
                </div>
                <div className="p-3 rounded-[12px] bg-[#FAFDFF] border border-[#E4E7EC] space-y-1">
                  <span className="font-mono text-[10px] font-bold text-cyan-700">02</span>
                  <h4 className="font-bold text-[#161525]">Enterprise Architecture</h4>
                  <p className="text-[11px] text-[#667085]">Scalable ML infrastructure, vector DBs & edge deployment</p>
                </div>
                <div className="p-3 rounded-[12px] bg-[#FAFDFF] border border-[#E4E7EC] space-y-1">
                  <span className="font-mono text-[10px] font-bold text-cyan-700">03</span>
                  <h4 className="font-bold text-[#161525]">Predictive Analytics</h4>
                  <p className="text-[11px] text-[#667085]">Forecasting, risk scoring & anomaly detection</p>
                </div>
                <div className="p-3 rounded-[12px] bg-[#FAFDFF] border border-[#E4E7EC] space-y-1">
                  <span className="font-mono text-[10px] font-bold text-cyan-700">04</span>
                  <h4 className="font-bold text-[#161525]">Autonomous Agents</h4>
                  <p className="text-[11px] text-[#667085]">Multi-agent workflows & enterprise RPA automation</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
