/* Mobile Menu Account */
import { Link } from "react-router-dom";
import { ChevronRight, Heart, PackageSearch } from "lucide-react";

import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { useSettings } from "@/store/tanstackStore/queries/site";
import { whatsappLink } from "@/utils/whatsapp";

import { useCart } from "@/store/context/CartContext";
import { useCustomerAuth } from "@/store/context/CustomerAuthContext";
import { useWishlist } from "@/store/context/WishlistContext";
import { t } from "@/i18n/translate";

/**
 * The account block of the phone menu, under the shop links. Signed in: the
 * shopper's initials and a way into their account. Signed out: the two ways
 * in. Under it, two quiet rows for what shoppers reach for most: saved pieces
 * (opens the saved drawer, with its count) and tracking an order.
 */
const ROW = "flex min-h-12 w-full items-center gap-4 border-b border-line text-[1rem] text-ink";

export default function MobileMenuAccount({ onNavigate }) {
  const { customer } = useCustomerAuth();
  const { openDrawer } = useCart();
  const { count } = useWishlist();
  const { data: shop } = useSettings();
  const initials = customer?.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="mt-8">
      {/* Signed in or out */}
      {customer ? (
        <Link to="/account" className="flex items-center gap-3.5 rounded-[18px] border border-line bg-white p-4 shadow-[0_1px_2px_rgb(23_33_31/0.05),0_6px_14px_rgb(23_33_31/0.06)]">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-600 text-[0.75rem] font-medium tracking-wider text-cream" aria-hidden="true">{initials}</span>
          <span className="min-w-0 flex-1">
            <b className="block truncate font-display text-[1.15rem] font-normal">{customer.name}</b>
            <span className="block truncate text-[0.82rem] text-ink-3">{t("Your account and orders")}</span>
          </span>
          <ChevronRight className="h-5 w-5 text-ink-3" strokeWidth={1.5} aria-hidden="true" />
        </Link>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          <Link to="/login" className="btn btn--primary">{t("Sign in")}</Link>
          <Link to="/signup" className="btn btn--ghost">{t("Create account")}</Link>
        </div>
      )}

      {/* Shortcuts: one quiet list, a hairline between rows, so labels never wrap */}
      <ul className="m-0 mt-4 list-none border-t border-line p-0">
        <li>
          <button type="button" className={ROW} onClick={() => { onNavigate(); openDrawer("wish"); }}>
            <Heart className="h-5 w-5 shrink-0 text-ink-3" strokeWidth={1.5} aria-hidden="true" />
            <span className="flex-1 text-left">{t("Saved pieces")}</span>
            {count > 0 && <b className="grid h-6 min-w-6 place-items-center rounded-full bg-brand-600 px-1.5 text-[0.72rem] font-medium text-cream">{count}</b>}
            <ChevronRight className="h-4 w-4 shrink-0 text-ink-4 rtl:rotate-180" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </li>
        <li>
          <Link to="/track-order" className={ROW}>
            <PackageSearch className="h-5 w-5 shrink-0 text-ink-3" strokeWidth={1.5} aria-hidden="true" />
            <span className="flex-1">{t("Track an order")}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-ink-4 rtl:rotate-180" strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </li>
        {shop?.whatsapp && (
          <li>
            <a className={ROW} href={whatsappLink(shop.whatsapp)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="h-5 w-5 shrink-0 text-whatsapp" />
              <span className="flex-1">{t("Chat with us on WhatsApp")}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-4 rtl:rotate-180" strokeWidth={1.5} aria-hidden="true" />
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}
