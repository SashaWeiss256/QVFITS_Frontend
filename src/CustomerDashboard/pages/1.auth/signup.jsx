/* Customer Sign Up */
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
import { signupSchema } from "./schemas";

export default function CustomerSignup() {
  useSeo({ title: "Create an account", noindex: true });
  useRedirectIfSignedIn();
  // Where to land afterwards: a safe local ?next= or /account.
  const { signUp } = useCustomerAuth();
  const navigate = useNavigate();
  const next = useNextPath();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(signupSchema) });

  // When the form appeared: sent faster than a person could type, it's a bot (gap A4).
  const [startedAt] = useState(() => Date.now());
  const onSubmit = async ({ website, ...values }) => {
    setServerError("");
    try {
      await signUp({ ...values, guard: { hp: website, startedAt } });
      navigate(next, { replace: true });
    } catch (e) {
      setServerError(e.message);
    }
  };

  return (
    <AuthShell
      title="Create an account"
      lede="Track your orders, save pieces and check out faster. You can always order as a guest."
      // Carry ?next= across so switching between sign in and sign up keeps the destination.
      footer={<>Already have an account? <Link to={`/login?next=${encodeURIComponent(next)}`} className="link-arrow">Sign in</Link></>}
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Name" autoComplete="name" input={register("name")} error={errors.name?.message} />
        <Field label="Email" type="email" autoComplete="email" input={register("email")} error={errors.email?.message} />
        {/* Optional so an email is enough to start; checkout asks for a phone anyway. */}
        <Field label="Phone (optional)" type="tel" autoComplete="tel" placeholder="+256" input={register("phone")} error={errors.phone?.message} />
        <Field label="Password" type="password" autoComplete="new-password" input={register("password")} error={errors.password?.message} hint="At least 8 characters." />
        {/* Hidden from people; only bots fill it in. */}
        <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" {...register("website")} />
        {serverError && <p role="alert" className="m-0 text-sm font-semibold text-warn">{serverError}</p>}
        <Button type="submit" block loading={isSubmitting}>Create account</Button>
        <p className="m-0 text-xs text-ink-3">
          By creating an account you agree to our <Link to="/terms" className="underline">terms of sale</Link> and{" "}
          <Link to="/privacy" className="underline">privacy policy</Link>.
        </p>
      </form>
    </AuthShell>
  );
}
