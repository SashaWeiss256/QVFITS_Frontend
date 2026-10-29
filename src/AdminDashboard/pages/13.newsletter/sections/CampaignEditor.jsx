/* Campaign Editor */
import { useState } from "react";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { productsResource, useCollection, useRemoveCampaign, useSaveCampaign, useScheduleCampaign, useSendCampaign, useUnscheduleCampaign } from "@/store/tanstackStore/queries/admin";
import Drawer from "@/AdminDashboard/components/Drawer";
import LinkPicker from "@/AdminDashboard/components/LinkPicker";
import EmailPreview from "@/AdminDashboard/components/EmailPreview";
import ProductPicker from "@/AdminDashboard/components/ProductPicker";
import { Block, count } from "../parts";

/**
 * Write a campaign with a live preview of the email beside it. Every
 * action saves first, then schedules or sends. A sent campaign opens
 * read-only. Sending asks once more, naming how many it will reach.
 */
export default function CampaignEditor({ initial, confirmed, onClose }) {
  const [c, setC] = useState(initial);
  const [sendAt, setSendAt] = useState(initial.sendAt ? initial.sendAt.slice(0, 16) : "");
  const [confirming, setConfirming] = useState(false);
  const save = useSaveCampaign();
  const schedule = useScheduleCampaign();
  const unschedule = useUnscheduleCampaign();
  const send = useSendCampaign();
  const remove = useRemoveCampaign();
  const products = useCollection(productsResource).items.filter((p) => p.status === "active" && p.type !== "kit");
  const { can } = useAdminAuth();
  const locked = c.status === "sent" || !can("newsletter", "edit");
  const set = (patch) => setC((x) => ({ ...x, ...patch }));
  const busy = save.isPending || schedule.isPending || send.isPending || unschedule.isPending;

  // Save, then run the action on the saved copy.
  const run = async (action) => {
    const { status: _s, sentAt: _a, recipients: _r, createdAt: _c, updatedAt: _u, ...data } = c;
    const saved = await save.mutateAsync(data).catch(() => null);
    if (!saved) return;
    setC(saved);
    if (action) await action(saved).then((x) => x && setC(x)).catch(() => {});
  };

  const picked = c.productIds.map((id) => products.find((p) => p.id === id)).filter(Boolean);

  return (
    <Drawer
      open
      wide
      onClose={onClose}
      title={c.id ? c.subject || "Campaign" : "New campaign"}
      subtitle={c.status === "sent" ? `Sent to ${c.recipients} subscribers` : c.status === "scheduled" ? "Scheduled" : "Draft"}
      footer={
        !locked && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {c.id && c.status === "draft" && <Button variant="ghost" className="mr-auto text-warn" onClick={() => remove.mutateAsync(c.id).then(onClose)}>Delete</Button>}
            {c.status === "scheduled" && <Button variant="ghost" onClick={() => run((x) => unschedule.mutateAsync(x.id))} loading={busy}>Cancel schedule</Button>}
            <Button variant="ghost" onClick={() => run()} loading={save.isPending}>Save draft</Button>
            <Button variant="soft" disabled={!sendAt} onClick={() => run((x) => schedule.mutateAsync({ id: x.id, sendAt: new Date(sendAt).toISOString() }))} loading={schedule.isPending}>Schedule</Button>
            {confirming ? (
              <Button onClick={() => run((x) => send.mutateAsync(x.id)).then(() => setConfirming(false))} loading={send.isPending}>Send to {confirmed} now</Button>
            ) : (
              <Button onClick={() => setConfirming(true)} disabled={!confirmed}>Send now…</Button>
            )}
          </div>
        )
      }
    >
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* The form, in the order an email is written */}
        <fieldset disabled={locked} className="m-0 grid min-w-0 content-start gap-7 border-0 p-0">
          <Block title="In the inbox" hint="The two lines people read before they open it.">
            <Field label="Subject line" value={c.subject} onChange={(e) => set({ subject: e.target.value })} placeholder="The court range just landed" hint={count(c.subject, 60)} />
            <Field label="Preview text" value={c.previewText} onChange={(e) => set({ previewText: e.target.value })} hint={count(c.previewText, 110)} />
          </Block>
          <Block title="The message">
            <Field label="Heading" value={c.heading} onChange={(e) => set({ heading: e.target.value })} />
            <Field label="Message" as="textarea" rows={6} value={c.body} onChange={(e) => set({ body: e.target.value })} />
          </Block>
          <Block title="Pieces to show" hint="Up to four. Their photo, name and price appear in the email.">
            <Field label="Choose pieces">{() => <ProductPicker products={products} value={c.productIds} onChange={(productIds) => set({ productIds })} max={4} />}</Field>
          </Block>
          <Block title="The button">
            <Field label="Button text" value={c.cta.label} onChange={(e) => set({ cta: { ...c.cta, label: e.target.value } })} />
            <LinkPicker label="Button goes to" value={c.cta} onChange={(patch) => set({ cta: { ...c.cta, ...patch } })} />
          </Block>
          <Block title="Delivery" hint={`Goes to ${confirmed} confirmed ${confirmed === 1 ? "subscriber" : "subscribers"}.`}>
            <Field label="Send at (to schedule)" type="datetime-local" value={sendAt} onChange={(e) => setSendAt(e.target.value)} hint="Leave empty and use Send now to send straight away." />
            {confirming && <p role="alert" className="m-0 rounded-[14px] bg-brand-50 px-4 py-3 text-sm text-ink-2">This goes to {confirmed} confirmed subscribers and can't be unsent. Press Send again to go ahead.</p>}
          </Block>
        </fieldset>

        {/* The email as subscribers will see it, in view while the form scrolls */}
        <div className="lg:sticky lg:top-0">
          <p className="m-0 mb-3 text-[.7rem] font-semibold uppercase tracking-[0.16em] text-ink-4">Preview</p>
          <EmailPreview subject={c.subject} previewText={c.previewText} heading={c.heading} body={c.body} pieces={picked} button={c.cta.label || "Shop now"} />
        </div>
      </div>
    </Drawer>
  );
}
