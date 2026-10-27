"use client";

import React, { useState } from "react";
import type { LegalDocument, TenantBrand } from "@/types/crm";

interface LegalViewProps {
  selectedBrand: TenantBrand;
  documents: LegalDocument[];
  onSaveDoc: (doc: LegalDocument) => Promise<void>;
}

export function LegalView({ selectedBrand, documents, onSaveDoc }: LegalViewProps) {
  const isMeta = selectedBrand === "metamindful";
  const brandDocs = documents.filter((d) => d.brand === selectedBrand);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [editingDoc, setEditingDoc] = useState<LegalDocument | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const activeDoc = brandDocs.find((d) => d.id === selectedDocId) || brandDocs[0];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;
    setIsSaving(true);
    try {
      await onSaveDoc(editingDoc);
      setEditingDoc(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Document Switcher */}
      <div className="flex flex-wrap items-center gap-2.5 bg-white p-3.5 sm:p-4 rounded-[20px] border border-[#E4E7EC] shadow-[0_2px_12px_rgba(21,156,240,0.04)]">
        <span className="text-xs font-bold text-[#667085] uppercase tracking-wider mr-1">
          {isMeta ? "MetaMindful Compliance:" : "AIREC Governance:"}
        </span>
        {brandDocs.map((doc) => {
          const isActive = activeDoc?.id === doc.id;
          return (
            <button
              key={doc.id}
              onClick={() => setSelectedDocId(doc.id)}
              className={`px-3.5 py-1.5 rounded-[9px] text-xs font-semibold transition-all cursor-pointer ${isActive
                ? isMeta
                  ? "bg-[#159CF0] text-white shadow-xs font-semibold"
                  : "bg-cyan-600 text-white shadow-xs font-semibold"
                : "bg-white text-[#667085] hover:text-[#161525] border border-[#E4E7EC]"
                }`}
            >
              <span>{doc.title}</span>
              <span className="ml-2 text-[10px] opacity-80 font-mono">({doc.versionTag})</span>
            </button>
          );
        })}
      </div>

      {/* Active Document Details */}
      {activeDoc && (
        <div className="bg-white border border-[#E4E7EC] rounded-[24px] p-6 sm:p-7 shadow-[0_2px_12px_rgba(21,156,240,0.04)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#EDF2F7]">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase bg-[#EAF6FF] text-[#159CF0] border border-[#D0E7FF]">
                  {activeDoc.brand}
                </span>
                <span className="text-xs font-mono font-bold text-[#161525] bg-[#F4F7FA] px-2.5 py-0.5 rounded-full border border-[#E4E7EC]">
                  {activeDoc.versionTag}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#161525] tracking-tight">
                {activeDoc.title}
              </h3>
              <p className="text-xs text-[#667085] font-mono mt-1">
                Last Effective Date: {activeDoc.lastUpdated}
              </p>
            </div>

            <button
              onClick={() => setEditingDoc(activeDoc)}
              className="px-4 py-2 rounded-[11px] bg-[#159CF0] hover:bg-[#0879DC] text-white text-xs font-semibold shadow-[0_4px_12px_rgba(21,156,240,0.28)] transition-all cursor-pointer"
            >
              Edit Document & Bump Version
            </button>
          </div>

          {/* Legal Sections Display */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-[#667085] tracking-wider">
              Enforceable Legal Sections ({activeDoc.sections.length} Clauses)
            </h4>

            <div className="space-y-3.5">
              {activeDoc.sections.map((sec, idx) => (
                <div
                  key={sec.id || idx}
                  className="p-4 sm:p-5 rounded-[16px] bg-[#FAFDFF] border border-[#EDF2F7] space-y-2"
                >
                  <h5 className="font-bold text-[#161525] text-xs">
                    {sec.title}
                  </h5>
                  {sec.paragraphs &&
                    sec.paragraphs.map((p, pIdx) => (
                      <p
                        key={pIdx}
                        className="text-xs text-[#344054] leading-relaxed"
                      >
                        {p}
                      </p>
                    ))}
                  {sec.bullets && (
                    <ul className="list-disc list-inside text-xs text-[#344054] space-y-1 pl-2">
                      {sec.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  )}
                  {sec.link && (
                    <p className="text-xs text-[#159CF0] font-mono pt-1">
                      Outbound Link: {sec.link.label} ({sec.link.href})
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Document Modal */}
      {editingDoc && (
        <div className="fixed inset-0 bg-[#161525]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4E7EC] rounded-[24px] w-full max-w-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF2F7]">
              <h3 className="font-bold text-[#161525] text-base">
                Edit Legal Document
              </h3>
              <button
                onClick={() => setEditingDoc(null)}
                className="text-[#667085] hover:text-[#161525] text-sm font-bold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#344054] block mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={editingDoc.title}
                  onChange={(e) =>
                    setEditingDoc({ ...editingDoc, title: e.target.value })
                  }
                  className="w-full bg-[#FAFDFF] border border-[#E4E7EC] rounded-[11px] p-2.5 text-sm text-[#161525] focus:outline-none focus:border-[#159CF0]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#344054] block mb-1">
                    Version Tag (e.g. Version 2, v1.1)
                  </label>
                  <input
                    type="text"
                    value={editingDoc.versionTag}
                    onChange={(e) =>
                      setEditingDoc({
                        ...editingDoc,
                        versionTag: e.target.value,
                      })
                    }
                    className="w-full bg-[#FAFDFF] border border-[#E4E7EC] rounded-[11px] p-2 text-xs text-[#161525] font-mono focus:outline-none focus:border-[#159CF0]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#344054] block mb-1">
                    Effective Date
                  </label>
                  <input
                    type="text"
                    value={editingDoc.lastUpdated}
                    onChange={(e) =>
                      setEditingDoc({
                        ...editingDoc,
                        lastUpdated: e.target.value,
                      })
                    }
                    className="w-full bg-[#FAFDFF] border border-[#E4E7EC] rounded-[11px] p-2 text-xs text-[#161525] font-mono focus:outline-none focus:border-[#159CF0]"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EDF2F7]">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="px-4 py-2 rounded-[11px] bg-white hover:bg-[#F4F7FA] text-[#667085] text-xs font-semibold border border-[#E4E7EC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4.5 py-2 rounded-[11px] bg-[#159CF0] hover:bg-[#0879DC] text-white text-xs font-semibold shadow-[0_4px_12px_rgba(21,156,240,0.28)] transition-all cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Save Legal Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
