/* Admin Setup */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, useNavigate } from "react-router-dom";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useAdminSetup } from "@/store/tanstackStore/queries/admin";
import { useSeo } from "@/seo/useSeo";
import AuthCard from "./AuthCard";
import { setupSchema } from "./schemas";

// The one-time registration: whoever sets up the shop first becomes its owner.
// Once an owner exists the server refuses this, and the page sends people to sign in.
export default function AdminSetup() {
  useSeo({ title: "Set up the admin", noindex: true });
  const { admin, setupOwner } = useAdminAuth();
  const setup = useAdminSetup();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(setupSchema) });

  // The new owner lands on the dashboard as soon as their session exists.
  useEffect(() => {
    if (admin) navigate("/admin", { replace: true });
  }, [admin, navigate]);

  const onSubmit = async ({ name, email, password }) => {
    setServerError("");
    try {
      await setupOwner({ name, email, password });
    } catch (e) {
      // Someone else finished setup first: there is nothing left to set up here.
      if (e.code === "SETUP_CLOSED") return navigate("/admin/login", { replace: true });
      setServerError(e.message);
    }
  };

  if (setup.isLoading) return <PageLoader variant="logo" className="min-h-dvh" />;
  // Closed, or the server couldn't say: the sign-in page is the safe place to be.
  if (!setup.data?.open && !admin) return <Navigate to="/admin/login" replace />;

  return (
    <AuthCard title="Set up the admin" lede="Create the owner account. This can only be done once; after that, the owner invites the rest of the team.">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Your name" autoComplete="name" input={register("name")} error={errors.name?.message} />
        <Field label="Email" type="email" autoComplete="username" input={register("email")} error={errors.email?.message} />
        <Field label="Password" type="password" autoComplete="new-password" input={register("password")} error={errors.password?.message} />
        <Field label="Confirm password" type="password" autoComplete="new-password" input={register("confirm")} error={errors.confirm?.message} />
        {serverError && <p role="alert" className="m-0 text-sm font-semibold text-warn">{serverError}</p>}
        <Button type="submit" block loading={isSubmitting}>Create owner account</Button>
      </form>
    </AuthCard>
  );
}
