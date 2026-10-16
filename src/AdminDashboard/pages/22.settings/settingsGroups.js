/* Settings Groups */

// The settings document's fields, grouped the way the shop thinks of them.
// [heading, [[key, label, hint, wide, number]]]
export const GROUPS = {
  shop: [
    ["Brand", [["brand", "Shop name"], ["wordmark", "Wordmark", "As written in the logo"], ["tagline", "Tagline"], ["blurb", "One-line description", "Footer and search results", true]]],
    ["Showroom", [["address", "Address"], ["addressNote", "Address note", "e.g. Ground floor, shop G17"], ["opensAt", "Opens at"], ["mapsUrl", "Google Maps link"]]],
  ],
  contact: [
    ["Contact", [["phone", "Phone"], ["whatsapp", "WhatsApp number", "Digits only, with 256"], ["email", "Email"]]],
    ["Social", [["instagram", "Instagram link"], ["instagramHandle", "Instagram handle"], ["tiktok", "TikTok link"], ["tiktokHandle", "TikTok handle"]]],
  ],
  policies: [
    ["Stock and exchanges", [["lowStockAt", "Low stock at", "A size at or under this shows as low in Inventory and the Overview", false, true], ["exchangeDays", "Exchange window (days)", "Shoppers can ask for a return this long after delivery", false, true]]],
  ],
};
