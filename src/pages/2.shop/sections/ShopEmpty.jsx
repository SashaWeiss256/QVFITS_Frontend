/* Shop Empty State */
import { Link } from "react-router-dom";

import { askVee } from "@/components/assistant/askVee";

// Landing on ?sale=1 with nothing reduced is not a failed filter: the shopper
// came from a banner, so send them somewhere rather than nowhere.
export default function ShopEmpty({ sale, onClear }) {
  return (
    <div className="empty">
      <h2>{sale ? "The sale isn't running right now" : "Nothing matches that combination"}</h2>
      <p className="lede center mt-2">
        {sale
          ? "Nothing is reduced at the moment. The full range is still here, and Vee can point you at it."
          : "Try loosening a filter, or ask Vee and she'll find the closest thing on the rail."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {sale ? <Link className="btn btn--primary" to="/shop">Shop everything</Link> : <button type="button" className="btn btn--soft" onClick={onClear}>Clear filters</button>}
        <button type="button" className={sale ? "btn btn--ghost" : "btn btn--primary"} onClick={() => askVee("Help me find something")}>Ask Vee</button>
      </div>
    </div>
  );
}
