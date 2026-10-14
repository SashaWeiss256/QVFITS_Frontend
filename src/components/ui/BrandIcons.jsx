/* Brand Icons */

// Instagram and TikTok marks from Quivogue's icon set; Lucide ships no brand
// icons. Sized and coloured like a Lucide icon (className, currentColor).
export function InstagramIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.8a4.3 4.3 0 0 1-1.1-2.8h-2.9v11.4a2.4 2.4 0 1 1-1.7-2.3V9.1a5.3 5.3 0 1 0 4.6 5.2V8.9a7 7 0 0 0 4 1.3V7.3a4.2 4.2 0 0 1-2.9-1.5z" />
    </svg>
  );
}
