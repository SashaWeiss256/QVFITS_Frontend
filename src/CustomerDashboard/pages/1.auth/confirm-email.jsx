/* Customer Confirm Email */
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useCustomerAuth } from "@/store/context/CustomerAuthContext";
import { useSeo } from "@/seo/useSeo";
import AuthShell from "./AuthShell";

// Where the sign-up email's link lands: the address is confirmed (gap A2).
export default function CustomerConfirmEmail() {
  useSeo({ title: "Confirm your email", noindex: true });
  const [params] = useSearchParams();
  const { confirmEmail } = useCustomerAuth();
  const [state, setState] = useState({ status: "working" });
  const once = useRef(false);

  useEffect(() => {
    if (once.current) return;
    once.current = true;
    confirmEmail(params.get("token") ?? "").then(
      (c) => setState({ status: "done", email: c.email }),
      (e) => setState({ status: "failed", message: e.message }),
    );
  }, [params, confirmEmail]);

  return (
    <AuthShell title={state.status === "done" ? "Email confirmed" : state.status === "failed" ? "That link didn't work" : "One moment…"} footer={<Link to="/account" className="link-arrow">Your account</Link>}>
      <p role="status" className="m-0 text-ink-2">{state.status === "done" ? `${state.email} is confirmed. Thank you.` : state.message ?? ""}</p>
    </AuthShell>
  );
}
