/* Page Intro */
import { useSeo } from "@/seo/useSeo";
import { cn } from "@/utils/cn";

/**
 * A page's one h1 and its tab title: a small kicker, the title large in the
 * serif, and an optional lede, on generous space. Every page has exactly one
 * (the audit floor). Children sit underneath, inside the same wrap.
 */
export default function PageIntro({ kicker, title, lede, seoTitle, noindex, center = false, children }) {
  useSeo({ title: seoTitle ?? title, description: lede, noindex });
  return (
    <section className="wrap pb-12 pt-10 sm:pb-20 sm:pt-16 lg:pb-28 lg:pt-24">
      {/* Heading */}
      <header className={cn("mb-10 max-w-3xl sm:mb-14 lg:mb-20", center && "mx-auto sm:text-center")}>
        {kicker && <p className="kicker">{kicker}</p>}
        <h1 className="text-[clamp(2.375rem,5.2vw,4.375rem)]">{title}</h1>
        {lede && <p className={cn("mt-6 max-w-xl text-[1.08rem] leading-relaxed text-ink-2", center && "mx-auto")}>{lede}</p>}
      </header>
      {children}
    </section>
  );
}
