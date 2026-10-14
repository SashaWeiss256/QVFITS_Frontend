/* Customer Forgot Password */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useCustomerAuth } from "@/store/context/CustomerAuthContext";
import { useSeo } from "@/seo/useSeo";
import AuthShell from "../../components/auth/AuthShell";
import { forgotSchema } from "./schemas";

// Honest seam: until the API sends email, the page says so and points to
// WhatsApp rather than claiming a link is on its way.
export default function CustomerForgotPassword() {
  useSeo({ title: "Reset your password", noindex: true });
  const { requestPasswordReset } = useCustomerAuth();
  const [result, setResult] = useState(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async ({ email }) => setResult(await requestPasswordReset(email));

  return (
    <AuthShell title="Reset your password" lede="Enter your email and we'll send you a link to choose a new one." footer={<Link to="/login" className="link-arrow">Back to sign in</Link>}>
      {result ? (
        <p role="status" className="m-0 text-ink-2">
          {result.sent ? "Check your inbox for the reset link." : "Password emails aren't switched on yet. Message us on WhatsApp and we'll reset it for you."}
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
