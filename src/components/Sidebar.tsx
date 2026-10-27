"use client";

import React from "react";
import type { TenantBrand } from "@/types/crm";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedBrand: TenantBrand;
  setSelectedBrand: (b: TenantBrand) => void;
  metrics: {
    totalBlogs: number;
    totalCommentsPending: number;
    totalDeletionsPending: number;
    totalInquiriesNew: number;
    totalServices: number;
    totalFAQs: number;
    totalProducts?: number;
    totalLegalDocs?: number;
  };
}

function MetaMindfulLogo() {
  return (
    <svg
      className="w-[28px] h-[23px] shrink-0"
      viewBox="0 0 30 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.3568 24.5615C17.0123 24.5735 16.6655 24.5711 16.3234 24.5446C15.9862 24.5181 15.82 24.4796 15.5406 24.4266C16.1332 24.5133 16.7402 24.5591 17.3568 24.5615Z"
        fill="#C4E6FD"
      />
      <path
        d="M4.93511 10.6296C4.92547 10.6946 4.91584 10.7596 4.90861 10.8247C4.91584 10.7669 4.92306 10.7115 4.93029 10.6537C4.93029 10.6464 4.93029 10.6392 4.93511 10.6296Z"
        fill="#C4E6FD"
      />
      <path
        d="M28.721 24.4748C28.786 24.6121 28.7667 24.7758 28.6897 24.8674C28.5692 25.0119 28.4271 24.9999 28.2465 24.9445L23.0364 23.3403L22.9497 23.3138C21.2781 24.1159 19.3969 24.5639 17.4073 24.5639H17.3543C16.7377 24.5639 16.1331 24.5157 15.5382 24.429C15.5117 24.4242 15.4852 24.4194 15.4563 24.4145C15.4274 24.4097 15.3961 24.4025 15.3672 24.3977C10.504 23.6317 6.57783 20.1415 5.27955 15.5819C5.19283 15.2784 5.11575 14.9725 5.05313 14.6617C4.98568 14.3341 4.9351 13.9993 4.89415 13.6597C4.88693 13.5995 4.8797 13.5393 4.87488 13.4791C4.86525 13.3996 4.85802 13.3177 4.85321 13.2382C4.84598 13.1683 4.84116 13.1009 4.83875 13.031C4.83153 12.9371 4.82912 12.8432 4.8243 12.7516C4.8243 12.7011 4.81948 12.6505 4.81948 12.5999C4.81948 12.4987 4.81467 12.3976 4.81467 12.2964C4.81467 12.1856 4.81467 12.0748 4.81948 11.964C4.81948 11.8821 4.8243 11.8002 4.82912 11.7207C4.82912 11.6653 4.83635 11.6099 4.83875 11.5521C4.84357 11.4726 4.8508 11.3883 4.85802 11.3088C4.86766 11.2004 4.87729 11.0896 4.88934 10.9812C4.88934 10.9716 4.88934 10.962 4.88934 10.9523C4.89415 10.909 4.90138 10.8704 4.9062 10.8271C4.91342 10.7621 4.92306 10.697 4.93269 10.632C4.94474 10.5332 4.9616 10.4321 4.97846 10.3357C4.99532 10.2297 5.01459 10.1213 5.03627 10.0154V10.0105C5.95639 5.22687 9.70673 1.42354 14.5313 0.325174C14.594 0.310722 14.6542 0.29627 14.7168 0.284226C14.7674 0.272183 14.818 0.260139 14.871 0.250504C15.1696 0.18547 15.4731 0.137296 15.7791 0.0987565C15.9982 0.0722609 16.2174 0.0505826 16.439 0.0361304C16.5426 0.0289043 16.651 0.0216783 16.757 0.0168609C16.9714 0.00481739 17.1833 0 17.3977 0C17.5494 0 17.7036 0 17.8529 0.00963478H17.8746C17.8746 0.00963478 17.8963 0.00963478 17.9083 0.00963478C18.0191 0.00963478 18.1323 0.0192696 18.2431 0.0264957C18.3274 0.031313 18.4142 0.0361304 18.4985 0.0457652C18.5659 0.0505826 18.6285 0.0554 18.6936 0.0626261C18.8839 0.0818956 19.0717 0.105983 19.2596 0.132478C19.3487 0.144522 19.4403 0.158974 19.527 0.173426C19.527 0.173426 19.5318 0.173426 19.5342 0.173426C19.6137 0.18547 19.6956 0.199922 19.7775 0.216783C19.71 0.204739 19.645 0.192696 19.5752 0.178243C22.8148 0.708156 25.6402 2.40388 27.5648 4.80053C28.9811 6.648 29.8314 8.88809 29.9639 11.2727C29.9639 11.292 29.9639 11.3112 29.9639 11.3305C29.9879 11.6436 30 11.9592 30 12.2771C30 15.3892 28.8125 18.229 26.8542 20.3944L26.9144 20.5245L28.721 24.4699V24.4748Z"
        fill="#159CF0"
      />
      <path
        d="M15.7863 12.4722C15.6682 12.4506 15.5526 12.4168 15.4394 12.3711C15.1455 12.2554 14.8902 12.0603 14.6951 11.8147C14.5819 11.6725 14.5964 11.4509 14.7288 11.3401C14.8782 11.2149 15.0781 11.2438 15.2226 11.4124C15.8031 12.0965 16.9473 11.9182 17.4459 11.1788C17.5542 11.0198 17.7277 10.9475 17.9204 11.0391C18.3347 11.2366 17.8264 11.793 17.641 11.9495C17.1375 12.3783 16.439 12.5903 15.7863 12.4674V12.4722Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

function AirecLogo() {
  return (
    <div className="w-[28px] h-[28px] rounded-[8px] bg-gradient-to-tr from-[#0F172A] to-[#1E293B] border border-cyan-500/40 flex items-center justify-center font-bold text-xs text-cyan-400 font-mono shadow-xs shrink-0">
      AI
    </div>
  );
}

export function Sidebar({
  currentTab,
  setCurrentTab,
  selectedBrand,
  setSelectedBrand,
  metrics,
}: SidebarProps) {
  const isMeta = selectedBrand === "metamindful";

  const handleBrandChange = (brand: TenantBrand) => {
    setSelectedBrand(brand);
    // Switch to overview or appropriate brand-specific starting tab
    if (brand === "metamindful") {
      if (currentTab === "services" || currentTab === "products") {
        setCurrentTab("blogs");
      }
    } else {
      if (currentTab === "blogs" || currentTab === "comments" || currentTab === "deletions") {
        setCurrentTab("services");
      }
    }
  };

  return (
    <aside className="w-64 bg-[#161525] text-slate-100 flex flex-col shrink-0 select-none border-r border-[#232236]">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isMeta ? <MetaMindfulLogo /> : <AirecLogo />}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-white text-[19px] tracking-[-0.07em] leading-none select-none">
                {isMeta ? "MetaMindful" : "AIREC"}
              </span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wide text-white ${
                  isMeta ? "bg-[#159CF0]" : "bg-cyan-600"
                }`}
              >
                CRM
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal mt-0.5">
              {isMeta ? "Mental Wellness Platform" : "Enterprise AI Advisory"}
            </p>
          </div>
        </div>
      </div>

      {/* Strict 2-Way Workspace Switcher (NO "ALL") */}
      <div className="p-3 border-b border-white/10 bg-[#121120]">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1 flex items-center justify-between">
          <span>Active Workspace</span>
          <span className="text-[9px] text-[#159CF0] font-mono">Isolated</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 bg-[#1A182B] p-1 rounded-[12px] border border-white/5">
          <button
            onClick={() => handleBrandChange("metamindful")}
            className={`py-1.5 px-2 text-xs rounded-[9px] font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isMeta
                ? "bg-[#159CF0] text-white shadow-sm font-semibold"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>MetaMindful</span>
          </button>
          <button
            onClick={() => handleBrandChange("airec")}
            className={`py-1.5 px-2 text-xs rounded-[9px] font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              !isMeta
                ? "bg-cyan-600 text-white shadow-sm font-semibold"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>AIREC</span>
          </button>
        </div>
      </div>

      {/* Navigation - STRICTLY SEPARATED BY BRAND */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-xs">
        {/* Workspace Overview */}
        <div>
          <button
            onClick={() => setCurrentTab("overview")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-[11px] font-medium transition-all cursor-pointer ${
              currentTab === "overview"
                ? isMeta
                  ? "bg-[#159CF0] text-white font-semibold shadow-[0_4px_12px_rgba(21,156,240,0.32)]"
                  : "bg-cyan-600 text-white font-semibold shadow-[0_4px_12px_rgba(8,145,178,0.32)]"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>{isMeta ? "MetaMindful Overview" : "AIREC Overview"}</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* METAMINDFUL EXCLUSIVE MODULES (Shown ONLY in MetaMindful)       */}
        {/* ============================================================== */}
        {isMeta && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#7E88A8] px-3 mb-1.5">
              Content & Community
            </div>

            <button
              onClick={() => setCurrentTab("blogs")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-[11px] font-medium transition-all cursor-pointer ${
                currentTab === "blogs"
                  ? "bg-[#159CF0] text-white font-semibold shadow-[0_4px_12px_rgba(21,156,240,0.32)]"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>Blogs & Media</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                currentTab === "blogs" ? "bg-white/20 text-white" : "bg-[#121120] text-slate-300"
              }`}>
                {metrics.totalBlogs}
              </span>
            </button>

            <button
              onClick={() => setCurrentTab("comments")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-[11px] font-medium transition-all cursor-pointer ${
                currentTab === "comments"
                  ? "bg-[#159CF0] text-white font-semibold shadow-[0_4px_12px_rgba(21,156,240,0.32)]"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>Comments Review</span>
              {metrics.totalCommentsPending > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#159CF0] text-white font-bold font-mono">
                  {metrics.totalCommentsPending}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab("deletions")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-[11px] font-medium transition-all cursor-pointer ${
                currentTab === "deletions"
                  ? "bg-[#159CF0] text-white font-semibold shadow-[0_4px_12px_rgba(21,156,240,0.32)]"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>Account Deletions</span>
              {metrics.totalDeletionsPending > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold font-mono">
                  {metrics.totalDeletionsPending}
                </span>
              )}
            </button>

            <div className="pt-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#7E88A8] px-3 mb-1.5">
                Support & Policy
              </div>

              <button
                onClick={() => setCurrentTab("inquiries")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-[11px] font-medium transition-all cursor-pointer ${
                  currentTab === "inquiries"
                    ? "bg-[#159CF0] text-white font-semibold shadow-[0_4px_12px_rgba(21,156,240,0.32)]"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>Support Inquiries</span>
                {metrics.totalInquiriesNew > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#159CF0] text-white font-bold font-mono">
                    {metrics.totalInquiriesNew} New
                  </span>
                )}
              </button>

              <button
                onClick={() => setCurrentTab("faqs")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-[11px] font-medium transition-all cursor-pointer ${
                  currentTab === "faqs"
                    ? "bg-[#159CF0] text-white font-semibold shadow-[0_4px_12px_rgba(21,156,240,0.32)]"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>App & Web FAQs</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  currentTab === "faqs" ? "bg-white/20 text-white" : "bg-[#121120] text-slate-300"
                }`}>
                  {metrics.totalFAQs}
                </span>
              </button>

              <button
                onClick={() => setCurrentTab("legal")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-[11px] font-medium transition-all cursor-pointer ${
                  currentTab === "legal"
                    ? "bg-[#159CF0] text-white font-semibold shadow-[0_4px_12px_rgba(21,156,240,0.32)]"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>Privacy & Terms</span>
                <span className="text-[10px] font-mono text-slate-400">v2.0</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* AIREC EXCLUSIVE MODULES (Shown ONLY in AIREC)                  */}
        {/* ============================================================== */}
        {!isMeta && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/80 px-3 mb-1.5">
              Services & Products
            </div>

            <button
              onClick={() => setCurrentTab("services")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-[11px] font-medium transition-all cursor-pointer ${
                currentTab === "services"
                  ? "bg-cyan-600 text-white font-semibold shadow-[0_4px_12px_rgba(8,145,178,0.32)]"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>Enterprise Services</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                currentTab === "services" ? "bg-white/20 text-white" : "bg-[#121120] text-slate-300"
              }`}>
                {metrics.totalServices}
              </span>
            </button>

            <button
              onClick={() => setCurrentTab("products")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-[11px] font-medium transition-all cursor-pointer ${
                currentTab === "products"
                  ? "bg-cyan-600 text-white font-semibold shadow-[0_4px_12px_rgba(8,145,178,0.32)]"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>Products Incubator</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                currentTab === "products" ? "bg-white/20 text-white" : "bg-[#121120] text-slate-300"
              }`}>
                {metrics.totalProducts || 1}
              </span>
            </button>

            <div className="pt-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/80 px-3 mb-1.5">
                B2B Inquiries & Legal
              </div>

              <button
                onClick={() => setCurrentTab("inquiries")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-[11px] font-medium transition-all cursor-pointer ${
                  currentTab === "inquiries"
                    ? "bg-cyan-600 text-white font-semibold shadow-[0_4px_12px_rgba(8,145,178,0.32)]"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>Quote Inquiries</span>
                {metrics.totalInquiriesNew > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-600 text-white font-bold font-mono">
                    {metrics.totalInquiriesNew} New
                  </span>
                )}
              </button>

              <button
                onClick={() => setCurrentTab("faqs")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-[11px] font-medium transition-all cursor-pointer ${
                  currentTab === "faqs"
                    ? "bg-cyan-600 text-white font-semibold shadow-[0_4px_12px_rgba(8,145,178,0.32)]"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>Enterprise FAQs</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  currentTab === "faqs" ? "bg-white/20 text-white" : "bg-[#121120] text-slate-300"
                }`}>
                  {metrics.totalFAQs}
                </span>
              </button>

              <button
                onClick={() => setCurrentTab("legal")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-[11px] font-medium transition-all cursor-pointer ${
                  currentTab === "legal"
                    ? "bg-cyan-600 text-white font-semibold shadow-[0_4px_12px_rgba(8,145,178,0.32)]"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>Terms & Legal Policy</span>
                <span className="text-[10px] font-mono text-slate-400">2 Docs</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Footer System Status */}
      <div className="p-3.5 border-t border-white/10 bg-[#121120] text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium">
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              isMeta ? "bg-[#159CF0]" : "bg-cyan-400"
            }`}
          ></span>
          <span>{isMeta ? "MetaMindful Core" : "AIREC Enterprise"}</span>
        </span>
        <span className="text-[10px] font-mono text-slate-500">v2.1</span>
      </div>
    </aside>
  );
}
