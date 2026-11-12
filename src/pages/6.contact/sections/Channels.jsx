/* Ways To Reach Us */
import { ArrowUpRight } from "lucide-react";

import { useSettings } from "@/store/tanstackStore/queries/site";
import { whatsappLink } from "@/utils/whatsapp";

/**
 * Every real way to reach a person, as one list of large rows: the channel
 * in the serif, a short note, and the number or handle at the end. Only the
 * channels the shop actually has (from Settings) are shown.
 */
export default function Channels() {
  const { data: s } = useSettings();
  if (!s) return null;

  const rows = [
    s.whatsapp && { name: "WhatsApp", note: "The quickest way to reach us, for orders, fit and styling.", value: s.phone, href: whatsappLink(s.whatsapp, "Hi QVFITS, ") },
    s.phone && { name: "Call", note: "Speak to the showroom team.", value: s.phone, href: `tel:${s.phone.replace(/\s/g, "")}` },
    s.email && { name: "Email", note: "For anything that needs photos or detail.", value: s.email, href: `mailto:${s.email}` },
    s.instagram && { name: "Instagram", note: "New pieces first, and messages too.", value: s.instagramHandle, href: s.instagram },
    s.tiktok && { name: "TikTok", note: "The pieces, in motion.", value: s.tiktokHandle, href: s.tiktok },
  ].filter(Boolean);

  return (
    <ul className="border-t border-ink">
      {rows.map((r) => {
        const external = r.href.startsWith("http");
        return (
          <li key={r.name} className="border-b border-line">
            <a
              href={r.href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group grid items-center gap-x-8 gap-y-1 py-7 sm:grid-cols-[minmax(0,1fr)_auto] lg:py-9"
            >
              {/* Channel */}
              <span className="flex flex-col gap-1 lg:flex-row lg:items-baseline lg:gap-10">
                <span className="w-56 shrink-0 font-display text-[clamp(1.8rem,3.4vw,3rem)] leading-none transition-colors group-hover:text-brand-600">{r.name}</span>
                <span className="text-[0.92rem] text-ink-3">{r.note}</span>
              </span>
              {/* Number or handle */}
              <span className="inline-flex items-center gap-2 text-[1rem] text-ink-2 group-hover:text-ink">
                {r.value}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-q group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden="true" />
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
