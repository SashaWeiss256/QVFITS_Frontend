/* Site Content Queries */
import { queryOptions } from "@tanstack/react-query";

import { getContent } from "../../services/content/contentApi";
import { listFaq } from "../../services/content/faqApi";
import { getNavigation, getPages } from "../../services/content/pagesApi";
import { getSettings } from "../../services/content/settingsApi";
import { getOffers } from "../../services/marketing/offersApi";
import { listPaymentMethods } from "../../services/settings/paymentMethodsApi";
import { listShippingZones } from "../../services/settings/shippingApi";
import { siteRoot } from "../keys";

// Admin-edited content the storefront reads: settings, the home page, offers,
// the copy and menus of every page, the FAQ, and how a shopper can get and pay.
export const contentQueries = {
  all: () => [...siteRoot, "content"] as const,
  settings: () =>
    queryOptions({
      queryKey: [...contentQueries.all(), "settings"] as const,
      queryFn: ({ signal }) => getSettings({ signal }),
      meta: { label: "the shop details" },
    }),
  home: () =>
    queryOptions({
      queryKey: [...contentQueries.all(), "home"] as const,
      queryFn: ({ signal }) => getContent({ signal }),
      meta: { label: "the home page" },
    }),
  offers: () =>
    queryOptions({
      queryKey: [...contentQueries.all(), "offers"] as const,
      queryFn: ({ signal }) => getOffers({ signal }),
    }),
  pages: () =>
    queryOptions({ queryKey: [...contentQueries.all(), "pages"] as const, queryFn: ({ signal }) => getPages({ signal }) }),
  navigation: () =>
    queryOptions({ queryKey: [...contentQueries.all(), "navigation"] as const, queryFn: ({ signal }) => getNavigation({ signal }) }),
  faq: () =>
    queryOptions({ queryKey: [...contentQueries.all(), "faq"] as const, queryFn: ({ signal }) => listFaq({ signal }) }),
  shippingZones: () =>
    queryOptions({ queryKey: [...contentQueries.all(), "shipping-zones"] as const, queryFn: ({ signal }) => listShippingZones({ signal }) }),
  paymentMethods: () =>
    queryOptions({ queryKey: [...contentQueries.all(), "payment-methods"] as const, queryFn: ({ signal }) => listPaymentMethods({ signal }) }),
};
