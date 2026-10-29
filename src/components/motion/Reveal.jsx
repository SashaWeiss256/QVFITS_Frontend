/* Reveal */
import { m } from "motion/react";

import { revealItem } from "./revealVariants";

// The tags the site reveals, made into motion components once, up front.
const TAGS = {
  div: m.div,
  section: m.section,
  article: m.article,
  blockquote: m.blockquote,
  form: m.form,
  ul: m.ul,
  li: m.li,
  p: m.p,
};

/**
 * Fades its content in as it scrolls into view, once, with a slight lift. MotionConfig's
 * reducedMotion="user" turns the movement off for those who ask; the content
 * is never hidden for good.
 */
export default function Reveal({ as = "div", delay = 0, children, ...rest }) {
  const M = TAGS[as] ?? m.div;
  return (
    <M initial="hidden" whileInView="shown" viewport={{ once: true, margin: "0px 0px -10% 0px" }} variants={revealItem} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }} {...rest}>
      {children}
    </M>
  );
}

/**
 * A group whose children (RevealItem) arrive one after another: product
 * grids, menu columns, the movement tiles.
 */
export function RevealGroup({ as = "div", stagger = 0.07, children, ...rest }) {
  const M = TAGS[as] ?? m.div;
  return (
    <M initial="hidden" whileInView="shown" viewport={{ once: true, margin: "0px 0px -8% 0px" }} variants={{ hidden: {}, shown: { transition: { staggerChildren: stagger } } }} {...rest}>
      {children}
    </M>
  );
}

export function RevealItem({ as = "div", children, ...rest }) {
  const M = TAGS[as] ?? m.div;
  return (
    <M variants={revealItem} {...rest}>
      {children}
    </M>
  );
}
