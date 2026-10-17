/* Kits */
import { notify } from "@/store/tanstackStore/notices";
import { firstAvailable } from "./stockLevel";

/**
 * A live kit as one item of the shop grid, beside the pieces: its own
 * price and photo, and the pieces it is made of so the filters can look
 * inside it (a kit is "Teal" when one of its pieces is). Pieces that have
 * left the shop are dropped.
 */
export function kitItem(look, products) {
  const pieces = look.items.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  return {
    kind: "kit",
    id: look.id,
    slug: look.slug,
    name: look.title,
    note: look.note,
    price: look.price,
    separate: look.separate,
    photos: look.photo ? [look.photo] : pieces[0]?.photos ?? [],
    pieces,
    colors: [...new Set(pieces.flatMap((p) => p.colors))],
    unitsSold: pieces.reduce((n, p) => n + (p.unitsSold ?? 0), 0),
    createdAt: pieces.reduce((latest, p) => (p.createdAt > latest ? p.createdAt : latest), ""),
  };
}

/**
 * Every piece of a kit into the bag, each in the first colour and size in
 * stock, and says so. The lines carry the kit's id, so checkout charges the
 * kit price while the whole set is in the bag.
 */
export function addKit(kit, pieces, add) {
  let added = 0;
  const skipped = [];
  for (const p of pieces) {
    const pick = firstAvailable(p);
    if (!pick) skipped.push(p.name);
    else {
      add({ productId: p.id, ...pick, qty: 1, kitId: kit.id });
      added++;
    }
  }
  if (added) notify(`${added} piece${added === 1 ? "" : "s"} added. Check sizes in your bag.`, { tone: "success" });
  // Name the first skipped piece; one notice is enough to send them to check.
  if (skipped.length) notify(`${skipped[0]} is sold out, so I left it out.`);
}
