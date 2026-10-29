/* The Quivogue Story */

// The About page's words, kept in one place. Everything here is what the
// client has told us: the name's meaning (Qui for quality, Vogue for
// fashionable), the year on the logo, how the pieces are made, the small
// drops, the honest fit notes and the Kisementi showroom. Nothing is invented
// (no founder quotes, no figures). When the backend's Pages module grows
// fields for chapters, these can move there (docs/handoff.md).
export const STORY = {
  kicker: "Our story",
  title: "Quality, worn fashionably.",
  lede: "Quivogue (QVFITS) is a Kampala house of activewear, swim and lounge wear, made for women who want their training clothes to be as considered as everything else they wear.",

  // The opening statement, set large.
  statement:
    "The name is two promises in one word. Qui, for quality. Vogue, for fashionable. Every piece has to keep both.",

  chapters: [
    {
      id: "quality",
      title: "Qui, for quality",
      paras: [
        "Quality is the fabric, the knit and the stitch, and above all the fit. Every piece is worn and tested before it joins the range, which is why each one carries an honest fit note: runs small, cut relaxed, true to size.",
        "We would rather move you to a different piece than sell you the wrong size.",
      ],
      photo: 0,
    },
    {
      id: "vogue",
      title: "Vogue, for fashionable",
      paras: [
        "Fashionable means pieces you would wear past the studio door: to brunch after Pilates, on the court, by the pool, on the flight home.",
        "So we make in small drops per colourway. If you see it in the showroom, only a handful of people in Kampala will be wearing it.",
      ],
      photo: 2,
    },
    {
      id: "making",
      title: "Two ways of making",
      paras: [
        "Seamless pieces are knitted as one, with no side seams to rub, so they hug and move with you. Seam-fit pieces are cut and stitched from panels, so support, structure and mesh go exactly where they are needed.",
        "The construction is chosen for what each piece has to do, never for the season.",
      ],
      photo: 3,
    },
  ],

  // Where it all happens.
  home: {
    title: "At home in Kisementi",
    text: "Our showroom at THE CUBE is where the pieces are tried, styled and fitted. Tell us what you train in and we will have pieces waiting in your size.",
  },
};
