/* Admin Website, Offers And Settings Documents */
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import { listCampaigns, removeCampaign, saveCampaign, scheduleCampaign, sendCampaign, unscheduleCampaign } from "../../services/marketing/campaignsApi";
import { eraseSubscriber, getNewsletterSettings, listSubscribers, unsubscribeSubscriber, updateNewsletterSettings } from "../../services/marketing/subscribersApi";
import { listOutbox } from "../../services/notifications/outboxApi";

import { listMessages, messagesCrud } from "../../services/content/contactApi";
import { getContentForEdit, updateContent, type HomeContent, type HomeContentView } from "../../services/content/contentApi";
import { faqCrud, listFaq } from "../../services/content/faqApi";
import { getNavigationForEdit, getPages, updateNavigation, updatePages, type Navigation, type PageCopy } from "../../services/content/pagesApi";
import { getSettings, updateSettings } from "../../services/content/settingsApi";
import { getOffersForEdit, updateOffers, type Offers } from "../../services/marketing/offersApi";
import { listAllPaymentMethods, paymentMethodsCrud } from "../../services/settings/paymentMethodsApi";
import { listAllShippingZones, shippingCrud } from "../../services/settings/shippingApi";
import type { DocumentPatch } from "../../services/store/collectionStore";
import type { Campaign, ContactMessage, FaqItem, Id, NewsletterSettings, PaymentMethodOption, ShippingZone, ShopSettings, Subscriber } from "../../services/types";
import { adminRoot, siteRoot } from "../keys";
import { collectionQueries, crudResource, documentQueries, type DocumentResource } from "./collection";

// Every one of these is read by the storefront too.
const SITE = [siteRoot] as const;

export const contentResource: DocumentResource<HomeContentView, DocumentPatch<HomeContent>> = {
  queries: documentQueries("content", getContentForEdit, "the home page content"),
  update: updateContent,
  saved: "Home page saved",
  alsoInvalidates: SITE,
};

export const offersResource: DocumentResource<Offers, DocumentPatch<Offers>> = {
  queries: documentQueries("offers", getOffersForEdit, "offers"),
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
  queries: documentQueries("navigation", getNavigationForEdit, "the menus"),
  update: updateNavigation,
  saved: "Menus saved",
  alsoInvalidates: SITE,
};

export const faqResource = crudResource<FaqItem>("faq", faqCrud, { noun: "Question", list: listFaq });
export const messagesResource = crudResource<ContactMessage>("messages", messagesCrud, { noun: "Message", list: listMessages, alsoInvalidates: [] });
export const shippingResource = crudResource<ShippingZone>("shipping-zones", shippingCrud, { noun: "Delivery zone", list: listAllShippingZones });
export const paymentMethodsResource = crudResource<PaymentMethodOption>("payment-methods", paymentMethodsCrud, { noun: "Payment method", list: listAllPaymentMethods });

// The newsletter: the list (double opt-in), campaigns, its settings and the email outbox.
export const subscriberQueries = collectionQueries<Subscriber>("subscribers", listSubscribers, { label: "the newsletter list" });
export const useSubscribers = () => useQuery(subscriberQueries.list());
export const useUnsubscribeSubscriber = () =>
  useMutation({ mutationFn: (id: Id) => unsubscribeSubscriber(id), meta: { invalidates: [subscriberQueries.all()], success: "Unsubscribed" } });
export const useEraseSubscriber = () =>
  useMutation({ mutationFn: (id: Id) => eraseSubscriber(id), meta: { invalidates: [subscriberQueries.all()], success: "Erased" } });

export const campaignQueries = collectionQueries<Campaign>("campaigns", listCampaigns, { label: "campaigns" });
const outboxKey = [...adminRoot, "outbox"] as const;
const campaignWrite = { invalidates: [campaignQueries.all(), outboxKey] };
export const useCampaigns = () => useQuery(campaignQueries.list());
export const useSaveCampaign = () => useMutation({ mutationFn: saveCampaign, meta: { ...campaignWrite, success: "Draft saved" } });
export const useScheduleCampaign = () =>
  useMutation({ mutationFn: ({ id, sendAt }: { id: Id; sendAt: string }) => scheduleCampaign(id, sendAt), meta: { ...campaignWrite, success: "Scheduled" } });
export const useUnscheduleCampaign = () => useMutation({ mutationFn: (id: Id) => unscheduleCampaign(id), meta: { ...campaignWrite, success: "Back to draft" } });
export const useSendCampaign = () => useMutation({ mutationFn: (id: Id) => sendCampaign(id), meta: { ...campaignWrite, success: "Sent" } });
export const useRemoveCampaign = () => useMutation({ mutationFn: (id: Id) => removeCampaign(id), meta: { ...campaignWrite, success: "Deleted" } });

export const newsletterSettingsResource: DocumentResource<NewsletterSettings, DocumentPatch<NewsletterSettings>> = {
  queries: documentQueries("newsletter-settings", getNewsletterSettings, "the newsletter settings"),
  update: updateNewsletterSettings,
  saved: "Newsletter settings saved",
};

export const useOutbox = () =>
  useQuery(queryOptions({ queryKey: outboxKey, queryFn: ({ signal }) => listOutbox({ signal }), meta: { label: "the outbox" } }));
