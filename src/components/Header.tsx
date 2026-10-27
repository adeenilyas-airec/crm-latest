"use client";

import type { TenantBrand } from "@/types/crm";

interface HeaderProps {
  currentTab: string;
  selectedBrand: TenantBrand;
  onBrandChange?: (brand: TenantBrand) => void;
  pendingDeletionsCount: number;
  onRefresh: () => void;
  onNewItem?: () => void;
}

export function Header({
  currentTab,
  selectedBrand,
  onBrandChange,
  pendingDeletionsCount,
  onRefresh,
  onNewItem,
}: HeaderProps) {
  const isMeta = selectedBrand === "metamindful";

  const getTabTitle = () => {
    switch (currentTab) {
      case "overview":
        return isMeta ? "MetaMindful Platform Overview" : "AIREC Enterprise Overview";
      case "blogs":
        return "MetaMindful Content & Media Hub";
      case "comments":
        return "MetaMindful Community Comment Moderation";
      case "deletions":
        return "MetaMindful Account Deletions (GDPR Desk)";
      case "services":
        return "AIREC Enterprise Services & Deliverables";
      case "products":
        return "AIREC Incubated Products Showcase";
      case "faqs":
        return isMeta ? "MetaMindful Knowledge Base (FAQs)" : "AIREC Enterprise Technical FAQs";
      case "legal":
        return isMeta ? "MetaMindful Privacy Policy & Terms" : "AIREC Terms of Use & Corporate Legal";
      case "inquiries":
        return isMeta ? "MetaMindful User Inquiries" : "AIREC B2B Consultation Quotes";
      default:
        return "CRM Dashboard";
    }
  };

  return (
    <header className="h-[70px] bg-white/90 backdrop-blur-md border-b border-[#EDF2F7] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-[17px] font-semibold text-[#161525] tracking-tight">
            {getTabTitle()}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[12px] text-[#667085]">Dedicated Workspace:</span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                isMeta
                  ? "bg-[#EAF6FF] text-[#159CF0] border-[#D0E7FF]"
                  : "bg-cyan-50 text-cyan-800 border-cyan-200"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isMeta ? "bg-[#159CF0]" : "bg-cyan-600"
                }`}
              ></span>
              {isMeta ? "MetaMindful" : "AIREC"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isMeta && pendingDeletionsCount > 0 && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"></span>
            <span>{pendingDeletionsCount} Deletion Ticket(s) Pending</span>
          </div>
        )}

        <button
          onClick={onRefresh}
          className="px-3.5 py-2 rounded-[11px] bg-white hover:bg-[#F4F7FA] text-[#344054] text-xs font-medium border border-[#E4E7EC] hover:border-[#D0E7FF] transition-all duration-150 cursor-pointer shadow-2xs"
        >
          Refresh Data
        </button>

        {onNewItem && (
          <button
            onClick={onNewItem}
            className={`inline-flex items-center justify-center px-4 py-2 text-white text-xs font-medium rounded-[11px] transition-all duration-150 cursor-pointer ${
              isMeta
                ? "bg-[#159CF0] hover:bg-[#0879DC] shadow-[0_4px_12px_rgba(21,156,240,0.28)]"
                : "bg-cyan-600 hover:bg-cyan-700 shadow-[0_4px_12px_rgba(8,145,178,0.28)]"
            }`}
          >
            + Create New
          </button>
        )}
      </div>
    </header>
  );
}
