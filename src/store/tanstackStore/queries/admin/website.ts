/* Admin Website, Offers And Settings Documents */
import { useQuery } from "@tanstack/react-query";

import { getContent, updateContent, type HomeContent } from "../../services/content/contentApi";
import { getSettings, updateSettings } from "../../services/content/settingsApi";
import { getOffers, updateOffers, type Offers } from "../../services/marketing/offersApi";
import { listSubscribers } from "../../services/marketing/subscribersApi";
import type { DocumentPatch } from "../../services/store/collectionStore";
import type { ShopSettings, Subscriber } from "../../services/types";
import { collectionQueries, documentQueries, type DocumentResource } from "./collection";

export const contentResource: DocumentResource<HomeContent, DocumentPatch<HomeContent>> = {
  queries: documentQueries("content", getContent, "the home page content"),
  update: updateContent,
  saved: "Website content saved",
};

export const offersResource: DocumentResource<Offers, DocumentPatch<Offers>> = {
  queries: documentQueries("offers", getOffers, "offers"),
  update: updateOffers,
  saved: "Offers saved",
};

export const settingsResource: DocumentResource<ShopSettings, DocumentPatch<ShopSettings>> = {
  queries: documentQueries("settings", getSettings, "settings"),
  update: updateSettings,
  saved: "Settings saved",
};

export const subscriberQueries = collectionQueries<Subscriber>("subscribers", listSubscribers, { label: "subscribers" });
export const useSubscribers = () => useQuery(subscriberQueries.list());
