/* Printable Invoice */

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/**
 * Opens an invoice or packing slip in a new window and starts printing.
 * A packing slip leaves the prices off, for the parcel.
 */
export function printOrder(order, { settings, moneyBase, zoneName, slip = false }) {
  const rows = order.lines
    .map((l) => `<tr><td>${esc(l.name)}<br><small>${esc(l.color)}, ${esc(l.size)}</small></td><td class="n">${l.qty}</td>${slip ? "" : `<td class="n">${moneyBase(l.price * l.qty)}</td>`}</tr>`)
    .join("");
  const totals = slip
    ? ""
    : `<tr><td colspan="2">Subtotal</td><td class="n">${moneyBase(order.subtotal)}</td></tr>
       ${order.discount ? `<tr><td colspan="2">Discount${order.discountCode ? ` (${esc(order.discountCode)})` : ""}</td><td class="n">-${moneyBase(order.discount)}</td></tr>` : ""}
       <tr><td colspan="2">Delivery</td><td class="n">${order.delivery ? moneyBase(order.delivery) : "Free"}</td></tr>
       <tr class="t"><td colspan="2">Total</td><td class="n">${moneyBase(order.total)}</td></tr>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${slip ? "Packing slip" : "Invoice"} ${esc(order.ref)}</title>
    <style>body{font:14px/1.5 system-ui,sans-serif;color:#17211f;margin:40px}h1{font-size:22px;margin:0 0 4px}table{width:100%;border-collapse:collapse;margin-top:24px}
    td{padding:8px 0;border-bottom:1px solid #e9e2d7;vertical-align:top}.n{text-align:right}.t td{font-weight:700;border-bottom:0}small{color:#57615e}
    .head{display:flex;justify-content:space-between;gap:24px}.muted{color:#57615e}</style></head><body>
    <div class="head"><div><img src="/logo/qvfits-logo.svg" alt="QVFITS by Quivogue" height="56"><p class="muted">${esc(settings?.address)}<br>${esc(settings?.phone)} · ${esc(settings?.email)}</p></div>
    <div><h1>${slip ? "Packing slip" : "Invoice"}</h1><p>${esc(order.ref)}<br>${new Date(order.createdAt).toLocaleDateString("en-UG")}</p></div></div>
    <p><strong>${esc(order.name)}</strong><br>${esc(order.phone)}${order.email ? `<br>${esc(order.email)}` : ""}<br>${esc(zoneName)}${order.address ? `: ${esc(order.address)}` : ""}</p>
    <table><thead><tr><td><strong>Item</strong></td><td class="n"><strong>Qty</strong></td>${slip ? "" : '<td class="n"><strong>Amount</strong></td>'}</tr></thead><tbody>${rows}${totals}</tbody></table>
    ${order.note ? `<p class="muted">Note: ${esc(order.note)}</p>` : ""}
    <script>window.onload=()=>window.print()</script></body></html>`;
  const w = window.open("", "_blank", "noopener,width=800,height=900");
  if (!w) return false;
  w.document.write(html);
  w.document.close();
  return true;
}
