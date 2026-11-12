/* Brand Icons */
import { Icon } from "@iconify/react";
import instagram from "@iconify-icons/simple-icons/instagram";
import tiktok from "@iconify-icons/simple-icons/tiktok";
import whatsapp from "@iconify-icons/simple-icons/whatsapp";
import airtel from "@iconify-icons/simple-icons/airtel";
import visa from "@iconify-icons/simple-icons/visa";
import mastercard from "@iconify-icons/simple-icons/mastercard";

// The real brand marks, from the Simple Icons set through Iconify. Lucide ships
// no brand icons. The icon data is bundled (no request at run time), and each
// mark is sized and coloured like a Lucide icon (className, currentColor).
export const InstagramIcon = ({ className }) => <Icon icon={instagram} className={className} aria-hidden="true" />;
export const TikTokIcon = ({ className }) => <Icon icon={tiktok} className={className} aria-hidden="true" />;
export const WhatsAppIcon = ({ className }) => <Icon icon={whatsapp} className={className} aria-hidden="true" />;
export const AirtelIcon = ({ className }) => <Icon icon={airtel} className={className} aria-hidden="true" />;
export const VisaIcon = ({ className }) => <Icon icon={visa} className={className} aria-hidden="true" />;
export const MastercardIcon = ({ className }) => <Icon icon={mastercard} className={className} aria-hidden="true" />;
