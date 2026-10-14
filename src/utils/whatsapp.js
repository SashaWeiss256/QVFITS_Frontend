/* WhatsApp Links */

/** A wa.me link with the message filled in. `number` is digits only, e.g. 256758981959. */
export function whatsappLink(number, text = "") {
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
