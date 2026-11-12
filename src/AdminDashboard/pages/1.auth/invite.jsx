/* Admin Invite */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { notify } from "@/store/tanstackStore/notices";
import { useSeo } from "@/seo/useSeo";
import AuthCard from "./AuthCard";
import { inviteSchema } from "./schemas";

// Where an invited team member chooses their own password (?token=…).
export default function AdminInvite() {
  useSeo({ title: "Join the team", noindex: true });
  const { admin, acceptInvite } = useAdminAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [joined, setJoined] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(inviteSchema) });

  const onSubmit = async ({ password }) => {
    setServerError("");
    try {
      // A missing token goes up empty; the server owns the "invalid invite" message.
      const member = await acceptInvite({ token: params.get("token") ?? "", password });
      setJoined(true);
      // Accepting signs the person in; take them into the dashboard and say so, so it is clear it worked.
      notify(`Welcome to the team, ${member.name.split(" ")[0]}. Your password is set.`, { tone: "success" });
      navigate("/admin", { replace: true });
    } catch (e) {
      setServerError(e.message);
    }
  };

  return (
    <AuthCard title="Join the team" lede="Choose a password to finish setting up your account.">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Someone already signed in on this tab (often the owner testing the link) is replaced by the invited person. Hidden once the form is sent, so the new person's own session never shows here. */}
        {admin && !isSubmitting && !joined && <p role="status" className="m-0 rounded-[14px] bg-brand-50 px-3 py-2 text-sm text-ink-2">You are signed in as {admin.name}. Setting this password signs you in as the invited person instead.</p>}
        <Field label="Password" type="password" autoComplete="new-password" input={register("password")} error={errors.password?.message} />
        <Field label="Confirm password" type="password" autoComplete="new-password" input={register("confirm")} error={errors.confirm?.message} />
        {serverError && <p role="alert" className="m-0 text-sm font-semibold text-warn">{serverError}</p>}
        <Button type="submit" block loading={isSubmitting}>Set password</Button>
      </form>
    </AuthCard>
  );
}
