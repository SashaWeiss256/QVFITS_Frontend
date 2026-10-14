/* Customer Account Shell */
import { Suspense } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import PageLoader from "@/components/ui/PageLoader";
import { useCustomerAuth } from "@/store/context/CustomerAuthContext";
import { useSeo } from "@/seo/useSeo";
import AccountMenu from "./components/AccountMenu";

// Renders inside the storefront chrome (SiteLayout), so the account looks
// like the shop: the menu on the left, the page on the right.
export default function CustomerLayout() {
  const { customer, signOut } = useCustomerAuth();
  const navigate = useNavigate();
  useSeo({ title: "Your account", noindex: true });

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <section className="wrap section--tight">
      <p className="kicker">Your account</p>
      <h1 className="mb-8 text-[clamp(1.9rem,4vw,2.7rem)]">Hi, {customer.name.split(" ")[0]}</h1>
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <AccountMenu onSignOut={handleSignOut} />
        <div className="min-w-0">
          <Suspense fallback={<PageLoader className="min-h-[30vh]" />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
