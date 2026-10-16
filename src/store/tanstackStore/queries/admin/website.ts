/* Admin Website, Offers And Settings Documents */
import { useQuery } from "@tanstack/react-query";

import { listMessages, messagesCrud } from "../../services/content/contactApi";
import { getContentForEdit, updateContent, type HomeContent, type HomeContentView } from "../../services/content/contentApi";
import { faqCrud, listFaq } from "../../services/content/faqApi";
import { getNavigation, getPages, updateNavigation, updatePages, type Navigation, type PageCopy } from "../../services/content/pagesApi";
import { getSettings, updateSettings } from "../../services/content/settingsApi";
import { getOffers, updateOffers, type Offers } from "../../services/marketing/offersApi";
import { subscribersCrud } from "../../services/marketing/subscribersApi";
import { listAllPaymentMethods, paymentMethodsCrud } from "../../services/settings/paymentMethodsApi";
import { listAllShippingZones, shippingCrud } from "../../services/settings/shippingApi";
import type { DocumentPatch } from "../../services/store/collectionStore";
import type { ContactMessage, FaqItem, PaymentMethodOption, ShippingZone, ShopSettings, Subscriber } from "../../services/types";
import { siteRoot } from "../keys";
import { crudResource, documentQueries, type DocumentResource } from "./collection";

// Every one of these is read by the storefront too.
const SITE = [siteRoot] as const;

export const contentResource: DocumentResource<HomeContentView, DocumentPatch<HomeContent>> = {
  queries: documentQueries("content", getContentForEdit, "the home page content"),
  update: updateContent,
  saved: "Home page saved",
  alsoInvalidates: SITE,
};

export const offersResource: DocumentResource<Offers, DocumentPatch<Offers>> = {
  queries: documentQueries("offers", getOffers, "offers"),
  update: updateOffers,
  saved: "Offers saved",
  alsoInvalidates: SITE,
};

export const settingsResource: DocumentResource<ShopSettings, DocumentPatch<ShopSettings>> = {
  queries: documentQueries("settings", getSettings, "settings"),
  update: updateSettings,
  saved: "Settings saved",
  alsoInvalidates: SITE,
};

export const pagesResource: DocumentResource<PageCopy, DocumentPatch<PageCopy>> = {
  queries: documentQueries("pages", getPages, "the page copy"),
  update: updatePages,
  saved: "Page copy saved",
  alsoInvalidates: SITE,
};

export const navigationResource: DocumentResource<Navigation, DocumentPatch<Navigation>> = {
  queries: documentQueries("navigation", getNavigation, "the menus"),
  update: updateNavigation,
  saved: "Menus saved",
  alsoInvalidates: SITE,
};

export const faqResource = crudResource<FaqItem>("faq", faqCrud, { noun: "Question", list: listFaq });
export const messagesResource = crudResource<ContactMessage>("messages", messagesCrud, { noun: "Message", list: listMessages, alsoInvalidates: [] });
export const subscribersResource = crudResource<Subscriber>("subscribers", subscribersCrud, { noun: "Subscriber", alsoInvalidates: [] });
export const shippingResource = crudResource<ShippingZone>("shipping-zones", shippingCrud, { noun: "Delivery zone", list: listAllShippingZones });
export const paymentMethodsResource = crudResource<PaymentMethodOption>("payment-methods", paymentMethodsCrud, { noun: "Payment method", list: listAllPaymentMethods });

export const subscriberQueries = subscribersResource.queries;
export const useSubscribers = () => useQuery(subscriberQueries.list());
