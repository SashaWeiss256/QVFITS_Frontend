/* Newsletter Campaigns Service */
import { ApiError, mockApi } from "../api/mock";
import type { Id, RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { assertCan } from "../auth/adminSession";
import { queueEmail } from "../notifications/outboxApi";
import { createCollection, type NewRow } from "../store/collectionStore";
import type { Campaign } from "../types";
import campaignSeed from "@/data/campaigns.json";
import { subscribers } from "./subscribersApi";

/**
 * Newsletter emails: a draft is written in the admin, then sent now or
 * scheduled. A sent campaign is locked. Only confirmed subscribers get it,
 * each with their own unsubscribe link. Honest seam: the emails land in the
 * outbox until an email service is connected; a scheduled one goes out the
 * next time the admin or the shop reads campaigns after its time.
 */
const campaigns = createCollection<Campaign>("campaigns", campaignSeed as Campaign[], { idPrefix: "cmp" });

const find = (id: Id) => {
  const c = campaigns.get(id);
  if (!c) throw new ApiError("That campaign no longer exists.", 404);
  if (c.status === "sent") throw new ApiError("This campaign has been sent, so it can't change.", 409);
  return c;
};

// A campaign can only be scheduled or sent once it has a subject, a heading and a message.
function assertReady(c: Campaign) {
  if (!c.subject.trim()) throw new ApiError("Give it a subject line.", 422);
  if (!c.heading.trim() || !c.body.trim()) throw new ApiError("Write the heading and the message first.", 422);
}

// Sending goes only to subscribers who confirmed (double opt-in). Each email carries that person's own unsubscribe link.
function deliver(c: Campaign) {
  const list = subscribers.list().filter((s) => s.status === "subscribed");
  if (!list.length) throw new ApiError("Nobody has confirmed their subscription yet, so there is no one to send to.", 422);
  for (const s of list) {
    queueEmail({ to: s.email, kind: "campaign", subject: c.subject, body: `${c.heading}. ${c.body}`, link: `/newsletter/unsubscribe?token=${s.token}` });
  }
  return campaigns.update(c.id, { status: "sent", sentAt: new Date().toISOString(), recipients: list.length, updatedAt: new Date().toISOString() })!;
}

// Scheduled campaigns whose time has come go out on the next read.
function sweep() {
  for (const c of campaigns.list()) {
    if (c.status === "scheduled" && c.sendAt && Date.parse(c.sendAt) <= Date.now()) {
      try { deliver(c); } catch { campaigns.update(c.id, { status: "draft", sendAt: null }); }
    }
  }
}

// Listing also sends any scheduled campaign whose time has come, so scheduling works without a server job.
export function listCampaigns({ signal }: RequestOptions = {}) {
  return mockApi(() => {
    assertCan("newsletter", "view");
    sweep();
    return [...campaigns.list()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, 150, signal);
}

// Saving needs only a subject so a draft can be kept half done; four pieces at most.
export function saveCampaign(data: Partial<Campaign> & { id?: Id }) {
  return mockApi(() => {
    assertCan("newsletter", "edit");
    const now = new Date().toISOString();
    if (!data.subject?.trim()) throw new ApiError("Give it a subject line.", 422);
    if ((data.productIds?.length ?? 0) > 4) throw new ApiError("Pick up to four pieces.", 422);
    if (data.id) {
      find(data.id);
      return campaigns.update(data.id, { ...data, updatedAt: now })!;
    }
    const row = campaigns.create({
      subject: "", previewText: "", heading: "", body: "", productIds: [], cta: { label: "Shop now", target: {} },
      ...data, status: "draft", sendAt: null, sentAt: null, recipients: 0, createdAt: now, updatedAt: now,
    } as NewRow<Campaign>);
    logActivity({ module: "newsletter", action: "create", entityId: row.id, summary: `Drafted campaign "${row.subject}"` });
    return row;
  });
}

// The time must be in the future, and the campaign must be complete.
export function scheduleCampaign(id: Id, sendAt: string) {
  return mockApi(() => {
    assertCan("newsletter", "edit");
    const c = find(id);
    assertReady(c);
    if (!(Date.parse(sendAt) > Date.now())) throw new ApiError("Pick a time in the future.", 422);
    logActivity({ module: "newsletter", action: "update", entityId: id, summary: `Scheduled "${c.subject}"` });
    return campaigns.update(id, { status: "scheduled", sendAt, updatedAt: new Date().toISOString() })!;
  });
}

export function unscheduleCampaign(id: Id) {
  return mockApi(() => {
    assertCan("newsletter", "edit");
    find(id);
    return campaigns.update(id, { status: "draft", sendAt: null, updatedAt: new Date().toISOString() })!;
  });
}

// Send now: same checks as scheduling, then it is locked as sent.
export function sendCampaign(id: Id) {
  return mockApi(() => {
    assertCan("newsletter", "edit");
    const c = find(id);
    assertReady(c);
    const sent = deliver(c);
    logActivity({ module: "newsletter", action: "update", entityId: id, summary: `Sent "${c.subject}" to ${sent.recipients} subscribers` });
    return sent;
  });
}

// Drafts and scheduled campaigns can go; a sent one stays as the record of what was emailed.
export function removeCampaign(id: Id) {
  return mockApi(() => {
    assertCan("newsletter", "delete");
    const c = campaigns.get(id);
    if (c?.status === "sent") throw new ApiError("A sent campaign stays on record.", 409);
    campaigns.remove(id);
  });
}
