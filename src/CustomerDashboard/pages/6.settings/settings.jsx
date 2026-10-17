/* Account Settings */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useCustomerAuth } from "@/store/context/CustomerAuthContext";
import { useDeleteMyAccount, useDownloadMyData, useNewsletterStatus, useSetNewsletter } from "@/store/tanstackStore/queries/account";
import { demoEmailLink } from "@/store/tanstackStore/queries/site";

const card = "rounded-r-lg bg-white p-6 shadow-sh-1";

/**
 * The newsletter, the password, and the shopper's data: a copy to keep, or
 * closing the account (Uganda's Data Protection and Privacy Act 2019).
 * Orders stay with the shop for its books but no longer carry their name.
 */
export default function AccountSettings() {
  const { customer, requestPasswordReset } = useCustomerAuth();
  const navigate = useNavigate();
  const { data: status } = useNewsletterStatus(customer.id, customer.email);
  const setNewsletter = useSetNewsletter(customer.id);
  const download = useDownloadMyData(customer.id);
  const close = useDeleteMyAccount(customer.id);
  const [note, setNote] = useState(null);
  const [resetSent, setResetSent] = useState(null);
  const [confirmClose, setConfirmClose] = useState("");

  const toggleNewsletter = async () => {
    const result = await setNewsletter.mutateAsync({ email: customer.email, on: status !== "subscribed", name: customer.name }).catch((e) => setNote({ text: e.message }));
    if (result === "pending") setNote({ text: "Check your inbox and tap the link to confirm.", demo: demoEmailLink(customer.email, "newsletter-confirm") });
    else if (result) setNote({ text: result === "subscribed" ? "You're on the list." : "You won't get the newsletter any more. Order emails still arrive." });
  };

  const sendReset = async () => {
    await requestPasswordReset(customer.email);
    setResetSent({ demo: demoEmailLink(customer.email, "password-reset") });
  };

  const downloadData = async () => {
    const data = await download.mutateAsync();
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `qvfits-my-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const closeAccount = async () => {
    await close.mutateAsync();
    navigate("/", { replace: true });
  };

  return (
    <div className="grid gap-6">
      <section className={card}>
        <h2 className="text-[1.3rem]">Newsletter</h2>
        <p className="mt-2 text-ink-3">
          {status === "subscribed" ? "You get news of drops, restocks and offers." : status === "pending" ? "Waiting for you to confirm from the email we sent." : "You're not on the newsletter."}
        </p>
        <Button variant={status === "subscribed" ? "ghost" : "primary"} className="mt-4" loading={setNewsletter.isPending} onClick={toggleNewsletter}>
          {status === "subscribed" ? "Leave the newsletter" : status === "pending" ? "Send the link again" : "Join the newsletter"}
        </Button>
        {note && <p role="status" className="m-0 mt-3 text-sm text-ink-2">{note.text} {note.demo && <Link to={note.demo} className="underline">Open the link (demo)</Link>}</p>}
      </section>

      <section className={card}>
        <h2 className="text-[1.3rem]">Password</h2>
        <p className="mt-2 text-ink-3">We'll email {customer.email} a link to choose a new one.</p>
        <Button variant="ghost" className="mt-4" onClick={sendReset}>Email me a reset link</Button>
        {resetSent && <p role="status" className="m-0 mt-3 text-sm text-ink-2">Sent. It works for an hour. {resetSent.demo && <Link to={resetSent.demo} className="underline">Open the link (demo)</Link>}</p>}
      </section>

      <section className={card}>
        <h2 className="text-[1.3rem]">Your data</h2>
        <p className="mt-2 text-ink-3">A copy of everything we hold about you: your details, addresses, saved pieces, orders and newsletter consent.</p>
        <Button variant="ghost" className="mt-4" loading={download.isPending} onClick={downloadData}>Download my data</Button>

        <div className="mt-6 border-t border-line pt-5">
          <h3 className="m-0 text-base">Close my account</h3>
          <p className="mt-2 text-sm text-ink-3">Your sign-in, addresses, saved pieces and newsletter subscription are deleted. Orders stay with us for our books, without your name or contact details. This can't be undone.</p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <Field label='Type "CLOSE" to confirm' className="max-w-[220px]" value={confirmClose} onChange={(e) => setConfirmClose(e.target.value)} />
            <Button variant="danger" disabled={confirmClose.trim().toUpperCase() !== "CLOSE"} loading={close.isPending} onClick={closeAccount}>Close my account</Button>
          </div>
          {close.error && <p role="alert" className="m-0 mt-2 text-sm font-semibold text-warn">{close.error.message}</p>}
        </div>
      </section>
    </div>
  );
}
