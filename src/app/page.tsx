"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { OverviewView } from "@/components/views/OverviewView";
import { BlogsView } from "@/components/views/BlogsView";
import { CommentsView } from "@/components/views/CommentsView";
import { DeletionsView } from "@/components/views/DeletionsView";
import { ServicesView } from "@/components/views/ServicesView";
import { ProductsView } from "@/components/views/ProductsView";
import { FaqsView } from "@/components/views/FaqsView";
import { LegalView } from "@/components/views/LegalView";
import { InquiriesView } from "@/components/views/InquiriesView";
import type {
  BlogPost,
  BlogComment,
  LegalDocument,
  FAQItem,
  ServiceItem,
  ProductItem,
  ContactInquiry,
  DeletionRequest,
  CRMMetrics,
  TenantBrand,
  CommentStatus,
  DeletionStatus,
  InquiryStatus,
} from "@/types/crm";

export default function CRMMainPage() {
  const [currentTab, setCurrentTab] = useState<string>("overview");
  const [selectedBrand, setSelectedBrand] = useState<TenantBrand>("metamindful");
  const [loading, setLoading] = useState<boolean>(true);

  // States
  const [metrics, setMetrics] = useState<CRMMetrics>({
    totalBlogs: 21,
    totalCommentsPending: 1,
    totalDeletionsPending: 1,
    totalInquiriesNew: 2,
    totalServices: 6,
    totalFAQs: 28,
  });

  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [deletions, setDeletions] = useState<DeletionRequest[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [legalDocs, setLegalDocs] = useState<LegalDocument[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);

  // Initial Fetch & Refresh
  const fetchData = async (brand: TenantBrand = selectedBrand) => {
    try {
      setLoading(true);
      const [
        metricsRes,
        blogsRes,
        commentsRes,
        deletionsRes,
        servicesRes,
        faqsRes,
        legalRes,
        inquiriesRes,
      ] = await Promise.all([
        fetch(`/api/v1/metrics?brand=${brand}`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
        fetch("/api/v1/content/blogs", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
        fetch("/api/v1/interactions/comments", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
        fetch("/api/v1/compliance/delete-account", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
        fetch("/api/v1/content/services", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
        fetch(`/api/v1/content/faqs?brand=${brand}`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
        fetch(`/api/v1/content/legal?brand=${brand}`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
        fetch(`/api/v1/leads/inquiry?brand=${brand}`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      ]);

      if (metricsRes?.metrics) setMetrics(metricsRes.metrics);
      if (blogsRes?.data) setBlogs(blogsRes.data);
      if (commentsRes?.data) setComments(commentsRes.data);
      if (deletionsRes?.data) setDeletions(deletionsRes.data);
      if (servicesRes?.data) setServices(servicesRes.data);
      if (faqsRes?.data) setFaqs(faqsRes.data);
      if (legalRes?.data) setLegalDocs(legalRes.data);
      if (inquiriesRes?.data && inquiriesRes.data.length > 0) {
        setInquiries(inquiriesRes.data);
      } else {
        setInquiries([
          {
            id: "inq_1",
            brand: "airec",
            name: "David Chen",
            email: "david.chen@enterprise-health.io",
            organization: "Enterprise Health Systems",
            message: "We are looking to implement custom AI agents to automate clinical triage.",
            serviceInterest: "ai-agents-automation",
            sourceUrl: "https://airec.tech/services/ai-agents-automation",
            status: "NEW",
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
          {
            id: "inq_2",
            brand: "airec",
            name: "Elena Rostova",
            email: "elena@novafinance.co",
            organization: "Nova Finance Group",
            message: "Need predictive analytics for fraud detection & real-time risk modeling.",
            serviceInterest: "predictive-analytics",
            sourceUrl: "https://airec.tech/services/predictive-analytics",
            status: "REPLIED",
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          },
        ]);
      }

      const sampleProducts: ProductItem[] = [
        {
          id: "prod_metamindful",
          name: "MetaMindful",
          label: "Product / 01",
          tagline: "Less overthinking. More useful action.",
          body: "MetaMindful is AIREC's first AI product. It is a private conversational mental wellness experience designed to help people work through moments of overthinking and move toward practical action. Its approach is informed by Acceptance and Commitment Therapy principles and mindfulness.",
          moments: [
            "When a decision keeps circling.",
            "When avoidance is getting in the way.",
            "When thoughts have become louder than the situation.",
            "When someone knows something matters but struggles to move toward it.",
          ],
          boundaries: [
            "It is not therapy.",
            "It does not diagnose mental health conditions.",
            "It is not crisis support.",
            "It is not a replacement for medical care or treatment from a qualified mental health professional.",
          ],
          methodSteps: [
            { id: "01", title: "Find", body: "Identify a meaningful, recurring problem." },
            { id: "02", title: "Explore", body: "Study the human problem and technical possibilities around it." },
            { id: "03", title: "Build", body: "Turn the strongest approach into a useful product experience." },
            { id: "04", title: "Learn", body: "Let real-world use improve the product and inform future research." },
          ],
          externalUrl: "https://metamindful.ai/",
          isActive: true,
          updatedAt: new Date().toISOString(),
        },
      ];
      setProducts(sampleProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedBrand);
  }, [selectedBrand]);

  // Handlers
  const handleSaveBlog = async (blog: Partial<BlogPost> & { title: string; slug: string }) => {
    // Optimistically update table immediately
    setBlogs((prev) =>
      prev.map((b) => (b.slug === blog.slug || (blog.id && b.id === blog.id) ? { ...b, ...blog } : b))
    );

    const res = await fetch("/api/v1/content/blogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blog),
    });
    if (res.ok) {
      const result = await res.json().catch(() => null);
      if (result?.data) {
        setBlogs((prev) =>
          prev.map((b) => (b.slug === result.data.slug || b.id === result.data.id ? { ...b, ...result.data } : b))
        );
      }
      fetchData();
    }
  };

  const handleLikeBlog = async (slug: string) => {
    const res = await fetch("/api/v1/interactions/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blogSlug: slug }),
    });
    if (res.ok) {
      setBlogs((prev) =>
        prev.map((b) => (b.slug === slug ? { ...b, likesCount: (b.likesCount || 0) + 1 } : b))
      );
    }
  };

  const handleUpdateCommentStatus = async (id: string, status: CommentStatus) => {
    const res = await fetch("/api/v1/interactions/comments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
      setMetrics((prev) => ({
        ...prev,
        totalCommentsPending: Math.max(0, prev.totalCommentsPending - (status !== "PENDING" ? 1 : 0)),
      }));
    }
  };

  const handleUpdateDeletionStatus = async (
    id: string,
    status: DeletionStatus,
    notes?: string
  ) => {
    const res = await fetch("/api/v1/compliance/delete-account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, notes }),
    });
    if (res.ok) {
      setDeletions((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status, notes: notes || d.notes } : d))
      );
      if (status !== "PENDING") {
        setMetrics((prev) => ({
          ...prev,
          totalDeletionsPending: Math.max(0, prev.totalDeletionsPending - 1),
        }));
      }
    }
  };

  const handleSaveService = async (service: Partial<ServiceItem> & { title: string; slug: string }) => {
    const res = await fetch("/api/v1/content/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(service),
    });
    if (res.ok) {
      fetchData();
    }
  };

  const handleSaveProduct = async (product: ProductItem) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
  };

  const handleSaveFaq = async (faq: Partial<FAQItem> & { question: string; answer: string; brand: TenantBrand }) => {
    // Optimistically update FAQ table immediately
    setFaqs((prev) =>
      prev.map((f) => (f.id === faq.id || (faq.question && f.question === faq.question) ? { ...f, ...faq } : f))
    );

    const res = await fetch("/api/v1/content/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(faq),
    });
    if (res.ok) {
      const result = await res.json().catch(() => null);
      if (result?.data) {
        setFaqs((prev) =>
          prev.map((f) => (f.id === result.data.id || (result.data.id && String(f.id) === String(result.data.id)) ? { ...f, ...result.data } : f))
        );
      }
      fetchData();
    }
  };

  const handleDeleteFaq = async (id: string) => {
    const res = await fetch(`/api/v1/content/faqs?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      setMetrics((prev) => ({ ...prev, totalFAQs: Math.max(0, prev.totalFAQs - 1) }));
    }
  };

  const handleSaveLegalDoc = async (doc: LegalDocument) => {
    // Optimistically update Legal Documents immediately
    setLegalDocs((prev) =>
      prev.map((d) => (d.id === doc.id || (d.brand === doc.brand && d.type === doc.type) ? doc : d))
    );

    const res = await fetch("/api/v1/content/legal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doc),
    });
    if (res.ok) {
      const result = await res.json().catch(() => null);
      if (result?.data) {
        setLegalDocs((prev) =>
          prev.map((d) => (d.id === result.data.id || (d.brand === result.data.brand && d.type === result.data.type) ? result.data : d))
        );
      }
      fetchData();
    }
  };

  const handleUpdateInquiryStatus = async (id: string, status: InquiryStatus, notes?: string) => {
    const res = await fetch("/api/v1/leads/inquiry", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, notes }),
    });
    if (res.ok) {
      setInquiries((prev) => prev.map((l) => (l.id === id ? { ...l, status, notes: notes || l.notes } : l)));
      if (status !== "NEW") {
        setMetrics((prev) => ({
          ...prev,
          totalInquiriesNew: Math.max(0, prev.totalInquiriesNew - 1),
        }));
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#FAFDFF] text-[#161525] overflow-hidden font-sans">
      {/* Sidebar (MetaMindful Midnight Obsidian & Sky Blue) */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        metrics={metrics}
      />

      {/* Main Content Area (MetaMindful Crisp Surface) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FAFDFF]">
        <Header
          currentTab={currentTab}
          selectedBrand={selectedBrand}
          pendingDeletionsCount={metrics.totalDeletionsPending}
          onRefresh={() => fetchData(selectedBrand)}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#FAFDFF]">
          <div className="max-w-7xl mx-auto">
            {currentTab === "overview" && (
              <OverviewView
                selectedBrand={selectedBrand}
                metrics={metrics}
                recentInquiries={inquiries}
                recentDeletions={deletions}
                recentComments={comments}
                onNavigate={setCurrentTab}
              />
            )}

            {currentTab === "blogs" && (
              <BlogsView
                blogs={blogs}
                onSaveBlog={handleSaveBlog}
                onLikeBlog={handleLikeBlog}
              />
            )}

            {currentTab === "comments" && (
              <CommentsView
                comments={comments}
                onUpdateStatus={handleUpdateCommentStatus}
              />
            )}

            {currentTab === "deletions" && (
              <DeletionsView
                deletions={deletions}
                onUpdateStatus={handleUpdateDeletionStatus}
              />
            )}

            {currentTab === "services" && (
              <ServicesView
                services={services}
                onSaveService={handleSaveService}
              />
            )}

            {currentTab === "products" && (
              <ProductsView
                products={products}
                onSaveProduct={handleSaveProduct}
              />
            )}

            {currentTab === "faqs" && (
              <FaqsView
                selectedBrand={selectedBrand}
                faqs={faqs}
                onSaveFaq={handleSaveFaq}
                onDeleteFaq={handleDeleteFaq}
              />
            )}

            {currentTab === "legal" && (
              <LegalView
                selectedBrand={selectedBrand}
                documents={legalDocs}
                onSaveDoc={handleSaveLegalDoc}
              />
            )}

            {currentTab === "inquiries" && (
              <InquiriesView
                selectedBrand={selectedBrand}
                inquiries={inquiries}
                onUpdateStatus={handleUpdateInquiryStatus}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
