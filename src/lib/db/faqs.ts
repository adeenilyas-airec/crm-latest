import { query, isDatabaseConfigured } from "./postgres";
import type { FAQItem, TenantBrand } from "@/types/crm";

/**
 * Trigger on-demand cache revalidation on the deployed MetaMindful website.
 */
export async function triggerMetaMindfulRevalidation(options: {
  path?: string;
  slug?: string;
}): Promise<void> {
  try {
    const siteUrl =
      process.env.METAMINDFUL_SITE_URL || "https://metamindful-latest.vercel.app";
    const secret =
      process.env.REVALIDATION_SECRET || "metamindful-secret-revalidate-token";

    let url = `${siteUrl}/api/revalidate?secret=${encodeURIComponent(secret)}`;
    if (options.slug) url += `&slug=${encodeURIComponent(options.slug)}`;
    if (options.path) url += `&path=${encodeURIComponent(options.path)}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      method: "POST",
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      console.log(`[Revalidation OK on ${siteUrl}]:`, data);
    } else {
      console.warn(`[Revalidation HTTP ${res.status}]:`, await res.text().catch(() => ""));
    }
  } catch (err: any) {
    console.warn("[Revalidation Notice]:", err.message);
  }
}

/**
 * Retrieves all active MetaMindful FAQs directly from PostgreSQL.
 */
export async function getDbFaqs(): Promise<FAQItem[]> {
  if (!isDatabaseConfigured()) return [];

  const rows = await query<{
    id: number;
    question: string;
    answer: string;
    display_order: number;
    is_active: boolean;
  }>("SELECT id, question, answer, display_order, is_active FROM faqs WHERE is_active = true ORDER BY display_order ASC");

  return rows.map((r) => ({
    id: String(r.id),
    brand: "metamindful" as TenantBrand,
    location: "METAMINDFUL_HOME" as const,
    serviceSlug: "METAMINDFUL_HOME",
    question: r.question,
    answer: r.answer,
    sortOrder: r.display_order,
    isVisible: r.is_active,
    updatedAt: new Date().toISOString(),
  }));
}

/**
 * Inserts or updates an FAQ in PostgreSQL using parameterized queries,
 * then triggers instant revalidation of the MetaMindful homepage.
 */
export async function saveDbFaq(
  faq: Partial<FAQItem> & { question: string; answer: string; brand?: TenantBrand }
): Promise<FAQItem> {
  const numericId = faq.id && !isNaN(Number(faq.id)) ? Number(faq.id) : null;

  let row: any;

  if (numericId !== null) {
    // Parameterized UPDATE
    const result = await query(
      `UPDATE faqs SET
         question = $1,
         answer = $2,
         updated_at = NOW()
       WHERE id = $3
       RETURNING id, question, answer, display_order, is_active`,
      [faq.question, faq.answer, numericId]
    );

    if (result.length > 0) {
      row = result[0];
    } else {
      // If not found by ID, insert as new
      const insertResult = await query(
        `INSERT INTO faqs (question, answer, display_order, is_active)
         VALUES ($1, $2, (SELECT COALESCE(MAX(display_order), 0) + 1 FROM faqs), true)
         RETURNING id, question, answer, display_order, is_active`,
        [faq.question, faq.answer]
      );
      row = insertResult[0];
    }
  } else {
    // Parameterized INSERT
    const insertResult = await query(
      `INSERT INTO faqs (question, answer, display_order, is_active)
       VALUES ($1, $2, (SELECT COALESCE(MAX(display_order), 0) + 1 FROM faqs), true)
       RETURNING id, question, answer, display_order, is_active`,
      [faq.question, faq.answer]
    );
    row = insertResult[0];
  }

  // Purge MetaMindful homepage cache where FAQs live
  triggerMetaMindfulRevalidation({ path: "/" });

  return {
    id: String(row.id),
    brand: "metamindful" as TenantBrand,
    location: "METAMINDFUL_HOME" as const,
    serviceSlug: "METAMINDFUL_HOME",
    question: row.question,
    answer: row.answer,
    sortOrder: row.display_order,
    isVisible: row.is_active,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Deletes an FAQ from PostgreSQL and purges the MetaMindful cache.
 */
export async function deleteDbFaq(id: string): Promise<boolean> {
  const numericId = Number(id);
  if (isNaN(numericId)) return false;

  await query("DELETE FROM faqs WHERE id = $1", [numericId]);

  // Purge homepage cache
  triggerMetaMindfulRevalidation({ path: "/" });

  return true;
}
