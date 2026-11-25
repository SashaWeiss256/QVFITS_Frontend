/* Kits */
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
 * A kit's pieces for the size dialog (useSizeChooser): every piece carries
 * the kit's id, so checkout charges the kit price while the whole set is in
 * the bag. The shopper picks each size; sold-out pieces are left out there.
 */
export const kitPieces = (kit, pieces) => pieces.map((product) => ({ product, kitId: kit.id }));
