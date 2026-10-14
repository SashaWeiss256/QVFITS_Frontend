/* Press Row */
import { useHomeContent } from "@/store/tanstackStore/queries/site";

// Shown only when switched on in the admin AND there is something real to
// list. Off by default, as on Quivogue: no borrowed press credits.
export default function Press() {
  const { data: content } = useHomeContent();
  const press = content?.press;
  if (!press?.live || !press.items?.length) return null;

  return (
    <section className="section section--tight">
      <div className="wrap">
        <div className="press">
          <h2 className="press__title">{press.title}</h2>
          <div className="press__row">
            {press.items.map((it) =>
              it.href ? (
                <a key={it.name} className="press__item" href={it.href} target="_blank" rel="noopener noreferrer"><span>{it.name}</span></a>
              ) : (
                <div key={it.name} className="press__item"><span>{it.name}</span></div>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
