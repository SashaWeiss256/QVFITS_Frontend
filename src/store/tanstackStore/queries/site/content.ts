/* Site Content Queries */
import { queryOptions } from "@tanstack/react-query";

import { getContent } from "../../services/content/contentApi";
import { getSettings } from "../../services/content/settingsApi";
import { getOffers } from "../../services/marketing/offersApi";
import { siteRoot } from "../keys";

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
};
