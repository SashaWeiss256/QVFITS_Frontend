/* No Matches */
import { Link } from "react-router-dom";

import { askVee } from "@/components/assistant/askVee";
import { usePageCopy } from "@/store/tanstackStore/queries/site";

// Landing on ?sale=1 with nothing reduced is not a failed filter: the shopper
// came from a banner, so send them somewhere rather than nowhere.
export default function NoMatches({ sale, onClear }) {
  const { data: copy } = usePageCopy("shop");
  const c = copy?.noMatches;
  return (
    <div className="empty">
      <h2>{sale ? c?.saleTitle : c?.title}</h2>
      <p className="lede center mt-2">{sale ? c?.saleText : c?.text}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {sale ? <Link className="btn btn--primary" to="/shop">Shop everything</Link> : <button type="button" className="btn btn--soft" onClick={onClear}>Clear filters</button>}
        <button type="button" className={sale ? "btn btn--ghost" : "btn btn--primary"} onClick={() => askVee("Help me find something")}>Ask Vee</button>
      </div>
    </div>
  );
}
