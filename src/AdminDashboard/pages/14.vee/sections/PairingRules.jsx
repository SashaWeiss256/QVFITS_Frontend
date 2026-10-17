/* Vee Pairing Rules */
import { useState } from "react";
import { Check, Plus, X } from "lucide-react";

import Button from "@/components/ui/Button";
import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { colorsResource, colourHarmony, colourTone, settingsResource, useCollection, useDocument } from "@/store/tanstackStore/queries/admin";
import Panel from "@/AdminDashboard/components/Panel";
import SaveBar from "@/AdminDashboard/components/SaveBar";
import { useDraft } from "@/AdminDashboard/lib/useDraft";
import { cn } from "@/utils/cn";

export default function PairingRules() {
  const doc = useDocument(settingsResource);
  const colours = useCollection(colorsResource);
  if (!doc.data || colours.isLoading) return <PageLoader variant="form" />;
  return <Editor doc={doc} colours={colours.items} />;
}

// Two colours in a fixed order, so "A with B" and "B with A" are the same rule.
const sameRule = (a, b) => ([a[0], a[1]].sort().join("|") === [b[0], b[1]].sort().join("|"));

function Editor({ doc, colours }) {
  const { can } = useAdminAuth();
  const canEdit = can("vee", "edit");
  const saved = doc.data.assistant.pairing ?? { good: [], avoid: [] };
  const { draft, set, dirty, reset, commit } = useDraft(saved);
  const [a, setA] = useState(colours[0]?.id ?? "");
  const [b, setB] = useState(colours[1]?.id ?? "");
  const byId = (id) => colours.find((c) => c.id === id);

  // What the colour rules say about the two picked colours, with the team's rules applied, exactly as Vee would judge them.
  const verdict = a && b && byId(a) && byId(b) ? colourHarmony(colourTone(byId(a)), colourTone(byId(b)), draft) : null;

  // A rule moves to one list only: ruling "never" on a pair that was "always" replaces it.
  const addRule = (list) => {
    if (!a || !b || a === b) return;
    const other = list === "good" ? "avoid" : "good";
    set({ ...draft, [other]: draft[other].filter((r) => !sameRule(r, [a, b])), [list]: draft[list].some((r) => sameRule(r, [a, b])) ? draft[list] : [...draft[list], [a, b]] });
  };
  const remove = (list, rule) => set({ ...draft, [list]: draft[list].filter((r) => !sameRule(r, rule)) });

  const picker = (value, onChange, label) => (
    <label className="grid gap-1.5">
      <span className="text-sm font-semibold text-ink-2">{label}</span>
      <span className="flex items-center gap-2.5">
        <i className="sw h-9 w-9 shrink-0 ring-1 ring-line" style={{ background: byId(value)?.hex }} aria-hidden="true" />
        <select className="select min-w-0 flex-1" value={value} onChange={(e) => onChange(e.target.value)}>
          {colours.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </span>
    </label>
  );

  const list = (key, title, hint, tone) => (
    <div>
      <h3 className="m-0 text-[.95rem] font-bold">{title}</h3>
      <p className="m-0 mt-0.5 text-[.8rem] text-ink-4">{hint}</p>
      <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
        {draft[key].map((r) => (
          <li key={r.join("|")} className={cn("inline-flex items-center gap-2 rounded-r-pill border py-1.5 pl-3 pr-1.5 text-sm font-medium", tone)}>
            <i className="sw h-4 w-4 ring-1 ring-line" style={{ background: byId(r[0])?.hex }} aria-hidden="true" />
            {byId(r[0])?.name}
            <span className="text-ink-4">+</span>
            <i className="sw h-4 w-4 ring-1 ring-line" style={{ background: byId(r[1])?.hex }} aria-hidden="true" />
            {byId(r[1])?.name}
            {canEdit && <button type="button" className="icon-btn h-7 min-h-0 w-7" aria-label={`Remove this rule`} onClick={() => remove(key, r)}><X className="h-3.5 w-3.5" /></button>}
          </li>
        ))}
        {!draft[key].length && <li className="text-sm text-ink-4">None yet.</li>}
      </ul>
    </div>
  );

  return (
    <>
      <fieldset disabled={!canEdit} className="m-0 grid min-w-0 gap-6 border-0 p-0">
        {/* Try a pair: the same judgement Vee makes, plus buttons to overrule it */}
        <Panel title="Try a pair" hint="Vee checks every outfit with colour rules: neutrals go with anything, one loud colour at most, and colours that are nearly the same or fight each other are kept apart. Pick two colours to see her verdict, then overrule it if you disagree.">
          <div className="grid items-end gap-4 sm:grid-cols-2">
            {picker(a, setA, "First colour")}
            {picker(b, setB, "Second colour")}
          </div>
          {verdict && a !== b && (
            <div className={cn("mt-4 flex flex-wrap items-center justify-between gap-3 rounded-r-md px-4 py-3", verdict.ok ? "bg-[#e8f1ec]" : "bg-[#f8e9e9]")}>
              <p className="m-0 flex items-center gap-2 text-[.92rem]">
                {verdict.ok ? <Check className="h-4 w-4 text-ok" aria-hidden="true" /> : <X className="h-4 w-4 text-warn" aria-hidden="true" />}
                <strong>{verdict.ok ? "Works" : "Clashes"}</strong> <span className="text-ink-3">{verdict.reason}</span>
              </p>
              {canEdit && (
                <span className="flex gap-2">
                  <Button variant="ghost" className="h-10 min-h-0 px-4 text-[.82rem]" onClick={() => addRule("good")}><Plus className="h-4 w-4" aria-hidden="true" /> Always pair</Button>
                  <Button variant="ghost" className="h-10 min-h-0 px-4 text-[.82rem]" onClick={() => addRule("avoid")}><Plus className="h-4 w-4" aria-hidden="true" /> Never pair</Button>
                </span>
              )}
            </div>
          )}
          {a === b && <p className="m-0 mt-4 text-sm text-ink-4">Same colour head to toe always works. Pick two different colours to test.</p>}
        </Panel>

        {/* The team's rules: these win over the built-in ones */}
        <Panel title="Your rules" hint="They beat the built-in rules. Vee never shows a pair on the Never list, and prefers pairs on the Always list.">
          <div className="grid gap-6 md:grid-cols-2">
            {list("good", "Always pair", "Favourites you want her to suggest.", "border-[#bcd8c8] bg-[#f1f8f4]")}
            {list("avoid", "Never pair", "Combinations you never want shown.", "border-[#e8c3c3] bg-[#fbf2f2]")}
          </div>
        </Panel>
      </fieldset>
      {canEdit && <SaveBar dirty={dirty} saving={doc.isSaving} onReset={reset} onSave={async () => commit((await doc.save({ assistant: { ...doc.data.assistant, pairing: draft } })).assistant.pairing)} />}
    </>
  );
}
