/* Newsletter Campaigns Service */
import { http } from "../api/client";
import { routes } from "../api/routes";
import type { Id, RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { linkLookup } from "../catalog/attributesApi";
import type { Campaign } from "../types";
import { withHrefs } from "@/utils/shopTargets";

/**
 * Newsletter emails on the API: a draft is written in the admin, then sent
 * now or scheduled (the API sends it when its time comes). A sent campaign
 * is locked. Only confirmed subscribers get it, through the email queue,
 * each with their own unsubscribe link.
 */

const C = routes.adminNewsletter.campaigns;
const ADMIN = { realm: "admin" } as const;

export function listCampaigns({ signal }: RequestOptions = {}) {
  return http.get<Campaign[]>(C, { ...ADMIN, signal });
}

/**
 * Saving needs only a subject so a draft can be kept half done. The button's
 * address is worked out here from its target and the live catalogue, so the
 * email links to a page that exists when it is written.
 */
export async function saveCampaign(data: Partial<Campaign> & { id?: Id }) {
  const { id, status: _s, sendAt: _a, sentAt: _t, recipients: _r, createdAt: _c, updatedAt: _u, ...fields } = data;
  if (fields.cta) fields.cta = withHrefs(fields.cta, await linkLookup());
  if (id) return http.patch<Campaign>(`${C}/${id}`, fields, ADMIN);
  const row = await http.post<Campaign>(C, fields, ADMIN);
  logActivity({ module: "newsletter", action: "create", entityId: row.id, summary: `Drafted campaign "${row.subject}"` });
  return row;
}

// The time must be in the future, and the campaign complete; the API checks both.
export async function scheduleCampaign(id: Id, sendAt: string) {
  const c = await http.post<Campaign>(`${C}/${id}/schedule`, { sendAt }, ADMIN);
  logActivity({ module: "newsletter", action: "update", entityId: id, summary: `Scheduled "${c.subject}"` });
  return c;
}

export function unscheduleCampaign(id: Id) {
  return http.post<Campaign>(`${C}/${id}/unschedule`, undefined, ADMIN);
}

// Send now: same checks as scheduling, then it is locked as sent.
export async function sendCampaign(id: Id) {
  const c = await http.post<Campaign>(`${C}/${id}/send`, undefined, ADMIN);
  logActivity({ module: "newsletter", action: "update", entityId: id, summary: `Sent "${c.subject}" to ${c.recipients} subscribers` });
  return c;
}

// Drafts and scheduled campaigns can go; a sent one stays as the record of what was emailed.
export function removeCampaign(id: Id) {
  return http.del(`${C}/${id}`, ADMIN);
}
