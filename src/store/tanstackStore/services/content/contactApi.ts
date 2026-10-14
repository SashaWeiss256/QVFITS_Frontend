/* Contact Service */
import { mockApi } from "../api/mock";

export interface ContactMessage {
  name: string;
  phone?: string;
  email?: string;
  message: string;
}

/**
 * Honest seam: nothing delivers a message until qvfits-api sends email. The
 * result says so, and the page offers WhatsApp and the phone number instead.
 */
export function sendMessage(_message: ContactMessage) {
  return mockApi(() => ({ delivered: false as const }), 400);
}
