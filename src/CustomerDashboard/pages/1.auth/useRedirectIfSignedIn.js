/* Redirect If Signed In */
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useCustomerAuth } from "@/store/context/CustomerAuthContext";

/** The page to land on after sign-in: ?next= if it is a local path, else /account. */
export function useNextPath() {
  const [params] = useSearchParams();
  const next = params.get("next");
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

// A shopper who is already signed in has no business on the sign-in pages.
export function useRedirectIfSignedIn() {
  const { customer, loading } = useCustomerAuth();
  const navigate = useNavigate();
  const next = useNextPath();

  useEffect(() => {
    if (!loading && customer) navigate(next, { replace: true });
  }, [customer, loading, navigate, next]);
}
