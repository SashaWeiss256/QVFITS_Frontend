/* Customer Auth Shell */
import { Link } from "react-router-dom";

/**
 * The full-screen frame for /login, /signup and /forgot-password: the logo,
 * one card on cream, and a way back to the shop.
 */
export default function AuthShell({ title, lede, children, footer }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-cream px-4 py-12">
      <Link to="/" aria-label="QV FITS home" className="mb-8">
        <img src="/logo/qvfits-logo-horizontal.svg" alt="" width="173" height="48" className="h-12 w-auto" />
      </Link>
      <section className="w-full max-w-md rounded-r-xl bg-white p-8 shadow-sh-2">
        <h1 className="text-[1.9rem]">{title}</h1>
        {lede && <p className="mt-2 text-ink-3">{lede}</p>}
        <div className="mt-6">{children}</div>
      </section>
      {footer && <div className="mt-6 text-sm text-ink-3">{footer}</div>}
      <Link to="/shop" className="link-arrow mt-4 text-sm">Back to the shop</Link>
    </main>
  );
}
