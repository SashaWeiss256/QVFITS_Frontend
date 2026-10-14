/* Logo */
import { Link } from "react-router-dom";

// The supplied QV FITS lockup (public/logo). The horizontal mark is about
// 3.6 : 1, so 44px tall sits at about 159px wide.
export default function Logo({ height = 44 }) {
  return (
    <Link to="/" className="logo" aria-label="QV FITS home">
      <img src="/logo/qvfits-logo-horizontal.svg" alt="" width={Math.round(height * 3.6)} height={height} className="logo__img" decoding="async" />
    </Link>
  );
}
