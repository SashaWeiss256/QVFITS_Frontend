/* Footer Wordmark */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const WORDS = [
  { text: "Qui", note: "for quality" },
  { text: "vogue", note: "for fashionable" },
];
const NOTE = "mt-2 font-body text-[10px] font-semibold normal-case tracking-[0.14em] text-ink-3 [text-transform:uppercase] sm:mt-4 sm:text-[11.5px] sm:tracking-[0.2em] lg:mt-6";

/**
 * The name, large, with what it means. Each letter carries its own slice of the
 * brand gradient (sized to the whole wordmark and offset to where the letter
 * sits), so the colour stays one continuous sweep while letters move on their
 * own. When it scrolls into view the letters rise in one after another and the
 * two notes settle in; after that, on a mouse, the letters near the pointer
 * lift like keys under a hand. Reduced motion shows it still.
 */
export default function FooterWordmark() {
  const root = useRef(null);

  useGSAP(
    () => {
      const el = root.current;
      const chars = gsap.utils.toArray("[data-ch]", el);
      const notes = gsap.utils.toArray("[data-note]", el);

      // Give every letter the same gradient, shifted to where it sits.
      const align = () => {
        const w = el.scrollWidth;
        const h = el.offsetHeight;
        chars.forEach((c) => {
          c.style.backgroundSize = `${w}px ${h}px`;
          c.style.backgroundPosition = `${-c.offsetLeft}px ${-c.offsetTop}px`;
        });
      };
      align();
      document.fonts?.ready.then(align);
      const ro = new ResizeObserver(align);
      ro.observe(el);

      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let move;
      if (!still) {
        gsap.from(chars, {
          yPercent: 70,
          opacity: 0,
          rotate: 5,
          duration: 1.3,
          ease: "expo.out",
          stagger: 0.075,
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        });
        gsap.from(notes, { y: 14, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.15, delay: 0.5, scrollTrigger: { trigger: el, start: "top 92%", once: true } });

        // The lift under the pointer: a mouse only, never on touch.
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          const lift = chars.map((c) => gsap.quickTo(c, "y", { duration: 0.6, ease: "power3.out" }));
          move = (e) => {
            chars.forEach((c, i) => {
              const r = c.getBoundingClientRect();
              const d = Math.abs(e.clientX - (r.left + r.width / 2));
              lift[i](-Math.exp(-((d / (r.width * 1.3)) ** 2)) * r.height * 0.1);
            });
          };
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", () => lift.forEach((l) => l(0)));
        }
      }
      return () => {
        ro.disconnect();
        if (move) el.removeEventListener("pointermove", move);
      };
    },
    { scope: root },
  );

  return (
    // Sized to the container query so it scales smoothly edge-to-edge without overflowing on mobile.
    <div className="w-full overflow-hidden @container">
      <div ref={root} className="relative flex items-start gap-[0.12em] font-logo uppercase leading-[0.85]">
        {WORDS.map((w) => (
          <span key={w.text} className="flex flex-col">
            <span className="flex text-[clamp(4.5rem,19vw,19rem)] tracking-[0.04em] max-sm:text-[21cqw]">
              {[...w.text].map((ch, i) => (
                <span key={i} data-ch className="inline-block bg-brand-grad bg-clip-text text-transparent will-change-transform">{ch}</span>
              ))}
            </span>
            <span data-note className={NOTE}>{w.note}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
