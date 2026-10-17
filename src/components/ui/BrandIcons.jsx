/* Brand Icons */
import { Icon } from "@iconify/react";
import instagram from "@iconify-icons/simple-icons/instagram";
import tiktok from "@iconify-icons/simple-icons/tiktok";
import whatsapp from "@iconify-icons/simple-icons/whatsapp";

// The real brand marks, from the Simple Icons set through Iconify. Lucide ships
// no brand icons. The icon data is bundled (no request at run time), and each
// mark is sized and coloured like a Lucide icon (className, currentColor).
export const InstagramIcon = ({ className }) => <Icon icon={instagram} className={className} aria-hidden="true" />;
export const TikTokIcon = ({ className }) => <Icon icon={tiktok} className={className} aria-hidden="true" />;
export const WhatsAppIcon = ({ className }) => <Icon icon={whatsapp} className={className} aria-hidden="true" />;
