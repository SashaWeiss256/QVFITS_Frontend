/* Customer Forgot Password */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useCustomerAuth } from "@/store/context/CustomerAuthContext";
import { demoEmailLink } from "@/store/tanstackStore/queries/site";
import { useSeo } from "@/seo/useSeo";
import AuthShell from "./AuthShell";
import { forgotSchema } from "./schemas";

// A reset link by email (gap A1). The answer is the same whether or not
// the address has an account. Until an email service is connected the email
// waits in the admin's outbox; a dev build shows its link here.
export default function CustomerForgotPassword() {
  useSeo({ title: "Reset your password", noindex: true });
  const { requestPasswordReset } = useCustomerAuth();
  const [result, setResult] = useState(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async ({ email }) => {
    const r = await requestPasswordReset(email);
    setResult({ ...r, demo: demoEmailLink(r.email, "password-reset") });
  };

  return (
    <AuthShell title="Reset your password" lede="Enter your email and we'll send you a link to choose a new one." footer={<Link to="/login" className="link-arrow">Back to sign in</Link>}>
      {result ? (
        <p role="status" className="m-0 text-ink-2">
          If there's an account for {result.email}, a reset link is on its way. It works for an hour.
          {result.demo && <> <Link to={result.demo} className="underline">Open the link (demo)</Link></>}
        </p>
      ) : (
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Email" type="email" autoComplete="email" input={register("email")} error={errors.email?.message} />
          <Button type="submit" block loading={isSubmitting}>Send reset link</Button>
        </form>
      )}
    </AuthShell>
  );
}
