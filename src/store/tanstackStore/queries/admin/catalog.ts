/* Admin Catalog Resources */
import { useMutation } from "@tanstack/react-query";

import {
  activitiesCrud,
  categoriesCrud,
  colorsCrud,
  getFilterConfig,
  listActivities,
  listCategories,
  listColors,
  listSizes,
  sizesCrud,
  updateFilterConfig,
} from "../../services/catalog/categoriesApi";
import { listAllLooks, looksCrud } from "../../services/catalog/collectionsApi";
import {
  bulkRemoveProducts,
  bulkUpdateProducts,
  createProduct,
  duplicateProduct,
  listAllProducts,
  reassignCategory,
  removeProduct,
  setVariantStock,
  updateProduct,
  type StockReason,
} from "../../services/catalog/productsApi";
import { reviewsCrud } from "../../services/catalog/reviewsApi";
import { getSizeChart, saveSizeChart } from "../../services/catalog/sizeChartApi";
import type { DocumentPatch, NewRow } from "../../services/store/collectionStore";
import type { FilterConfig, Id, Product, ProductRecord, SizeRow } from "../../services/types";
import { adminRoot, siteRoot } from "../keys";
import { collectionQueries, crudResource, documentQueries, type CollectionResource, type DocumentResource } from "./collection";

// Any catalogue write shows on the storefront at once.
const SITE = [siteRoot] as const;

// Unfiltered and unsorted, drafts included, unlike the storefront's listProducts.
export const productQueries = collectionQueries<Product>("products", listAllProducts, { label: "products" });

export const productsResource: CollectionResource<Product, NewRow<ProductRecord>, Partial<Product>> = {
  queries: productQueries,
  create: createProduct,
  update: (id: Id, data: Partial<Product>) => updateProduct(id, data),
  remove: removeProduct,
  alsoInvalidates: SITE,
  noun: "Product",
};

const productWrite = { invalidates: [productQueries.all(), ...SITE] };

export const useBulkUpdateProducts = () =>
  useMutation({ mutationFn: ({ ids, patch }: { ids: Id[]; patch: Partial<ProductRecord> }) => bulkUpdateProducts(ids, patch), meta: { ...productWrite, success: "Products updated" } });
export const useBulkRemoveProducts = () =>
  useMutation({ mutationFn: (ids: Id[]) => bulkRemoveProducts(ids), meta: { ...productWrite, success: "Products deleted" } });
export const useDuplicateProduct = () =>
  useMutation({ mutationFn: (id: Id) => duplicateProduct(id), meta: { ...productWrite, success: "Copy saved as a draft" } });
export const useReassignCategory = () =>
  useMutation({
    mutationFn: ({ from, to }: { from: Id; to: Id }) => reassignCategory(from, to),
    meta: { invalidates: [productQueries.all(), [...adminRoot, "categories"], ...SITE], success: "Products moved" },
  });
// Inventory edits one variant at a time; the overview's low-stock list follows.
export const useSetVariantStock = () =>
  useMutation({
    mutationFn: ({ productId, variantId, stock, reason }: { productId: Id; variantId: Id; stock: number; reason: StockReason }) =>
      setVariantStock(productId, variantId, stock, reason),
    meta: { invalidates: [productQueries.all(), [...adminRoot, "overview"], [...adminRoot, "activity"], ...SITE], success: "Stock saved" },
  });

export const categoriesResource = crudResource("categories", categoriesCrud, { noun: "Category", label: "categories", list: listCategories });
export const colorsResource = crudResource("colors", colorsCrud, { noun: "Colour", list: listColors });
export const sizesResource = crudResource("sizes", sizesCrud, { noun: "Size", list: listSizes });
export const activitiesResource = crudResource("activities", activitiesCrud, { noun: "Activity", label: "activities", list: listActivities });
export const looksResource = crudResource("looks", looksCrud, { noun: "Kit", list: listAllLooks });
export const reviewsResource = crudResource("reviews", reviewsCrud, { noun: "Review" });

export const filtersResource: DocumentResource<FilterConfig, DocumentPatch<FilterConfig>> = {
  queries: documentQueries("filters", getFilterConfig, "the shop filters"),
  update: updateFilterConfig,
  saved: "Shop filters saved",
  alsoInvalidates: SITE,
};

export const sizeChartResource: DocumentResource<SizeRow[], SizeRow[]> = {
  queries: documentQueries("size-chart", getSizeChart, "the size chart"),
  update: saveSizeChart,
  saved: "Size chart saved",
  alsoInvalidates: SITE,
};
