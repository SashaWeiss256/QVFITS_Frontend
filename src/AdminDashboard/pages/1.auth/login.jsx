/* Admin Sign In */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useSeo } from "@/seo/useSeo";
import AuthCard from "../../components/auth/AuthCard";
import { adminLoginSchema } from "./schemas";

// The staff door, separate from the shoppers' /login so 2FA and a stricter
// rate limit can attach here on the API.
export default function AdminLogin() {
  useSeo({ title: "Admin sign in", noindex: true });
  const { admin, signIn } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const back = location.state?.from?.pathname ?? "/admin";
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(adminLoginSchema) });

  useEffect(() => {
    if (admin) navigate(back, { replace: true });
  }, [admin, back, navigate]);

  const onSubmit = async (values) => {
    setServerError("");
    try {
      await signIn(values);
    } catch (e) {
      setServerError(e.message);
    }
  };

  return (
    <AuthCard title="Sign in" lede="For the QV FITS team only.">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Email" type="email" autoComplete="username" input={register("email")} error={errors.email?.message} />
        <Field label="Password" type="password" autoComplete="current-password" input={register("password")} error={errors.password?.message} />
        {serverError && <p role="alert" className="m-0 text-sm font-semibold text-warn">{serverError}</p>}
        <Button type="submit" block loading={isSubmitting}>Sign in</Button>
      </form>
    </AuthCard>
  );
}
