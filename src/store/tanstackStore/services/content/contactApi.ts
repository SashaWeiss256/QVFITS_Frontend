/* Contact Messages Service */
import { ApiError, mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { adminCrud } from "../store/adminCrud";
import { createCollection } from "../store/collectionStore";
import type { ContactMessage } from "../types";
import messageSeed from "@/data/messages.json";

export type ContactInput = Pick<ContactMessage, "name" | "phone" | "email" | "topic" | "message">;

/**
 * The contact form lands in the admin's Messages inbox. Honest seam: no
 * email notification goes out until qvfits-api sends email, so the page
 * still offers WhatsApp and the phone number for anything urgent.
 */
const messages = createCollection<ContactMessage>("messages", messageSeed as ContactMessage[], { idPrefix: "msg" });

export function sendMessage(input: ContactInput) {
  return mockApi(() => {
    if (!input.message?.trim()) throw new ApiError("Write a message first.", 422);
    messages.create({ ...input, status: "new", createdAt: new Date().toISOString() });
    return { delivered: true as const };
  }, 400);
}

/* Admin (realm: admin) */

export const listMessages = ({ signal }: RequestOptions = {}) => mockApi(() => messages.list(), 150, signal);

export const messagesCrud = adminCrud(messages, {
  module: "messages",
  noun: "message",
  label: (m) => `from ${m.name}`,
});
