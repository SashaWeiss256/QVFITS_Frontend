/* Admin Invite */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "react-router-dom";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useSeo } from "@/seo/useSeo";
import AuthCard from "../../components/auth/AuthCard";
import { inviteSchema } from "./schemas";

// Where an invited team member chooses their own password (?token=…).
export default function AdminInvite() {
  useSeo({ title: "Join the team", noindex: true });
  const { acceptInvite } = useAdminAuth();
  const [params] = useSearchParams();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(inviteSchema) });

  const onSubmit = async ({ password }) => {
    setServerError("");
    try {
      await acceptInvite({ token: params.get("token") ?? "", password });
    } catch (e) {
      setServerError(e.message);
    }
  };

  return (
    <AuthCard title="Join the team" lede="Choose a password to finish setting up your account.">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Password" type="password" autoComplete="new-password" input={register("password")} error={errors.password?.message} />
        <Field label="Confirm password" type="password" autoComplete="new-password" input={register("confirm")} error={errors.confirm?.message} />
        {serverError && <p role="alert" className="m-0 text-sm font-semibold text-warn">{serverError}</p>}
        <Button type="submit" block loading={isSubmitting}>Set password</Button>
      </form>
    </AuthCard>
  );
}
