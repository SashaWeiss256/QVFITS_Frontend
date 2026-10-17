/* Customer Reset Password */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router-dom";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useCustomerAuth } from "@/store/context/CustomerAuthContext";
import { useSeo } from "@/seo/useSeo";
import AuthShell from "./AuthShell";
import { resetSchema } from "./schemas";

// Where the reset email's link lands: choose a new password, then sign in.
export default function CustomerResetPassword() {
  useSeo({ title: "Choose a new password", noindex: true });
  const [params] = useSearchParams();
  const { resetPassword } = useCustomerAuth();
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(resetSchema) });

  const onSubmit = async ({ password }) => {
    setError("");
    try {
      await resetPassword(params.get("token") ?? "", password);
      setDone(true);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <AuthShell title="Choose a new password" lede="At least 8 characters." footer={<Link to="/login" className="link-arrow">Back to sign in</Link>}>
      {done ? (
        <p role="status" className="m-0 text-ink-2">Done. <Link to="/login" className="underline">Sign in</Link> with your new password.</p>
      ) : (
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="New password" type="password" autoComplete="new-password" input={register("password")} error={errors.password?.message} />
          <Field label="Type it again" type="password" autoComplete="new-password" input={register("confirm")} error={errors.confirm?.message} />
          {error && <p role="alert" className="m-0 text-sm font-semibold text-warn">{error} {error.includes("expired") && <Link to="/forgot-password" className="underline">Ask for a new link</Link>}</p>}
          <Button type="submit" block loading={isSubmitting}>Save password</Button>
        </form>
      )}
    </AuthShell>
  );
}
