/* Find Us */
import { Clock, Mail, MapPin, Phone, Truck } from "lucide-react";

import { InstagramIcon, TikTokIcon } from "@/components/ui/BrandIcons";
import Reveal from "@/components/motion/Reveal";
import { useCurrency } from "@/store/context/CurrencyContext";
import { useSettings } from "@/store/tanstackStore/queries/site";
import { zonesLine } from "@/utils/delivery";

// Only the rows the shop actually has; no invented numbers.
export default function Details() {
  const { data: s } = useSettings();
  const { money } = useCurrency();
  if (!s) return null;

  // Optional rows (phone, email, TikTok) resolve to false when unset and are filtered out.

  const rows = [
    { icon: MapPin, label: "The shop", value: <>{s.address}{s.addressNote && <><br /><span className="text-ink-4">{s.addressNote}</span></>}</> },
    { icon: Clock, label: "Opening", value: `Opens ${s.opensAt}` },
    s.phone && { icon: Phone, label: "Phone", value: <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="text-brand-600">{s.phone}</a> },
    s.email && { icon: Mail, label: "Email", value: <a href={`mailto:${s.email}`} className="text-brand-600">{s.email}</a> },
    { icon: InstagramIcon, label: "Instagram", value: <a href={s.instagram} target="_blank" rel="noopener noreferrer" className="text-brand-600">{s.instagramHandle}</a> },
    { icon: Truck, label: "Delivery", value: <>{zonesLine(s, money)}<br /><span className="text-ink-4">Free over {money(s.freeShippingOver)}</span></> },
    s.tiktok && { icon: TikTokIcon, label: "TikTok", value: <a href={s.tiktok} target="_blank" rel="noopener noreferrer" className="text-brand-600">{s.tiktokHandle}</a> },
  ].filter(Boolean);

  return (
    <Reveal className="info-card">
      <h2 className="sub-h mb-2">Find us</h2>
      {rows.map(({ icon: Icon, label, value }) => (
        <div key={label} className="info-row">
          <span className="info-row__ic"><Icon className="h-[18px] w-[18px]" aria-hidden="true" /></span>
          <div><strong>{label}</strong><span>{value}</span></div>
        </div>
      ))}
      {/* Directions */}
      <a className="btn btn--primary btn--block mt-[18px]" href={s.mapsUrl} target="_blank" rel="noopener noreferrer">Open in Google Maps</a>
      <a className="btn btn--ghost btn--block mt-2.5" href={s.instagram} target="_blank" rel="noopener noreferrer">Message us on Instagram</a>
    </Reveal>
  );
}
