/* Draft Of A Saved Document */
import { useState } from "react";

/**
 * A local copy of something saved (settings, the home page, a product) to
 * edit before saving. `dirty` drives the save bar; `reset` throws the edits
 * away. When the saved copy changes underneath (another tab, a save), the
 * draft follows it unless there are unsaved edits.
 */
export function useDraft(saved) {
  const [state, setState] = useState({ base: saved, draft: saved });
  // Adopt a fresh saved copy while nothing is being edited.
  if (saved !== state.base && JSON.stringify(state.draft) === JSON.stringify(state.base)) {
    setState({ base: saved, draft: saved });
  }
  const { draft } = state;
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  return {
    draft,
    dirty,
    /** Replace the draft, or patch one top-level key: set("sale", {...}). */
    set: (keyOrValue, value) =>
      setState((s) => ({ ...s, draft: typeof keyOrValue === "string" ? { ...s.draft, [keyOrValue]: value } : keyOrValue })),
    reset: () => setState({ base: saved, draft: saved }),
    /** After a successful save, take what the server returned as the new base. */
    commit: (next) => setState({ base: next ?? draft, draft: next ?? draft }),
  };
}
