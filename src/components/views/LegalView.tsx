"use client";

import React, { useState } from "react";
import type { LegalDocument, LegalSection, TenantBrand } from "@/types/crm";

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
  
  // Section Editing State
  const [editingSection, setEditingSection] = useState<{
    index: number;
    section: LegalSection;
    paragraphsText: string;
    bulletsText: string;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const activeDoc = brandDocs.find((d) => d.id === selectedDocId) || brandDocs[0];

  // Save Document Meta (Title, Version, Effective Date)
  const handleSaveDocMeta = async (e: React.FormEvent) => {
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

  // Open Section Editor
  const handleOpenSectionEditor = (section: LegalSection, index: number) => {
    setEditingSection({
      index,
      section: { ...section },
      paragraphsText: (section.paragraphs || []).join("\n\n"),
      bulletsText: (section.bullets || []).join("\n"),
    });
  };

  // Save Single Section / Clause
  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection || !activeDoc) return;

    setIsSaving(true);
    try {
      const parsedParagraphs = editingSection.paragraphsText
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const parsedBullets = editingSection.bulletsText
        .split("\n")
        .map((b) => b.trim())
        .filter((b) => b.length > 0);

      const updatedSection: LegalSection = {
        ...editingSection.section,
        paragraphs: parsedParagraphs.length > 0 ? parsedParagraphs : undefined,
        bullets: parsedBullets.length > 0 ? parsedBullets : undefined,
      };

      const newSections = [...activeDoc.sections];
      if (editingSection.index >= 0 && editingSection.index < newSections.length) {
        newSections[editingSection.index] = updatedSection;
      } else {
        newSections.push(updatedSection);
      }

      const updatedDoc: LegalDocument = {
        ...activeDoc,
        sections: newSections,
        updatedAt: new Date().toISOString(),
      };

      await onSaveDoc(updatedDoc);
      setEditingSection(null);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Section / Clause
  const handleDeleteSection = async (index: number) => {
    if (!activeDoc) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${activeDoc.sections[index]?.title}"?`
    );
    if (!confirmDelete) return;

    setIsSaving(true);
    try {
      const newSections = activeDoc.sections.filter((_, i) => i !== index);
      const updatedDoc: LegalDocument = {
        ...activeDoc,
        sections: newSections,
        updatedAt: new Date().toISOString(),
      };
      await onSaveDoc(updatedDoc);
    } finally {
      setIsSaving(false);
    }
  };

  // Add New Section
  const handleAddNewSection = () => {
    if (!activeDoc) return;
    const nextNum = activeDoc.sections.length + 1;
    const newSec: LegalSection = {
      id: `section_${nextNum}`,
      title: `${nextNum}. NEW CLAUSE`,
      paragraphs: ["Add clause content here."],
    };
    handleOpenSectionEditor(newSec, activeDoc.sections.length);
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
              className={`px-3.5 py-1.5 rounded-[9px] text-xs font-semibold transition-all cursor-pointer ${
                isActive
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

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleAddNewSection}
                className="px-3.5 py-2 rounded-[11px] bg-white border border-[#159CF0] text-[#159CF0] hover:bg-[#EAF6FF] text-xs font-semibold transition-all cursor-pointer shadow-xs"
              >
                + Add Clause
              </button>
              <button
                onClick={() => setEditingDoc(activeDoc)}
                className="px-4 py-2 rounded-[11px] bg-[#159CF0] hover:bg-[#0879DC] text-white text-xs font-semibold shadow-[0_4px_12px_rgba(21,156,240,0.28)] transition-all cursor-pointer"
              >
                Edit Document & Bump Version
              </button>
            </div>
          </div>

          {/* Legal Sections Display */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-[#667085] tracking-wider">
                Enforceable Legal Sections ({activeDoc.sections.length} Clauses)
              </h4>
              <span className="text-[11px] text-[#667085] font-medium">
                Click <span className="text-[#159CF0] font-semibold">Edit Clause</span> on any section below to modify legal text & sync to PostgreSQL
              </span>
            </div>

            <div className="space-y-3.5">
              {activeDoc.sections.map((sec, idx) => (
                <div
                  key={sec.id || idx}
                  className="p-4 sm:p-5 rounded-[16px] bg-[#FAFDFF] border border-[#EDF2F7] hover:border-[#D0E7FF] transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#EDF2F7]/60">
                    <h5 className="font-bold text-[#161525] text-xs">
                      {sec.title}
                    </h5>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenSectionEditor(sec, idx)}
                        className="px-3 py-1 rounded-[8px] bg-white border border-[#D0E7FF] hover:border-[#159CF0] text-[#159CF0] hover:bg-[#159CF0] hover:text-white text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
                      >
                        Edit Clause
                      </button>
                      <button
                        onClick={() => handleDeleteSection(idx)}
                        className="px-2 py-1 rounded-[8px] bg-white border border-[#FEE4E2] hover:border-[#F04438] text-[#F04438] hover:bg-[#FEE4E2] text-[11px] font-semibold transition-all cursor-pointer"
                        title="Delete this section"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {sec.paragraphs &&
                    sec.paragraphs.map((p, pIdx) => (
                      <p
                        key={pIdx}
                        className="text-xs text-[#344054] leading-relaxed"
                      >
                        {p}
                      </p>
                    ))}

                  {sec.bullets && sec.bullets.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-[#344054] space-y-1 pl-2">
                      {sec.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  )}

                  {sec.callout && (
                    <div className="p-3 rounded-[10px] bg-[#FFF9F5] border border-[#FEDF89] text-xs text-[#B54708]">
                      <span className="font-semibold block mb-0.5">Important Callout:</span>
                      {sec.callout.text}
                    </div>
                  )}

                  {sec.link && (
                    <p className="text-xs text-[#159CF0] font-mono pt-1">
                      Outbound Link: <a href={sec.link.href} target="_blank" rel="noopener noreferrer" className="underline">{sec.link.label}</a> ({sec.link.href})
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Single Clause / Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-[#161525]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4E7EC] rounded-[24px] w-full max-w-2xl p-6 sm:p-7 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF2F7]">
              <div>
                <h3 className="font-bold text-[#161525] text-base">
                  Edit Legal Clause / Section
                </h3>
                <p className="text-xs text-[#667085] mt-0.5">
                  Update section text and synchronize directly to PostgreSQL table <code className="font-mono text-[#159CF0]">privacy_policy_sections</code>
                </p>
              </div>
              <button
                onClick={() => setEditingSection(null)}
                className="text-[#667085] hover:text-[#161525] text-sm font-bold p-1 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#344054] block mb-1">
                  Section Title / Heading
                </label>
                <input
                  type="text"
                  value={editingSection.section.title}
                  onChange={(e) =>
                    setEditingSection({
                      ...editingSection,
                      section: { ...editingSection.section, title: e.target.value },
                    })
                  }
                  className="w-full bg-[#FAFDFF] border border-[#E4E7EC] rounded-[11px] p-2.5 text-sm font-semibold text-[#161525] focus:outline-none focus:border-[#159CF0]"
                  placeholder="e.g. 2. ACCOUNT AND DATA DELETION"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#344054]">
                    Section Paragraphs
                  </label>
                  <span className="text-[11px] text-[#667085]">
                    Separate distinct paragraphs with a blank line
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={editingSection.paragraphsText}
                  onChange={(e) =>
                    setEditingSection({
                      ...editingSection,
                      paragraphsText: e.target.value,
                    })
                  }
                  className="w-full bg-[#FAFDFF] border border-[#E4E7EC] rounded-[11px] p-3 text-xs leading-relaxed text-[#161525] focus:outline-none focus:border-[#159CF0] resize-y"
                  placeholder="Enter the legal clauses and paragraphs here..."
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#344054]">
                    Bullet Points (Optional)
                  </label>
                  <span className="text-[11px] text-[#667085]">
                    One bullet point per line
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={editingSection.bulletsText}
                  onChange={(e) =>
                    setEditingSection({
                      ...editingSection,
                      bulletsText: e.target.value,
                    })
                  }
                  className="w-full bg-[#FAFDFF] border border-[#E4E7EC] rounded-[11px] p-2.5 text-xs text-[#161525] focus:outline-none focus:border-[#159CF0] resize-y"
                  placeholder="Bullet point 1&#10;Bullet point 2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-[#344054] block mb-1">
                    Outbound Link Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingSection.section.link?.label || ""}
                    onChange={(e) =>
                      setEditingSection({
                        ...editingSection,
                        section: {
                          ...editingSection.section,
                          link: {
                            label: e.target.value,
                            href: editingSection.section.link?.href || e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full bg-[#FAFDFF] border border-[#E4E7EC] rounded-[11px] p-2 text-xs text-[#161525] focus:outline-none focus:border-[#159CF0]"
                    placeholder="e.g. Delete Account Portal"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#344054] block mb-1">
                    Outbound Link URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingSection.section.link?.href || ""}
                    onChange={(e) =>
                      setEditingSection({
                        ...editingSection,
                        section: {
                          ...editingSection.section,
                          link: {
                            label: editingSection.section.link?.label || e.target.value,
                            href: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full bg-[#FAFDFF] border border-[#E4E7EC] rounded-[11px] p-2 text-xs text-[#161525] font-mono focus:outline-none focus:border-[#159CF0]"
                    placeholder="https://metamindful.ai/delete-account/"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EDF2F7]">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 rounded-[11px] bg-white hover:bg-[#F4F7FA] text-[#667085] text-xs font-semibold border border-[#E4E7EC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-[11px] bg-[#159CF0] hover:bg-[#0879DC] text-white text-xs font-semibold shadow-[0_4px_12px_rgba(21,156,240,0.28)] transition-all cursor-pointer"
                >
                  {isSaving ? "Saving to Database..." : "Save Clause & Update Live"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Document Meta Modal */}
      {editingDoc && (
        <div className="fixed inset-0 bg-[#161525]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4E7EC] rounded-[24px] w-full max-w-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF2F7]">
              <div>
                <h3 className="font-bold text-[#161525] text-base">
                  Edit Legal Document Metadata
                </h3>
                <p className="text-xs text-[#667085] mt-0.5">
                  Update document title, published version tag, and effective date.
                </p>
              </div>
              <button
                onClick={() => setEditingDoc(null)}
                className="text-[#667085] hover:text-[#161525] text-sm font-bold p-1 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveDocMeta} className="space-y-4">
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
                  className="px-4 py-2 rounded-[11px] bg-white hover:bg-[#F4F7FA] text-[#667085] text-xs font-semibold border border-[#E4E7EC] cursor-pointer"
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
