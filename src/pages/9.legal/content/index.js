/* Legal Documents */
import { delivery } from "./delivery";
import { privacy } from "./privacy";
import { returns } from "./returns";
import { terms } from "./terms";

// Each policy by its URL. `build(settings)` returns the document, so the
// shop's details and fees always match what the admin has set.
export const LEGAL_DOCS = [
  { path: "/privacy", label: "Privacy policy", build: privacy },
  { path: "/terms", label: "Terms of sale", build: terms },
  { path: "/returns", label: "Exchanges and returns", build: returns },
  { path: "/delivery", label: "Delivery", build: delivery },
];

export const legalDoc = (path) => LEGAL_DOCS.find((d) => d.path === path);
