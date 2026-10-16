/* Admin Header */
import { ExternalLink, LogOut, Menu } from "lucide-react";

import { useAdminAuth } from "@/store/context/AdminAuthContext";

// The layout owns the drawer and sign-out flow; the header only raises them.
export default function AdminHeader({ onOpenMenu, onSignOut }) {
  const { admin } = useAdminAuth();

  return (
    <header className="sticky top-0 z-[60] flex items-center gap-3 border-b border-line bg-cream/90 px-4 py-3 backdrop-blur sm:px-6">
      {/* Menu Toggle: the sidebar is always visible from lg up. */}
      <button type="button" className="icon-btn lg:hidden" aria-label="Open menu" onClick={onOpenMenu}>
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>
      <div className="ml-auto flex items-center gap-2">
        {/* A new tab keeps the admin session and any unsaved work in place. */}
        <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn--ghost min-h-11 px-4 py-2 text-[.85rem]">
          View shop <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
        <span className="hidden text-sm text-ink-3 sm:inline">{admin?.name} · <span className="capitalize">{admin?.role}</span></span>
        <button type="button" className="icon-btn" aria-label="Sign out" onClick={onSignOut}>
          <LogOut className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
