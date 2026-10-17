/* Report Columns */

// The tabs, in order.
export const REPORTS = [
  { id: "sales", label: "Sales by month" },
  { id: "orders", label: "Orders" },
  { id: "products", label: "Products" },
  { id: "codes", label: "Discount codes" },
  { id: "customers", label: "Customers" },
  { id: "stock", label: "Stock" },
];

/**
 * Each report's columns as [key, header, kind]. The same list draws the
 * table and writes the CSV, so they never disagree. Kinds: money (UGX,
 * right aligned), num (right aligned), text, bool.
 */
export const COLUMNS = {
  sales: [["month", "Month", "text"], ["orders", "Orders", "num"], ["goods", "Goods", "money"], ["discount", "Discounts", "money"], ["delivery", "Delivery", "money"], ["total", "Total", "money"]],
  orders: [["ref", "Order", "text"], ["date", "Date", "text"], ["customer", "Customer", "text"], ["status", "Status", "text"], ["source", "From", "text"], ["payment", "Payment", "text"], ["pieces", "Pieces", "num"], ["code", "Code", "text"], ["discount", "Discount", "money"], ["total", "Total", "money"]],
  products: [["name", "Product", "text"], ["category", "Category", "text"], ["units", "Units sold", "num"], ["revenue", "Revenue", "money"]],
  codes: [["code", "Code", "text"], ["orders", "Orders", "num"], ["customers", "Customers", "num"], ["discount", "Discount given", "money"], ["revenue", "Revenue", "money"]],
  customers: [["name", "Customer", "text"], ["contact", "Email or phone", "text"], ["orders", "Orders", "num"], ["spent", "Spent", "money"], ["first", "First order", "text"], ["isNew", "New in period", "bool"]],
  stock: [["category", "Category", "text"], ["pieces", "Pieces", "num"], ["units", "Units", "num"], ["low", "Sizes low", "num"], ["out", "Sizes sold out", "num"], ["value", "Retail value", "money"]],
};
