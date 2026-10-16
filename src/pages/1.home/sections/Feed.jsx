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
  const ok = Boolean(feed?.live && feed.items?.length);

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
  const saving = lite();

  return (
    <section className="section section--tight">
      <div className="wrap">
        <Reveal className="section-head center">
          <span className="kicker">{feed.kicker}</span>
          <h2>{feed.title}</h2>
        </Reveal>
        <div className="grid-feed" ref={grid}>
          {feed.items.map((it) => (
            <Link key={it.id} className="feedtile" to={it.href} aria-label={`${it.label}: shop it`}>
              {saving ? (
                <img className="feedtile__media" src={`/photos/${it.id}.webp`} alt={it.label} loading="lazy" />
              ) : (
                <video className="feedtile__media" poster={`/photos/${it.id}.webp`} muted loop playsInline preload="none" aria-label={it.label}>
                  <source src={`/photos/${it.id}.mp4`} type="video/mp4" />
                </video>
              )}
              <span className="feedtile__shop" aria-hidden="true"><ShoppingBag className="h-5 w-5" /></span>
              <span className="feedtile__label">{it.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
