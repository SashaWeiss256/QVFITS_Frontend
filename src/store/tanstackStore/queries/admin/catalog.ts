/* Admin Catalog Resources */
import { createProduct, listAllProducts, removeProduct, updateProduct } from "../../services/catalog/productsApi";
import type { Id, Product } from "../../services/types";
import type { NewRow } from "../../services/store/collectionStore";
import { siteRoot } from "../keys";
import { collectionQueries, type CollectionResource } from "./collection";

export const productQueries = collectionQueries<Product>("products", listAllProducts, { label: "products" });

export const productsResource: CollectionResource<Product, NewRow<Product>, Partial<Product>> = {
  queries: productQueries,
  create: createProduct,
  update: (id: Id, data: Partial<Product>) => updateProduct(id, data),
  remove: removeProduct,
  // A price or stock change shows on the storefront at once.
  alsoInvalidates: [[...siteRoot, "catalog"]],
  noun: "Product",
};
