/* Admin Offers, Settings, Messages And Newsletter Documents */
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import { listCampaigns, removeCampaign, saveCampaign, scheduleCampaign, sendCampaign, unscheduleCampaign } from "../../services/marketing/campaignsApi";
import { eraseSubscriber, getNewsletterSettings, listSubscribers, unsubscribeSubscriber, updateNewsletterSettings } from "../../services/marketing/subscribersApi";
import { listOutbox } from "../../services/notifications/outboxApi";

import { listVeeQuestions, veeQuestionsCrud } from "../../services/assistant/veeQuestionsApi";
import { listMessages, messagesCrud } from "../../services/content/contactApi";
import { getMenuFeatureForEdit, updateMenuFeature, type MenuFeature } from "../../services/content/pagesApi";
import { getSettings, updateSettings } from "../../services/content/settingsApi";
import { getOffersForEdit, updateOffers, type Offers } from "../../services/marketing/offersApi";
import { listAllPaymentMethods, paymentMethodsCrud } from "../../services/settings/paymentMethodsApi";
import { listAllShippingZones, shippingCrud } from "../../services/settings/shippingApi";
import type { DocumentPatch } from "../../services/store/collectionStore";
import type { Photo, Campaign, ContactMessage, Id, VeeQuestion, NewsletterSettings, PaymentMethodOption, ShippingZone, ShopSettings, Subscriber } from "../../services/types";
import { adminRoot, siteRoot } from "../keys";
import { collectionQueries, crudResource, documentQueries, type DocumentResource } from "./collection";

// Every one of these is read by the storefront too.
const SITE = [siteRoot] as const;

export const offersResource: DocumentResource<Offers, DocumentPatch<Offers>> = {
  queries: documentQueries("offers", getOffersForEdit, "offers"),
  update: updateOffers,
  saved: "Offers saved",
  alsoInvalidates: SITE,
};

export const menuFeatureResource: DocumentResource<MenuFeature & { photo?: Photo }, DocumentPatch<MenuFeature & { photo?: Photo }>> = {
  queries: documentQueries("menu-feature", getMenuFeatureForEdit, "the menu tile"),
  update: updateMenuFeature,
  saved: "Menu tile saved",
  alsoInvalidates: SITE,
};

export const settingsResource: DocumentResource<ShopSettings, DocumentPatch<ShopSettings>> = {
  queries: documentQueries("settings", getSettings, "settings"),
  update: updateSettings,
  saved: "Settings saved",
  alsoInvalidates: SITE,
};

export const messagesResource = crudResource<ContactMessage>("messages", messagesCrud, { noun: "Message", list: listMessages, alsoInvalidates: [] });
export const veeQuestionsResource = crudResource<VeeQuestion>("vee-questions", veeQuestionsCrud, { noun: "Question", list: listVeeQuestions, alsoInvalidates: [] });
export const shippingResource = crudResource<ShippingZone>("shipping-zones", shippingCrud, { noun: "Delivery zone", list: listAllShippingZones });
export const paymentMethodsResource = crudResource<PaymentMethodOption>("payment-methods", paymentMethodsCrud, { noun: "Payment method", list: listAllPaymentMethods });

// The newsletter: the list (double opt-in), campaigns, its settings and the email outbox.
export const subscriberQueries = collectionQueries<Subscriber>("subscribers", listSubscribers, { label: "the newsletter list" });
export const useSubscribers = () => useQuery(subscriberQueries.list());
export const useUnsubscribeSubscriber = () =>
  useMutation({ mutationFn: (id: Id) => unsubscribeSubscriber(id), meta: { invalidates: [subscriberQueries.all()], success: "Unsubscribed" } });
// Erasing deletes the subscriber and their consent record entirely (a privacy request).
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

// The emails the shop would have sent, until an email service is connected.
export const useOutbox = () =>
  useQuery(queryOptions({ queryKey: outboxKey, queryFn: ({ signal }) => listOutbox({ signal }), meta: { label: "the outbox" } }));

// Local preview: nothing is really sent, so sending again does nothing.
export const useRetryEmail = () => useMutation({ mutationFn: async (_id: Id) => undefined });
