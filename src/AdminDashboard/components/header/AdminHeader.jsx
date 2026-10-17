/* Admin Header */
import { ArrowUpRight, Menu, Store } from "lucide-react";
import { Link } from "react-router-dom";

import { cn } from "@/utils/cn";

/**
 * Where you are and what you can do here. Left: the trail (Sales / Orders)
 * and the page's one h1. Right: View shop, then the page's main action,
 * which PageHeader renders into `actionsRef`.
 */
export default function AdminHeader({ title, trail = [], onOpenMenu, actionsRef }) {
  return (
    <header className="sticky top-0 z-[60] flex h-16 shrink-0 items-center gap-3 border-b border-line bg-cream/90 px-4 backdrop-blur-md sm:px-6 lg:px-10">
      <button type="button" className="icon-btn -ml-2 lg:hidden" aria-label="Open menu" onClick={onOpenMenu}>
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">
        {trail.length > 0 && (
          <nav aria-label="Breadcrumb" className="hidden sm:block">
            <ol className="m-0 flex list-none items-center gap-1.5 p-0 text-[.68rem] font-semibold uppercase tracking-[0.16em] text-ink-4">
              {trail.map((crumb, i) => (
                <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden="true" className="text-line-2">/</span>}
                  {crumb.to ? (
                    <Link to={crumb.to} className="transition-colors duration-200 hover:text-brand-600">{crumb.label}</Link>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="m-0 truncate font-display text-[1.25rem] leading-tight font-bold tracking-tight text-ink">{title}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* A new tab keeps the admin session and any unsaved work in place. */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View shop in a new tab"
          className={cn(
            "group inline-flex min-h-10 items-center gap-2 rounded-r-pill border border-line-2 bg-white px-3 text-[.84rem] font-semibold text-ink-2 outline-none sm:px-4",
            "transition-[border-color,color,box-shadow,transform] duration-200 ease-q hover:border-brand-200 hover:text-brand-600 hover:shadow-sh-1 active:scale-[0.98]",
            "focus-visible:ring-2 focus-visible:ring-brand-300",
          )}
        >
          <Store className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
          <span className="hidden md:inline">View shop</span>
          <ArrowUpRight className="hidden h-3.5 w-3.5 transition-transform duration-200 ease-q group-hover:-translate-y-px group-hover:translate-x-px md:block" aria-hidden="true" />
        </a>
        {/* A page's main action lands here (PageHeader). */}
        {/* Buttons here match View shop's height, whatever size the page asked for. */}
        <div ref={actionsRef} className="flex items-center gap-2 empty:hidden [&_.btn]:min-h-10 [&_.btn]:px-4 [&_.btn]:py-0 [&_.btn]:text-[.85rem]" />
      </div>
    </header>
  );
}
