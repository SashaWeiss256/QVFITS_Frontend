/* Auth Card */

// The full-screen frame for the staff door: the icon mark, one card.
export default function AuthCard({ title, lede, children }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-sand-50 px-4 py-12">
      <section className="w-full max-w-sm rounded-r-xl bg-white p-8 shadow-sh-3">
        <img src="/logo/qvfits-icon.svg" alt="" width="52" height="31" className="mb-6 h-auto w-13" />
        <p className="kicker">QVFITS admin</p>
        <h1 className="text-[1.8rem]">{title}</h1>
        {lede && <p className="mt-2 text-ink-3">{lede}</p>}
        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}
