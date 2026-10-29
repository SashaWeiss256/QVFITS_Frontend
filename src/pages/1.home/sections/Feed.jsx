/* Shop The Feed (from Quivogue renderFeed()) */
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

import Reveal from "@/components/motion/Reveal";

// On a data-saver or 2G connection only the poster loads, never the video.
const lite = () => {
  const conn = navigator.connection || {};
  return conn.saveData === true || /^(slow-)?2g$/.test(conn.effectiveType || "");
};

/**
 * The brand's own reels: muted, looping and inline so they autoplay on a
 * phone, each linking through to the piece. A reel plays only while it is
 * on screen.
 */
export default function Feed({ feed }) {
  const grid = useRef(null);
  // Shown only while the feed is switched on and has reels.
  const ok = Boolean(feed?.live && feed.items?.length);

  // Each reel plays while at least a quarter of it is on screen and pauses when it leaves.
  useEffect(() => {
    if (!ok || !grid.current || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.preload = "auto";
            en.target.play().catch(() => {});
          } else en.target.pause();
        }),
      { threshold: 0.25 },
    );
    grid.current.querySelectorAll("video").forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, [ok]);

  if (!ok) return null;
  // Decided once per render, since the connection rarely changes mid-visit.
  const saving = lite();

  return (
    <section className="section">
      <div className="wrap">
        {/* Heading */}
        <Reveal className="mb-10 max-w-xl">
          <p className="kicker">{feed.kicker}</p>
          <h2>{feed.title}</h2>
        </Reveal>

        {/* Reels: each a link to the piece or part of the shop it shows */}
        <div className="grid grid-cols-2 gap-[clamp(10px,1.4vw,20px)] lg:grid-cols-4" ref={grid}>
          {feed.items.map((it) => (
            <Link key={it.id} className="group block" to={it.href} aria-label={`${it.label}: shop it`}>
              {/* Reel */}
              <div className="relative aspect-[9/16] overflow-hidden bg-sand-100">
                {saving ? (
                  <img className="h-full w-full object-cover" src={`/photos/${it.id}.webp`} alt={it.label} loading="lazy" />
                ) : (
                  <video className="h-full w-full object-cover" poster={`/photos/${it.id}.webp`} muted loop playsInline preload="none" aria-label={it.label}>
                    <source src={`/photos/${it.id}.mp4`} type="video/mp4" />
                  </video>
                )}
                <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-cream/90 text-ink opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true">
                  <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
                </span>
              </div>
              {/* What it shows */}
              <span className="mt-3 block text-[0.9rem] text-ink-2 transition-colors group-hover:text-brand-600">{it.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
