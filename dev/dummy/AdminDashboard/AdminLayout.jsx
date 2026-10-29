/* Admin Shell */
import { Suspense, useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

import QueryErrorBoundary from "@/components/layout/QueryErrorBoundary";
import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { notify } from "@/store/tanstackStore/notices";
import { useOverview } from "@/store/tanstackStore/queries/admin";
import { useSeo } from "@/seo/useSeo";
import { useRoundedUi } from "@/utils/useRoundedUi";
import AdminHeader from "./components/header/AdminHeader";
import AdminSidebar from "./components/sidebar/AdminSidebar";
import { HeaderSlotContext } from "./lib/headerSlot";
import { activeNavItem } from "./lib/navMatch";
import { useIdleTimeout } from "./lib/useIdleTimeout";

const COLLAPSED_KEY = "qvfits:admin:sidebar:collapsed";

// Remember the sidebar preference across sessions; private windows may refuse storage.
function getStoredCollapsed() {
  try { return JSON.parse(localStorage.getItem(COLLAPSED_KEY) ?? "false"); }
  catch { return false; }
}

// The admin's own app: no storefront chrome, same Quivogue tokens and type.
export default function AdminLayout() {
  useRoundedUi();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(getStoredCollapsed);
  const [headerSlot, setHeaderSlot] = useState(null);
  const { signOut, can } = useAdminAuth();
  // Counts beside Orders (unpaid + return requests), Products (reviews to approve) and Messages.
  const { data: overview } = useOverview(30, can("overview"), 60_000);
  const badges = overview
    ? { orders: overview.pending + overview.inbox.returns, products: overview.inbox.reviews, messages: overview.inbox.messages }
    : {};
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const { pathname } = useLocation();
  // Orders waiting show in the tab title too, so a background tab still says so.
  const pending = overview?.pending ?? 0;
  useSeo({ title: pending ? `(${pending}) Admin` : "Admin", noindex: true });

  // A toast when the waiting count goes up between polls (gap O5).
  const seen = useRef(null);
  useEffect(() => {
    if (!overview) return;
    if (seen.current !== null && overview.pending > seen.current) {
      const n = overview.pending - seen.current;
      notify(n === 1 ? "A new order just came in." : `${n} new orders just came in.`, { tone: "success" });
    }
    seen.current = overview.pending;
  }, [overview]);

  // "Sales / Orders", plus New or Edit on a product's own page.
  const active = activeNavItem(pathname);
  const deeper = active && pathname !== active.to;
  const trail = [
    active?.group && { label: active.group },
    active && deeper && { label: active.label, to: active.to },
  ].filter(Boolean);
  const title = deeper ? (pathname.endsWith("/new") ? `New ${active.label.toLowerCase().replace(/s$/, "")}` : `Edit ${active.label.toLowerCase().replace(/s$/, "")}`) : active?.label ?? "Admin";
  const viewOnly = active && !active.readOnly && can(active.perm, "view") && !can(active.perm, "edit");

  // The main pane scrolls, not the window, so reset it on each module.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      try { localStorage.setItem(COLLAPSED_KEY, JSON.stringify(!v)); } catch { /* storage refused */ }
      return !v;
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  // A shared showroom computer: 30 minutes idle signs out, with 2 minutes' warning (gap D4).
  const { warning, extend } = useIdleTimeout({
    onIdle: async () => {
      await signOut();
      navigate("/admin/login?idle=1", { replace: true });
    },
  });

  // `relative`: screen-reader-only text is absolutely placed, and deep in a long page it would
  // otherwise escape the scroller and stretch the window, so it scrolled beside the sidebar.
  return (
    <div className="relative flex h-dvh overflow-hidden bg-cream">
      <AdminSidebar
        mobileOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        badges={badges}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        onSignOut={handleSignOut}
      />
      <main ref={mainRef} className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <AdminHeader title={title} trail={trail} onOpenMenu={() => setMenuOpen(true)} actionsRef={setHeaderSlot} />
        <div className="mx-auto w-full max-w-[1400px] min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {viewOnly && (
            <p className="m-0 mb-6 flex items-center gap-2.5 rounded-[14px] border border-brand-100 bg-brand-50 px-4 py-2.5 text-[.85rem] text-ink-2">
              <Eye className="h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
              <span><strong className="font-semibold text-ink">View only.</strong> Your role can look at {active.label} but not change it.</span>
            </p>
          )}
          {/* Each module is its own chunk; the shell stays put while one loads */}
          <QueryErrorBoundary resetKey={pathname}>
            <Suspense fallback={<PageLoader variant="admin" />}>
              <HeaderSlotContext.Provider value={headerSlot}>
                <Outlet />
              </HeaderSlotContext.Provider>
            </Suspense>
          </QueryErrorBoundary>
        </div>
      </main>
      {warning && (
        <div role="alertdialog" aria-live="assertive" aria-labelledby="idleTitle" className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-[18px] bg-white p-5 shadow-sh-2 ring-1 ring-line sm:inset-x-auto sm:right-6">
          <p id="idleTitle" className="m-0 font-semibold">Still there?</p>
          <p className="m-0 mt-1 text-sm text-ink-3">You'll be signed out in 2 minutes to keep the shop safe on a shared computer.</p>
          <div className="mt-4 flex gap-2">
            <button type="button" className="btn btn--primary min-h-10 px-4 text-sm" onClick={extend}>Stay signed in</button>
            <button type="button" className="btn btn--ghost min-h-10 px-4 text-sm" onClick={handleSignOut}>Sign out</button>
          </div>
        </div>
      )}
    </div>
  );
}
