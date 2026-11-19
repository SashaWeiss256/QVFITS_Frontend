/* Reel Video */
import { useRef, useState } from "react";
import { Film, Trash2, Upload } from "lucide-react";

import { useUploadVideo } from "@/store/tanstackStore/queries/admin";

const TYPES = "video/mp4,video/webm,video/quicktime";
const MAX_MB = 30;

/**
 * A reel's clip: the shoot's own, an uploaded one, or none. A clip goes up
 * as it is (no resizing in the browser), so it should be short: under half a
 * minute and 30 MB. It plays muted and on a loop, so sound is not needed.
 */
export default function ReelVideo({ reel, update }) {
  const input = useRef(null);
  const upload = useUploadVideo();
  const [error, setError] = useState("");
  const own = reel.video === undefined && Boolean(reel.clip);

  const add = async (file) => {
    setError("");
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) return setError(`That clip is over ${MAX_MB} MB. Trim it to under half a minute and try again.`);
    try {
      const { url } = await upload.mutateAsync(file);
      update({ video: url, clip: url });
    } catch (err) {
      setError(err.message);
    } finally {
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-ink-2">Clip</p>
      <div className="flex flex-col overflow-hidden rounded-[18px] border border-line bg-white">
        <div className="relative grid aspect-[3/4] place-items-center bg-beige">
          {reel.clip ? (
            <video key={reel.clip} className="absolute inset-0 h-full w-full object-cover" src={reel.clip} muted loop playsInline autoPlay aria-label={`${reel.label || "Reel"} clip`} />
          ) : (
            <span className="grid justify-items-center gap-1.5 p-3 text-center text-xs text-ink-4">
              <Film className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
              No clip: the still shows
            </span>
          )}
          {own && <span className="absolute left-2 top-2 rounded-full bg-cream px-2.5 py-1 text-[.74rem] font-medium">From the shoot</span>}
        </div>
        <div className="flex items-center gap-1 p-1.5">
          <button type="button" className="btn btn--soft min-h-9 flex-1 px-3 text-[0.82rem]" disabled={upload.isPending} onClick={() => input.current?.click()}>
            <Upload className="h-4 w-4" aria-hidden="true" /> {upload.isPending ? "Uploading…" : reel.clip ? "Replace" : "Upload"}
          </button>
          {reel.clip && (
            <button type="button" className="icon-btn text-warn" aria-label="Remove clip" onClick={() => update({ video: null, clip: undefined })}>
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <input ref={input} type="file" accept={TYPES} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => add(e.target.files?.[0])} />
      <p className="mt-2 text-xs text-ink-4">MP4, under 30 seconds and {MAX_MB} MB.</p>
      {error && <p role="alert" className="mt-1 text-xs font-semibold text-warn">{error}</p>}
    </div>
  );
}
