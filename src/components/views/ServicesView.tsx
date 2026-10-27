"use client";

import React, { useState } from "react";
import type { ServiceItem } from "@/types/crm";

interface ServicesViewProps {
  services: ServiceItem[];
  onSaveService: (service: Partial<ServiceItem> & { title: string; slug: string }) => Promise<void>;
}

export function ServicesView({ services, onSaveService }: ServicesViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(services[0]?.id || null);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setIsSaving(true);
    try {
      await onSaveService(editingService);
      setEditingService(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E4E7EC] rounded-[20px] p-5.5 shadow-[0_2px_12px_rgba(21,156,240,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#161525] tracking-tight">
            AIREC Enterprise Services & Deliverables
          </h2>
          <p className="text-xs text-[#667085] mt-0.5">
            6 core service offerings. Manage deliverable scopes and descriptions synced across client touchpoints.
          </p>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {services.map((svc) => {
          const isExpanded = expandedId === svc.id;

          return (
            <div
              key={svc.id}
              className="bg-white border border-[#E4E7EC] hover:border-[#B8D5FF] rounded-[22px] shadow-[0_2px_12px_rgba(21,156,240,0.04)] overflow-hidden transition-all duration-200"
            >
              {/* Card Header */}
              <div
                onClick={() => toggleExpand(svc.id)}
                className="p-5 sm:p-6 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-[#FAFDFF] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-[#EAF6FF] text-[#159CF0] border border-[#D0E7FF]">
                    {svc.serviceCode}
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#161525] text-base">
                      {svc.title}
                    </h3>
                    <p className="text-xs text-[#667085] font-mono mt-0.5">
                      Slug: /services/{svc.slug}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingService(svc);
                    }}
                    className="px-3.5 py-1.5 rounded-[9px] bg-white hover:bg-[#EAF6FF] text-[#159CF0] text-xs font-semibold border border-[#D0E7FF] transition-colors shadow-2xs"
                  >
                    Edit Service
                  </button>
                  <span className="text-xs text-[#159CF0] font-semibold">
                    {isExpanded ? "Collapse ▲" : "Expand ▼"}
                  </span>
                </div>
              </div>

              {/* Expanded Capabilities & Deliverables */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-3 border-t border-[#EDF2F7] space-y-5 bg-[#FAFDFF]">
                  {/* Tagline & Overview */}
                  <div>
                    <h4 className="text-xs font-bold uppercase text-[#667085] tracking-wider mb-1">
                      Overview & Positioning
                    </h4>
                    <p className="text-sm font-semibold text-[#161525] italic">
                      "{svc.tagline}"
                    </p>
                    <p className="text-xs text-[#344054] mt-1.5 leading-relaxed">
                      {svc.body}
                    </p>
                  </div>

                  {/* Competencies Badges */}
                  {svc.taglinePills && svc.taglinePills.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold uppercase text-[#667085] tracking-wider mb-2">
                        Core Competencies
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {svc.taglinePills.map((pill, pIdx) => (
                          <span
                            key={pIdx}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-white text-[#344054] border border-[#E4E7EC] shadow-2xs"
                          >
                            {pill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Capabilities & Scope */}
                  <div>
                    <h4 className="text-xs font-bold uppercase text-[#159CF0] tracking-wider mb-3">
                      Capabilities & Scope of Work Deliverables
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {svc.capabilities.map((cap, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-4 rounded-[16px] bg-white border border-[#E4E7EC] shadow-2xs space-y-2"
                        >
                          <h5 className="font-bold text-[#161525] text-sm">
                            {cap.title}
                          </h5>
                          <p className="text-xs text-[#667085] leading-relaxed">
                            {cap.description}
                          </p>
                          {cap.deliverables && cap.deliverables.length > 0 && (
                            <div className="pt-2 border-t border-[#EDF2F7]">
                              <p className="text-[11px] font-bold uppercase text-[#667085] mb-1.5">
                                Deliverables:
                              </p>
                              <ul className="space-y-1">
                                {cap.deliverables.map((del, dIdx) => (
                                  <li
                                    key={dIdx}
                                    className="text-xs text-[#344054] flex items-start gap-2"
                                  >
                                    <span className="text-[#159CF0] font-bold">•</span>
                                    <span>{del}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SEO Overview */}
                  <div className="p-4 rounded-[16px] bg-white border border-[#E4E7EC] text-xs space-y-1">
                    <p className="text-[11px] uppercase font-bold text-[#667085]">
                      SEO Configuration
                    </p>
                    <p className="text-[#161525] font-semibold">
                      {svc.meta.title}
                    </p>
                    <p className="text-[#667085] text-xs">
                      {svc.meta.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 bg-[#161525]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4E7EC] rounded-[24px] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#EDF2F7]">
              <h3 className="font-bold text-[#161525] text-base">
                Edit Service: {editingService.title}
              </h3>
              <button
                onClick={() => setEditingService(null)}
                className="text-[#667085] hover:text-[#161525] text-sm font-bold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#344054] block mb-1">
                  Service Title
                </label>
                <input
                  type="text"
                  value={editingService.title}
                  onChange={(e) =>
                    setEditingService({ ...editingService, title: e.target.value })
                  }
                  className="w-full bg-[#FAFDFF] border border-[#E4E7EC] rounded-[11px] p-2.5 text-sm text-[#161525] focus:outline-none focus:border-[#159CF0]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#344054] block mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={editingService.tagline}
                  onChange={(e) =>
                    setEditingService({ ...editingService, tagline: e.target.value })
                  }
                  className="w-full bg-[#FAFDFF] border border-[#E4E7EC] rounded-[11px] p-2.5 text-sm text-[#161525] focus:outline-none focus:border-[#159CF0]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#344054] block mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={editingService.body}
                  onChange={(e) =>
                    setEditingService({ ...editingService, body: e.target.value })
                  }
                  className="w-full bg-[#FAFDFF] border border-[#E4E7EC] rounded-[11px] p-2.5 text-sm text-[#161525] focus:outline-none focus:border-[#159CF0]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EDF2F7]">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 rounded-[11px] bg-white hover:bg-[#F4F7FA] text-[#667085] text-xs font-semibold border border-[#E4E7EC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4.5 py-2 rounded-[11px] bg-[#159CF0] hover:bg-[#0879DC] text-white text-xs font-semibold shadow-[0_4px_12px_rgba(21,156,240,0.28)] transition-all cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Save Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
