"use client";

import React, { useState } from "react";
import type { FAQItem, TenantBrand } from "@/types/crm";

interface FaqsViewProps {
  selectedBrand: TenantBrand;
  faqs: FAQItem[];
  onSaveFaq: (faq: Partial<FAQItem> & { question: string; answer: string; brand: TenantBrand }) => Promise<void>;
  onDeleteFaq: (id: string) => Promise<void>;
}

export function FaqsView({ selectedBrand, faqs, onSaveFaq, onDeleteFaq }: FaqsViewProps) {
  const isMeta = selectedBrand === "metamindful";
  const [search, setSearch] = useState("");
  const [airecSubFilter, setAirecSubFilter] = useState<"ALL" | "SERVICE" | "CAPABILITY">("ALL");
  const [editingFaq, setEditingFaq] = useState<Partial<FAQItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Strictly filter by brand
  const brandFaqs = faqs.filter((f) => f.brand === selectedBrand);

  const filtered = brandFaqs.filter((f) => {
    let matchesLocation = true;
    if (!isMeta) {
      if (airecSubFilter === "SERVICE") matchesLocation = f.location === "AIREC_SERVICE";
      if (airecSubFilter === "CAPABILITY") matchesLocation = f.location === "AIREC_CAPABILITY";
    }

    const matchesSearch =
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase()) ||
      (f.serviceSlug && f.serviceSlug.toLowerCase().includes(search.toLowerCase()));

    return matchesLocation && matchesSearch;
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq || !editingFaq.question || !editingFaq.answer) return;
    setIsSaving(true);
    try {
      await onSaveFaq({
        ...editingFaq,
        brand: selectedBrand,
        question: editingFaq.question,
        answer: editingFaq.answer,
      });
      setEditingFaq(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-[20px] border border-[#E4E7EC] shadow-[0_2px_12px_rgba(21,156,240,0.04)]">
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder={isMeta ? "Search 6 MetaMindful FAQs..." : "Search 22 AIREC enterprise FAQs..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAFDFF] border border-[#E4E7EC] rounded-[11px] px-3.5 py-2 text-xs text-[#161525] placeholder-[#98A2B3] focus:outline-none focus:border-[#159CF0]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {/* AIREC Category Subfilters (Only shown for AIREC) */}
          {!isMeta && (
            <div className="flex items-center bg-[#F4F7FA] p-1 rounded-[11px] border border-[#E4E7EC] text-xs font-medium">
              <button
                onClick={() => setAirecSubFilter("ALL")}
                className={`px-3 py-1 rounded-[8px] transition-all cursor-pointer ${
                  airecSubFilter === "ALL" ? "bg-cyan-600 text-white font-semibold shadow-xs" : "text-[#667085] hover:text-[#161525]"
                }`}
              >
                All (22)
              </button>
              <button
                onClick={() => setAirecSubFilter("SERVICE")}
                className={`px-3 py-1 rounded-[8px] transition-all cursor-pointer ${
                  airecSubFilter === "SERVICE" ? "bg-cyan-600 text-white font-semibold shadow-xs" : "text-[#667085] hover:text-[#161525]"
                }`}
              >
                Services (18)
              </button>
              <button
                onClick={() => setAirecSubFilter("CAPABILITY")}
                className={`px-3 py-1 rounded-[8px] transition-all cursor-pointer ${
                  airecSubFilter === "CAPABILITY" ? "bg-cyan-600 text-white font-semibold shadow-xs" : "text-[#667085] hover:text-[#161525]"
                }`}
              >
                Vectors (4)
              </button>
            </div>
          )}

          <button
            onClick={() =>
              setEditingFaq({
                brand: selectedBrand,
                location: isMeta ? "METAMINDFUL_HOME" : "AIREC_SERVICE",
                question: "",
                answer: "",
                isVisible: true,
              })
            }
            className={`px-3.5 py-1.5 rounded-[11px] text-white text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              isMeta
                ? "bg-[#159CF0] hover:bg-[#0879DC] shadow-[0_4px_12px_rgba(21,156,240,0.28)]"
                : "bg-cyan-600 hover:bg-cyan-700 shadow-[0_4px_12px_rgba(8,145,178,0.28)]"
            }`}
          >
            + New {isMeta ? "MetaMindful" : "AIREC"} FAQ
          </button>
        </div>
      </div>

      {/* FAQs List */}
      <div className="space-y-3.5">
        {filtered.length === 0 ? (
          <div className="bg-white border border-[#E4E7EC] rounded-[20px] p-12 text-center text-[#667085] text-sm">
            No FAQs found matching query in {isMeta ? "MetaMindful" : "AIREC"} library.
          </div>
        ) : (
          filtered.map((faq) => (
            <div
              key={faq.id}
              className="bg-white border border-[#E4E7EC] hover:border-[#B8D5FF] rounded-[20px] p-5 sm:p-6 shadow-[0_2px_12px_rgba(21,156,240,0.04)] hover:shadow-[0_8px_24px_rgba(21,156,240,0.08)] flex flex-col md:flex-row items-start justify-between gap-4 transition-all"
            >
              <div className="space-y-2.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase border font-mono ${
                      faq.brand === "metamindful"
                        ? "bg-[#EAF6FF] text-[#159CF0] border-[#D0E7FF]"
                        : "bg-cyan-50 text-cyan-800 border-cyan-200"
                    }`}
                  >
                    {faq.brand}
                  </span>
                  <span className="text-[11px] font-mono text-[#667085]">
                    Location: {faq.location}
                  </span>
                  {faq.serviceSlug && (
                    <span className="text-[11px] font-mono text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                      /services/{faq.serviceSlug}
                    </span>
                  )}
                  {faq.vectorTag && (
                    <span className="text-[11px] font-mono text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                      Vector: {faq.vectorTag}
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-[#161525] text-sm leading-snug">
                  {faq.question}
                </h3>

                <p className="text-xs text-[#344054] leading-relaxed bg-[#FAFDFF] p-4 rounded-[14px] border border-[#EDF2F7]">
                  {faq.answer}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => setEditingFaq(faq)}
                  className="px-3 py-1.5 rounded-[9px] bg-white hover:bg-[#EAF6FF] text-[#159CF0] border border-[#D0E7FF] text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteFaq(faq.id)}
                  className="px-3 py-1.5 rounded-[9px] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] text-xs font-medium transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAQ Edit / Create Modal */}
      {editingFaq && (
        <div className="fixed inset-0 bg-[#161525]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4E7EC] rounded-[24px] w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF2F7]">
              <h3 className="font-bold text-[#161525] text-base">
                {editingFaq.id ? "Edit FAQ" : `Create ${isMeta ? "MetaMindful" : "AIREC"} FAQ`}
              </h3>
              <button
                onClick={() => setEditingFaq(null)}
                className="text-[#667085] hover:text-[#161525] text-sm font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#344054] block mb-1">
                  Location Category
                </label>
                <input
                  type="text"
                  value={editingFaq.location || (isMeta ? "METAMINDFUL_HOME" : "AIREC_SERVICE")}
                  onChange={(e) =>
                    setEditingFaq({
                      ...editingFaq,
                      location: e.target.value as any,
                    })
                  }
                  placeholder={isMeta ? "METAMINDFUL_HOME" : "AIREC_SERVICE"}
                  className="w-full bg-[#FAFDFF] border border-[#E4E7EC] rounded-[11px] p-2 text-xs text-[#161525] font-mono focus:outline-none focus:border-[#159CF0]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#344054] block mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={editingFaq.question || ""}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, question: e.target.value })
                  }
                  className="w-full bg-[#FAFDFF] border border-[#E4E7EC] rounded-[11px] p-2.5 text-xs text-[#161525] focus:outline-none focus:border-[#159CF0]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#344054] block mb-1">
                  Answer
                </label>
                <textarea
                  rows={4}
                  value={editingFaq.answer || ""}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, answer: e.target.value })
                  }
                  className="w-full bg-[#FAFDFF] border border-[#E4E7EC] rounded-[11px] p-2.5 text-xs text-[#161525] focus:outline-none focus:border-[#159CF0]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EDF2F7]">
                <button
                  type="button"
                  onClick={() => setEditingFaq(null)}
                  className="px-4 py-2 rounded-[11px] bg-white hover:bg-[#F4F7FA] text-[#667085] text-xs font-semibold border border-[#E4E7EC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-4.5 py-2 rounded-[11px] text-white text-xs font-semibold transition-all cursor-pointer ${
                    isMeta
                      ? "bg-[#159CF0] hover:bg-[#0879DC] shadow-[0_4px_12px_rgba(21,156,240,0.28)]"
                      : "bg-cyan-600 hover:bg-cyan-700 shadow-[0_4px_12px_rgba(8,145,178,0.28)]"
                  }`}
                >
                  {isSaving ? "Saving..." : "Save FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
