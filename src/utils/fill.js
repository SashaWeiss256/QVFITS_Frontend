/* Fill Copy Tokens */
import { zonesLine } from "./delivery";

/**
 * Page copy from the admin may carry {tokens}: "Free delivery over
 * {freeShipping}". This swaps each for a live value, and leaves a token it
 * has no value for as it is, so a typo shows up rather than vanishing.
 *
 *   fill(copy.lede, { opensAt: settings.opensAt })
 */
export function fill(text, values = {}) {
  return String(text ?? "").replace(/\{(\w+)\}/g, (token, key) => (values[key] === undefined || values[key] === null ? token : String(values[key])));
}

/** The values most copy needs, from the shop settings and the money formatter. */
export function shopTokens(settings, money) {
  if (!settings) return {};
  return {
    brand: settings.wordmark,
    address: settings.address,
    opensAt: settings.opensAt,
    phone: settings.phone,
    exchangeDays: settings.exchangeDays,
    freeShipping: money(settings.freeShippingOver),
    kampala: money(settings.zones?.find((z) => z.id === "kampala")?.fee ?? 0),
    upcountry: money(settings.zones?.find((z) => z.id === "upcountry")?.fee ?? 0),
    zones: zonesLine(settings, money),
    year: new Date().getFullYear(),
  };
}
