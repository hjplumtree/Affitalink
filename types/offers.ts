export type OfferStatus = "active" | "inactive" | "expired" | "draft";
export type OfferPublishStatus = "draft" | "selected" | "published";

export interface OfferRecord {
  id: string;
  workspaceId?: string | null;
  connectorId?: string | null;
  merchantId?: string | null;
  merchantName: string;
  network: string;
  title: string;
  description?: string | null;
  couponCode?: string | null;
  destinationUrl?: string | null;
  sourceUrl?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  status?: OfferStatus | string | null;
  publishStatus?: OfferPublishStatus | string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  lastSeenAt?: string | null;
}

export interface OfferExportPayload {
  network: string;
  merchantName: string;
  title: string;
  description: string | null;
  couponCode: string | null;
  destinationUrl: string | null;
  sourceUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  status: string | null;
  publishStatus: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
}
