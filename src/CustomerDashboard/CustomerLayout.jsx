/* Customer Account Shell */
import { Suspense } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import PageLoader from "@/components/ui/PageLoader";
import { useCustomerAuth } from "@/store/context/CustomerAuthContext";
import { useLiveAccount } from "@/store/tanstackStore/queries/account";
import { useSeo } from "@/seo/useSeo";
import { useRoundedUi } from "@/utils/useRoundedUi";
import AccountMenu from "./components/AccountMenu";
import { cn } from "@/utils/cn";

// Renders inside the storefront chrome (SiteLayout), so the account looks
// like the shop: the menu on ©the left, the page on the right.
export default function CustomerLayout() {
  useRoundedUi();
  const { customer, signOut } = useCustomerAuth();
  const navigate = useNavigate();
  useSeo({ title: "Your account", noindex: true });
  // An order the shop moves (paid, packed, on its way) updates here without a reload.
  useLiveAccount(customer?.id);

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  // Initials for the avatar, and the month they joined for the card.
  const initials = customer.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const since = customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : null;

  return (
    <section className={cn('wrap', 'section--tight')}>
      <p className="kicker">Your account</p>
      <h1 className={cn('mb-8', 'text-[clamp(1.9rem,4vw,2.7rem)]')}>Hi, {customer.name.split(" ")[0]}</h1>
      <div className={cn('grid', 'grid-cols-1', 'items-start', 'gap-6', 'md:grid-cols-[270px_1fr]', 'md:gap-8')}>
        {/* Member card and menu: stays in view while the page on the right scrolls */}
        <aside className={cn('min-w-0', 'rounded-[22px]', 'border', 'border-line', 'bg-sand-100', 'p-4', 'md:sticky', 'md:top-28', 'md:p-5')}>
          <div className={cn('mb-4', 'flex', 'items-center', 'gap-3.5', 'border-b', 'border-line', 'pb-4')}>
            <span className={cn('grid', 'h-12', 'w-12', 'shrink-0', 'place-items-center', 'rounded-full', 'bg-[image:var(--brand-grad)]', 'font-display', 'text-base', 'font-bold', 'tracking-wide', 'text-white')} aria-hidden="true">{initials}</span>
            <div className="min-w-0">
              <p className={cn('m-0', 'truncate', 'font-display', 'text-[1.05rem]', 'font-bold', 'leading-tight')}>{customer.name}</p>
              <p className={cn('m-0', 'truncate', 'text-sm', 'text-ink-3')}>{customer.email}</p>
              {since && <p className={cn('m-0', 'mt-0.5', 'text-[.8rem]', 'text-ink-3')}>Member since {since}</p>}
            </div>
          </div>
          <AccountMenu onSignOut={handleSignOut} />
        </aside>

        {/* The page for the chosen menu item */}
        <div className="min-w-0">
          <Suspense fallback={<PageLoader variant="form" />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
