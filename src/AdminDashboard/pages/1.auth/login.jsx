/* Admin Sign In */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useAdminSetup } from "@/store/tanstackStore/queries/admin";
import { useSeo } from "@/seo/useSeo";
import AuthCard from "./AuthCard";
import { adminLoginSchema } from "./schemas";

// The staff door, separate from the shoppers' /login so 2FA and a stricter
// rate limit can attach here on the API.
export default function AdminLogin() {
  useSeo({ title: "Admin sign in", noindex: true });
  const { admin, signIn } = useAdminAuth();
  const setup = useAdminSetup();
  const navigate = useNavigate();
  const location = useLocation();
  // RequireAdmin passes the page that bounced here; return there after sign in.
  const back = location.state?.from?.pathname ?? "/admin";
  const idle = new URLSearchParams(location.search).has("idle");
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(adminLoginSchema) });

  // Redirect on the session, not on submit, so an already signed-in admin skips the form too.
  useEffect(() => {
    if (admin) navigate(back, { replace: true });
  }, [admin, back, navigate]);

  // A shop with no owner yet has nobody to sign in as: send the first visitor to the one-time setup.
  useEffect(() => {
    if (setup.data?.open) navigate("/admin/setup", { replace: true });
  }, [setup.data?.open, navigate]);

  const onSubmit = async (values) => {
    setServerError("");
    try {
      await signIn(values);
    } catch (e) {
      setServerError(e.message);
    }
  };

  return (
    <AuthCard title="Sign in" lede="For the QVFITS team only.">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {idle && <p role="status" className="m-0 rounded-r-md bg-brand-50 px-3 py-2 text-sm text-ink-2">You were signed out after 30 minutes without activity.</p>}
        <Field label="Email" type="email" autoComplete="username" input={register("email")} error={errors.email?.message} />
        <Field label="Password" type="password" autoComplete="current-password" input={register("password")} error={errors.password?.message} />
        {serverError && <p role="alert" className="m-0 text-sm font-semibold text-warn">{serverError}</p>}
        <Button type="submit" block loading={isSubmitting}>Sign in</Button>
      </form>
    </AuthCard>
  );
}
