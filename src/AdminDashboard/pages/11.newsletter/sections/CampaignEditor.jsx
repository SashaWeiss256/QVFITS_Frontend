/* Campaign Editor */
import { useState } from "react";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Photo from "@/components/storefront/Photo";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useCurrency } from "@/store/context/CurrencyContext";
import { productsResource, useCollection, useRemoveCampaign, useSaveCampaign, useScheduleCampaign, useSendCampaign, useUnscheduleCampaign } from "@/store/tanstackStore/queries/admin";
import Drawer from "@/AdminDashboard/components/Drawer";
import LinkPicker from "@/AdminDashboard/components/LinkPicker";
import ProductPicker from "@/AdminDashboard/components/ProductPicker";

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
  const { moneyBase } = useCurrency();
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
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <fieldset disabled={locked} className="m-0 grid content-start gap-4 border-0 p-0">
          <Field label="Subject line" value={c.subject} onChange={(e) => set({ subject: e.target.value })} placeholder="The court range just landed" />
          <Field label="Preview text" value={c.previewText} onChange={(e) => set({ previewText: e.target.value })} hint="The line inboxes show after the subject." />
          <Field label="Heading" value={c.heading} onChange={(e) => set({ heading: e.target.value })} />
          <Field label="Message" as="textarea" rows={6} value={c.body} onChange={(e) => set({ body: e.target.value })} />
          <Field label="Pieces to show (up to 4)">{() => <ProductPicker products={products} value={c.productIds} onChange={(productIds) => set({ productIds })} max={4} />}</Field>
          <Field label="Button text" value={c.cta.label} onChange={(e) => set({ cta: { ...c.cta, label: e.target.value } })} />
          <LinkPicker label="Button goes to" value={c.cta} onChange={(patch) => set({ cta: { ...c.cta, ...patch } })} />
          <Field label="Send at (for scheduling)" type="datetime-local" value={sendAt} onChange={(e) => setSendAt(e.target.value)} hint="Leave empty and use Send now to send straight away." />
          {confirming && <p role="alert" className="m-0 rounded-r-md bg-brand-50 px-3 py-2 text-sm text-ink-2">This goes to {confirmed} confirmed subscribers and can't be unsent. Press Send again to go ahead.</p>}
        </fieldset>

        {/* The email as subscribers will see it. */}
        <div className="lg:sticky lg:top-0 lg:self-start">
          <p className="m-0 mb-2 text-[.7rem] font-semibold uppercase tracking-[0.16em] text-ink-4">Preview</p>
          <div className="overflow-hidden rounded-r-lg border border-line bg-white">
            <div className="border-b border-line bg-cream px-4 py-3 text-sm">
              <strong className="block">{c.subject || "Subject line"}</strong>
              <span className="text-ink-3">{c.previewText || "Preview text"}</span>
            </div>
            <div className="grid gap-4 p-5 text-center">
              <span className="font-display text-sm font-bold tracking-[0.2em] text-brand-600">QVFITS</span>
              <h3 className="m-0 font-display text-xl">{c.heading || "Your heading"}</h3>
              <p className="m-0 whitespace-pre-line text-sm text-ink-2">{c.body || "Your message."}</p>
              {picked.length > 0 && (
                <div className="grid grid-cols-2 gap-3 text-left">
                  {picked.map((p) => (
                    <div key={p.id}>
                      <div className="aspect-[3/4] overflow-hidden rounded-r-sm bg-cream-2">{p.photos[0] && <Photo photo={p.photos[0]} label={p.name} className="h-full w-full object-cover" />}</div>
                      <p className="m-0 mt-1 text-xs font-semibold">{p.name}</p>
                      <p className="m-0 text-xs text-ink-3">{moneyBase(p.price)}</p>
                    </div>
                  ))}
                </div>
              )}
              <span className="btn btn--primary mx-auto">{c.cta.label || "Shop now"}</span>
              <p className="m-0 text-[.7rem] text-ink-4">You're getting this because you joined the QVFITS newsletter. Unsubscribe.</p>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
