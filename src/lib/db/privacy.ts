import { query, isDatabaseConfigured } from "./postgres";
import { triggerMetaMindfulRevalidation } from "./faqs";
import type { LegalDocument, LegalSection, TenantBrand } from "@/types/crm";

/**
 * Retrieves the MetaMindful Privacy Policy document from PostgreSQL.
 */
export async function getDbPrivacyPolicy(): Promise<LegalDocument | null> {
  if (!isDatabaseConfigured()) return null;

  try {
    const metaRows = await query<any>("SELECT * FROM privacy_policy_meta LIMIT 1");
    const sectionRows = await query<any>(
      "SELECT * FROM privacy_policy_sections ORDER BY display_order ASC"
    );

    if (metaRows.length === 0 && sectionRows.length === 0) {
      return null;
    }

    const meta = metaRows[0] || {};
    const sections: LegalSection[] = sectionRows.map((s) => {
      const paragraphs =
        typeof s.paragraphs === "string" ? JSON.parse(s.paragraphs) : s.paragraphs;
      const bullets =
        typeof s.bullets === "string" ? JSON.parse(s.bullets) : s.bullets;

      return {
        id: s.section_id,
        title: s.title,
        paragraphs: Array.isArray(paragraphs) ? paragraphs : [],
        bullets: Array.isArray(bullets) ? bullets : undefined,
        callout: s.callout ? { text: s.callout } : undefined,
        link: s.link_label
          ? {
              label: s.link_label,
              href: s.link_href || s.link_label,
            }
          : undefined,
      };
    });

    return {
      id: "doc_privacy_metamindful",
      brand: "metamindful" as TenantBrand,
      type: "PRIVACY_POLICY",
      title: meta.title || "Privacy Policy",
      versionTag: meta.version || "Version 2",
      lastUpdated: meta.last_updated || "19 Aug 2026",
      seo: {
        title: meta.seo_title || "Privacy Policy | MetaMindful",
        description: meta.seo_description || "",
        canonical: meta.canonical || "/privacy",
      },
      updatedAt: meta.updated_at
        ? new Date(meta.updated_at).toISOString()
        : new Date().toISOString(),
      sections,
    };
  } catch (error) {
    console.error("[PostgreSQL Privacy Read Error]", error);
    return null;
  }
}

/**
 * Saves/Updates MetaMindful Privacy Policy in PostgreSQL using parameterized queries,
 * then triggers instant on-demand revalidation for /privacy on MetaMindful.
 */
export async function saveDbPrivacyPolicy(doc: LegalDocument): Promise<LegalDocument> {
  // 1. Update Document Metadata
  await query(
    `UPDATE privacy_policy_meta SET
       version = $1,
       last_updated = $2,
       title = $3,
       seo_title = $4,
       seo_description = $5,
       canonical = $6,
       updated_at = NOW()`,
    [
      doc.versionTag || "Version 2",
      doc.lastUpdated || new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
      doc.title || "Privacy Policy",
      doc.seo?.title || `${doc.title} | MetaMindful`,
      doc.seo?.description || "",
      doc.seo?.canonical || "/privacy",
    ]
  );

  // 2. Upsert each section
  if (doc.sections && doc.sections.length > 0) {
    for (let i = 0; i < doc.sections.length; i++) {
      const s = doc.sections[i];
      const sectionId = s.id || `section_${i + 1}`;
      const calloutText = s.callout?.text || (typeof s.callout === "string" ? s.callout : null);

      await query(
        `INSERT INTO privacy_policy_sections (
           section_id, title, paragraphs, bullets, callout, link_label, link_href, display_order, updated_at
         ) VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6, $7, $8, NOW())
         ON CONFLICT (section_id) DO UPDATE SET
           title = EXCLUDED.title,
           paragraphs = EXCLUDED.paragraphs,
           bullets = EXCLUDED.bullets,
           callout = EXCLUDED.callout,
           link_label = EXCLUDED.link_label,
           link_href = EXCLUDED.link_href,
           display_order = EXCLUDED.display_order,
           updated_at = NOW()`,
        [
          sectionId,
          s.title,
          JSON.stringify(s.paragraphs || []),
          JSON.stringify(s.bullets || []),
          calloutText,
          s.link?.label || null,
          s.link?.href || null,
          i,
        ]
      );
    }
  }

  // 3. Trigger instant revalidation of MetaMindful /privacy page
  triggerMetaMindfulRevalidation({ path: "/privacy" });

  return doc;
}

