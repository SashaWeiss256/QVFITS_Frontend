/* Contact Messages Service */
import { http } from "../api/client";
import type { Guard } from "../api/guard";
import { routes } from "../api/routes";
import type { RequestOptions } from "../api/types";
import { httpCrud } from "../store/httpCrud";
import type { ContactMessage } from "../types";

export type ContactInput = Pick<ContactMessage, "name" | "phone" | "email" | "topic" | "message"> & { guard?: Guard };

/**
 * The contact form lands in the admin's Messages inbox on the API, and the
 * shop is emailed about it. The page still offers WhatsApp and the phone
 * number for anything urgent.
 */
export function sendMessage(input: ContactInput) {
  return http.post<{ delivered: true }>(routes.site.contact, input);
}

/* Admin (realm: admin) */

export const messagesCrud = httpCrud<ContactMessage>(routes.adminSite.messages, { module: "messages", noun: "message", label: (m) => `from ${m.name}` });
export const listMessages = ({ signal }: RequestOptions = {}) => messagesCrud.list({ signal });
