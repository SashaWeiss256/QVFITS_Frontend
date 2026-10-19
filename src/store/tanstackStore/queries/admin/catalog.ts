/* Admin Catalog Resources */
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import {
  groupsCrud,
  categoriesCrud,
  colorsCrud,
  getFilterConfig,
  listGroups,
  listTerms,
  listCategories,
  listColors,
  listSizes,
  sizesCrud,
  termsCrud,
  updateFilterConfig,
} from "../../services/catalog/categoriesApi";
import {
  bulkRemoveProducts,
  bulkUpdateProducts,
  createProduct,
  duplicateProduct,
  getProductPreview,
  listAllProducts,
  reassignCategory,
  removeProduct,
  setVariantStock,
  updateProduct,
  uploadPhoto,
  type StockReason,
  listStockMovements,
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

// A product write refreshes the admin's lists and the shop (prices, labels and stock all show there).
const productWrite = { invalidates: [productQueries.all(), ...SITE] };

export const useBulkUpdateProducts = () =>
  useMutation({ mutationFn: ({ ids, patch }: { ids: Id[]; patch: Partial<ProductRecord> }) => bulkUpdateProducts(ids, patch), meta: { ...productWrite, success: "Products updated" } });
export const useBulkRemoveProducts = () =>
  useMutation({ mutationFn: (ids: Id[]) => bulkRemoveProducts(ids), meta: { ...productWrite, success: "Products deleted" } });
export const useDuplicateProduct = () =>
  useMutation({ mutationFn: (id: Id) => duplicateProduct(id), meta: { ...productWrite, success: "Copy saved as a draft" } });
// Moving products to another category also refreshes the categories, since their counts change.
export const useReassignCategory = () =>
  useMutation({
    mutationFn: ({ from, to }: { from: Id; to: Id }) => reassignCategory(from, to),
    meta: { invalidates: [productQueries.all(), [...adminRoot, "categories"], ...SITE], success: "Products moved" },
  });
// Inventory edits one variant at a time; the overview's low-stock list follows.
// The stock log: every change to a size, from staff, orders, cancellations and returns.
export const stockMovementKey = [...adminRoot, "stock-movements"] as const;
// A draft on the shop's own product page, for staff (product page ?preview).
export const useProductPreview = (slug: string | undefined, enabled: boolean) =>
  useQuery({ queryKey: [...adminRoot, "products", "preview", slug], queryFn: ({ signal }) => getProductPreview(slug!, { signal }), enabled: enabled && Boolean(slug), retry: false });
export const useStockMovements = () =>
  useQuery(queryOptions({ queryKey: stockMovementKey, queryFn: ({ signal }) => listStockMovements({ signal }), meta: { label: "the stock log" } }));

// A stock edit refreshes the stock log, the Overview's low-stock list and the activity log as well as the products.
export const useSetVariantStock = () =>
  useMutation({
    mutationFn: ({ productId, variantId, stock, reason }: { productId: Id; variantId: Id; stock: number; reason: StockReason }) =>
      setVariantStock(productId, variantId, stock, reason),
    meta: { invalidates: [productQueries.all(), stockMovementKey, [...adminRoot, "overview"], [...adminRoot, "activity"], ...SITE], success: "Stock saved" },
  });

// A photo goes to ImageKit through the API; the caller keeps the Photo it returns in its own draft.
export const useUploadPhoto = () =>
  useMutation({
    mutationFn: ({ file, folder }: { file: Blob; folder: "products" | "categories" }) => uploadPhoto(file, folder),
    meta: { handlesErrors: true },
  });

export const categoriesResource = crudResource("categories", categoriesCrud, { noun: "Category", label: "categories", list: listCategories });
export const colorsResource = crudResource("colors", colorsCrud, { noun: "Colour", list: listColors });
export const sizesResource = crudResource("sizes", sizesCrud, { noun: "Size", list: listSizes });
export const groupsResource = crudResource("shop-groups", groupsCrud, { noun: "Group", label: "groups", list: listGroups });
export const termsResource = crudResource("terms", termsCrud, { noun: "Item", label: "items", list: listTerms });
export const reviewsResource = crudResource("reviews", reviewsCrud, { noun: "Review" });

export const filtersResource: DocumentResource<FilterConfig, DocumentPatch<FilterConfig>> = {
  queries: documentQueries("filters", getFilterConfig, "the shop filters"),
  update: updateFilterConfig,
  saved: "Filter and sort saved",
  alsoInvalidates: SITE,
};

export const sizeChartResource: DocumentResource<SizeRow[], SizeRow[]> = {
  queries: documentQueries("size-chart", getSizeChart, "the size chart"),
  update: saveSizeChart,
  saved: "Size chart saved",
  alsoInvalidates: SITE,
};
