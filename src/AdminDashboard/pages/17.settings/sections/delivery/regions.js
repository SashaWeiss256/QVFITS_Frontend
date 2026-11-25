/* Regions And Points: Helpers */

// Ids are made here so a new region or point can be reordered and edited before the area is saved.
const newId = (prefix) => `${prefix}-${globalThis.crypto?.randomUUID?.().slice(0, 8) ?? Date.now().toString(36)}`;
export const newRegion = () => ({ id: newId("rg"), name: "", fee: null, etaDays: "", active: true, points: [] });
export const newPoint = () => ({ id: newId("cp"), name: "", address: "", hours: "", mapUrl: "", phone: "", fee: null, etaDays: "", active: true });

/** What stops an area saving: unnamed regions or points, a point with no address. */
export function regionsProblem(regions = []) {
  for (const r of regions) {
    if (!r.name?.trim()) return "Every region needs a name.";
    for (const p of r.points ?? []) {
      if (!p.name?.trim()) return `A collection point in ${r.name} needs a name.`;
      if (!p.address?.trim()) return `${p.name} needs an address, so shoppers can find it.`;
    }
  }
  return "";
}
