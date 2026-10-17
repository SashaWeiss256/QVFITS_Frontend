/* Delivery Zones */

/**
 * Fees by zone, as the checkout service works them out (services/settings/
 * shippingApi). The zones come with the shop settings, so any page that
 * reads settings can quote them. A preview only: the order is priced again
 * when it is placed.
 */
export const zoneOf = (settings, id) => settings?.zones?.find((z) => z.id === id) ?? null;

export function zoneFee(zone, subtotal, settings) {
  if (!zone) return 0;
  return subtotal >= (zone.freeOver ?? settings?.freeShippingOver ?? Infinity) ? 0 : zone.fee;
}

/** "Kampala UGX 15,000 · Upcountry UGX 35,000": the zones that deliver. */
export function zonesLine(settings, money) {
  return (settings?.zones ?? []).filter((z) => !z.collect).map((z) => `${z.name} ${money(z.fee)}`).join(" · ");
}

/** When it arrives, in words: "1 to 2 days", or "Ready same day" for a collection. */
export function zoneEta(zone) {
  if (!zone?.etaDays) return "";
  if (/day/i.test(zone.etaDays)) return zone.collect ? `Ready ${zone.etaDays.toLowerCase()}` : zone.etaDays;
  return `${zone.etaDays} days`;
}
