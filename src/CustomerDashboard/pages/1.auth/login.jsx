/* Customer Sign In */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useCustomerAuth } from "@/store/context/CustomerAuthContext";
import { useSeo } from "@/seo/useSeo";
import AuthShell from "./AuthShell";
import { useNextPath, useRedirectIfSignedIn } from "./useRedirectIfSignedIn";
import { loginSchema } from "./schemas";

export default function CustomerLogin() {
  useSeo({ title: "Sign in", noindex: true });
  useRedirectIfSignedIn();
  // Where to land afterwards: a safe local ?next= or /account.
  const { signIn } = useCustomerAuth();
  const navigate = useNavigate();
  const next = useNextPath();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values) => {
    setServerError("");
    try {
      await signIn(values);
      navigate(next, { replace: true });
    } catch (e) {
      setServerError(e.message);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      lede="Sign in to see your orders and saved pieces."
      // Carry ?next= across so switching between sign in and sign up keeps the destination.
      footer={<>New to QVFITS? <Link to={`/signup?next=${encodeURIComponent(next)}`} className="link-arrow">Create an account</Link></>}
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Email" type="email" autoComplete="email" input={register("email")} error={errors.email?.message} />
        <Field label="Password" type="password" autoComplete="current-password" input={register("password")} error={errors.password?.message} />
        <Link to="/forgot-password" className="self-end text-sm text-brand-600">Forgot your password?</Link>
        {serverError && <p role="alert" className="m-0 text-sm font-semibold text-warn">{serverError}</p>}
        <Button type="submit" block loading={isSubmitting}>Sign in</Button>
      </form>
    </AuthShell>
  );
}
