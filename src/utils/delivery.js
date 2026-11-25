/* Delivery Zones */

/**
 * Fees by zone, as the checkout service works them out (services/settings/
 * shippingApi). The zones come with the shop settings, so any page that
 * reads settings can quote them. A preview only: the order is priced again
 * when it is placed.
 *
 * An area (Kampala) can hold regions (Central, Nakawa…), each with its own
 * delivery fee, and each region its own collection points. An area without
 * regions works exactly as before.
 */
export const zoneOf = (settings, id) => settings?.zones?.find((z) => z.id === id) ?? null;

/** The regions offered in an area (active ones), in the admin's order. */
export const regionsOf = (zone) => (zone?.regions ?? []).filter((r) => r.active !== false);
export const regionOf = (zone, id) => regionsOf(zone).find((r) => r.id === id) ?? null;
/** The collection points offered in a region. */
export const pointsOf = (region) => (region?.points ?? []).filter((p) => p.active !== false);
export const pointOf = (region, id) => pointsOf(region).find((p) => p.id === id) ?? null;

/** Every active point in an area, with the region it sits in. */
export const areaPoints = (zone) => regionsOf(zone).flatMap((r) => pointsOf(r).map((point) => ({ point, region: r })));

/**
 * Everything about where an order goes, from the ids a form or an order
 * holds: { region (area id), zoneRegion, fulfilment, collectionPoint }.
 * `collect` is true for a collection point, or a legacy "collected from the
 * showroom" area.
 */
export function deliveryChoice(settings, { region, zoneRegion, fulfilment, collectionPoint } = {}) {
  const zone = zoneOf(settings, region);
  const area = regionOf(zone, zoneRegion);
  const point = fulfilment === "collect" ? pointOf(area, collectionPoint) : null;
  const collect = Boolean(point) || Boolean(zone?.collect);
  return { zone, area, point, collect };
}

/** The fee for a choice before any free-delivery waiver; collections are never waived. */
function baseFee({ zone, area, point }) {
  if (point) return point.fee ?? 0;
  if (area) return area.fee ?? zone?.fee ?? 0;
  return zone?.fee ?? 0;
}

/**
 * What delivery costs. Takes a zone (as before) or a whole choice: a region's
 * own fee, else the area's; free at or over the area's (or the shop's)
 * free-delivery level. Collection points charge their own fee, never waived.
 */
export function zoneFee(zoneOrChoice, subtotal, settings) {
  const choice = zoneOrChoice && "zone" in zoneOrChoice ? zoneOrChoice : { zone: zoneOrChoice, area: null, point: null };
  if (!choice.zone) return 0;
  const fee = baseFee(choice);
  if (choice.point) return fee;
  return subtotal >= (choice.zone.freeOver ?? settings?.freeShippingOver ?? Infinity) ? 0 : fee;
}

/** "Kampala UGX 15,000 · Upcountry UGX 35,000": the zones that deliver. */
export function zonesLine(settings, money) {
  return (settings?.zones ?? []).filter((z) => !z.collect).map((z) => `${z.name} ${money(z.fee)}`).join(" · ");
}

/** When it arrives, in words: "1 to 2 days", or "Ready same day" for a collection. */
export function zoneEta(zoneOrChoice) {
  const choice = zoneOrChoice && "zone" in zoneOrChoice ? zoneOrChoice : { zone: zoneOrChoice, collect: zoneOrChoice?.collect };
  const days = choice.point?.etaDays || choice.area?.etaDays || choice.zone?.etaDays;
  if (!days) return "";
  if (/day/i.test(days)) return choice.collect ? `Ready ${days.toLowerCase()}` : days;
  return choice.collect ? `Ready in ${days} days` : `${days} days`;
}

/**
 * Where an order goes, in words, for orders, invoices and messages:
 * "Kampala · Nakawa", "Collect at Ntinda Complex (Kampala · Nakawa)". An
 * order's own snapshot of the point wins over today's settings.
 */
export function deliveryLabel(settings, order) {
  const { zone, area, point } = deliveryChoice(settings, order);
  const place = [zone?.name ?? order?.region, area?.name].filter(Boolean).join(" · ");
  const pointName = order?.collectionPointSnapshot?.name ?? point?.name;
  if (order?.fulfilment === "collect" && pointName) return `Collect at ${pointName}${place ? ` (${place})` : ""}`;
  return place;
}

/** The point an order is collected from: its snapshot, or today's point. */
export function orderPoint(settings, order) {
  if (order?.fulfilment !== "collect") return null;
  return order.collectionPointSnapshot ?? deliveryChoice(settings, order).point;
}
