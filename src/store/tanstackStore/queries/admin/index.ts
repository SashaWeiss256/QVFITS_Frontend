/* Admin Queries */
// The admin dashboard's only door to data.
export { useCollection, useDocument, collectionQueries, documentQueries } from "./collection";
export type { CollectionResource, DocumentResource } from "./collection";
export { productQueries, productsResource } from "./catalog";
export {
  customerQueries,
  discountQueries,
  discountsResource,
  orderQueries,
  overviewQueries,
  useCustomers,
  useOrders,
  useOverview,
  useUpdateOrderStatus,
} from "./sales";
export { contentResource, offersResource, settingsResource, subscriberQueries, useSubscribers } from "./website";
export type { AdminUser, Customer, Discount, Order, OrderStatus, Product } from "../../services/types";
