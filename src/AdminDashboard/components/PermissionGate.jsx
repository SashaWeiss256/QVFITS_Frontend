/* Permission Gate */
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { firstAllowed } from "../lib/constants";

/**
 * Wraps each admin route: someone whose role cannot view the module sees a
 * plain panel, not the page, even if they type the address. The API refuses
 * the data as well; this only keeps the screen honest.
 */
export default function PermissionGate({ perm, children }) {
  const { can } = useAdminAuth();
  if (can(perm, "view")) return children;
  const home = firstAllowed(can);

  return (
    <div className="mx-auto mt-16 max-w-md rounded-r-lg bg-white p-8 text-center shadow-sh-1">
      <Lock className="mx-auto mb-3 h-6 w-6 text-brand-400" aria-hidden="true" />
      <h2 className="m-0 text-[1.4rem]">No access to this page</h2>
      <p className="mt-2 text-ink-3">Your role does not include it. Ask the owner if you need it.</p>
      {home && <Link className="btn btn--soft mt-5" to={home}>Go to your dashboard</Link>}
    </div>
  );
}
