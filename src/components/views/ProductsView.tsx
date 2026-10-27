"use client";

import React, { useState } from "react";
import type { ProductItem } from "@/types/crm";

interface ProductsViewProps {
  products: ProductItem[];
  onSaveProduct: (product: ProductItem) => Promise<void>;
}

export function ProductsView({ products, onSaveProduct }: ProductsViewProps) {
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSaving(true);
    try {
      await onSaveProduct(editingProduct);
      setEditingProduct(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E4E7EC] rounded-[20px] p-5.5 shadow-[0_2px_12px_rgba(21,156,240,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#161525] tracking-tight">
            AIREC Products & Incubation Portfolio
          </h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Public product profiles incubated by AIREC, beginning with MetaMindful.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {products.map((prod) => (
          <div
            key={prod.id}
            className="bg-white border border-[#E4E7EC] hover:border-[#B8D5FF] rounded-[24px] p-6 sm:p-7 shadow-[0_2px_12px_rgba(21,156,240,0.04)] hover:shadow-[0_8px_30px_rgba(21,156,240,0.08)] space-y-6 transition-all duration-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#EAF6FF] text-[#159CF0] border border-[#D0E7FF] font-bold uppercase">
                  {prod.label}
                </span>
                <h3 className="text-2xl font-bold text-[#161525] pt-1 tracking-tight">
                  {prod.name}
                </h3>
                <p className="text-sm font-semibold text-[#159CF0] italic">
                  "{prod.tagline}"
                </p>
                <p className="text-xs text-[#344054] mt-2 max-w-3xl leading-relaxed">
                  {prod.body}
                </p>
              </div>

              <div className="flex items-center gap-2.5 self-start shrink-0">
                {prod.externalUrl && (
                  <a
                    href={prod.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-[11px] bg-white hover:bg-[#EAF6FF] text-[#159CF0] text-xs font-semibold border border-[#D0E7FF] transition-all shadow-2xs"
                  >
                    Visit Live Site ↗
                  </a>
                )}
                <button
                  onClick={() => setEditingProduct(prod)}
                  className="px-4 py-2 rounded-[11px] bg-[#159CF0] hover:bg-[#0879DC] text-white text-xs font-semibold shadow-[0_4px_12px_rgba(21,156,240,0.28)] transition-all cursor-pointer"
                >
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Designed For Real User Moments */}
            <div>
              <h4 className="text-xs font-bold uppercase text-[#667085] tracking-wider mb-2.5">
                Designed For Real User Moments
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {prod.moments.map((moment, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-[14px] bg-[#FAFDFF] border border-[#EDF2F7] text-xs text-[#344054] flex items-start gap-2.5"
                  >
                    <span className="text-[#159CF0] font-bold mt-0.5">•</span>
                    <span>{moment}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Responsible AI Scope & Disclaimers */}
            <div>
              <h4 className="text-xs font-bold uppercase text-[#667085] tracking-wider mb-2.5">
                Responsible AI Scope & Disclaimers
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {prod.boundaries.map((b, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-[14px] bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-start gap-2.5"
                  >
                    <span className="text-[#EF4444] font-bold">✓</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-[#161525]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4E7EC] rounded-[24px] w-full max-w-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF2F7]">
              <h3 className="font-bold text-[#161525] text-base">
                Edit Product: {editingProduct.name}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-[#667085] hover:text-[#161525] text-sm font-bold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#344054] block mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={editingProduct.tagline}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, tagline: e.target.value })
                  }
                  className="w-full bg-[#FAFDFF] border border-[#E4E7EC] rounded-[11px] p-2.5 text-sm text-[#161525] focus:outline-none focus:border-[#159CF0]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#344054] block mb-1">
                  Overview Description
                </label>
                <textarea
                  rows={4}
                  value={editingProduct.body}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, body: e.target.value })
                  }
                  className="w-full bg-[#FAFDFF] border border-[#E4E7EC] rounded-[11px] p-2.5 text-sm text-[#161525] focus:outline-none focus:border-[#159CF0]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EDF2F7]">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-[11px] bg-white hover:bg-[#F4F7FA] text-[#667085] text-xs font-semibold border border-[#E4E7EC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4.5 py-2 rounded-[11px] bg-[#159CF0] hover:bg-[#0879DC] text-white text-xs font-semibold shadow-[0_4px_12px_rgba(21,156,240,0.28)] transition-all cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Save Product Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
