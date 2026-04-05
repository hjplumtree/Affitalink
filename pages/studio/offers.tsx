import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import OfferCatalog from "../../components/OfferCatalog";
import RequireAuth from "../../components/RequireAuth";
import { useAuth } from "../../components/AuthProvider";
import { authFetch } from "../../lib/client/authFetch";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { useToastMessage } from "../../components/ToastProvider";
import type { OfferRecord } from "../../types/offers";

export default function StudioOffersPage() {
  const { getAccessToken } = useAuth();
  const toast = useToastMessage();
  const [offers, setOffers] = useState<OfferRecord[]>([]);
  const [activeNetwork, setActiveNetwork] = useState("all");
  const [actingOfferId, setActingOfferId] = useState("");

  const loadOffers = useCallback(async () => {
    const response = await authFetch(getAccessToken, "/api/offers");
    const payload = (await response.json()) as { offers?: OfferRecord[] };
    setOffers(payload.offers || []);
  }, [getAccessToken]);

  useEffect(() => {
    void loadOffers();
  }, [loadOffers]);

  const networks = useMemo(() => [...new Set(offers.map((offer) => offer.network).filter(Boolean))], [offers]);
  const merchantCount = useMemo(() => new Set(offers.map((offer) => offer.merchantId).filter(Boolean)).size, [offers]);
  const selectedOfferIds = useMemo(
    () => offers.filter((offer) => offer.publishStatus === "selected").map((offer) => offer.id),
    [offers]
  );
  const publishedOfferIds = useMemo(
    () => offers.filter((offer) => offer.publishStatus === "published").map((offer) => offer.id),
    [offers]
  );
  const selectedCount = selectedOfferIds.length;
  const publishedCount = publishedOfferIds.length;

  const updateOfferPublishStatus = useCallback(
    async (offerId: string, action: "select" | "publish" | "unpublish") => {
      setActingOfferId(offerId);
      try {
        const response = await authFetch(getAccessToken, `/api/offers/${offerId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error?.message || "Could not update publish status");
        }
        setOffers((current) => current.map((offer) => (offer.id === offerId ? payload.offer : offer)));
        toast({
          title:
            action === "select"
              ? "Offer added to publish shortlist"
              : action === "publish"
                ? "Offer published to the public catalog"
                : "Offer moved back to draft",
          status: "success",
          duration: 1800,
        });
      } catch (error) {
        toast({
          title: error instanceof Error ? error.message : "Could not update publish status",
          status: "error",
          duration: 2500,
        });
      } finally {
        setActingOfferId("");
      }
    },
    [getAccessToken, toast]
  );

  return (
    <RequireAuth>
      <div className="space-y-5">
        <Card className="border-white/60 bg-white/95">
          <CardHeader className="space-y-5">
            <Badge className="w-fit">Library studio</Badge>
            <div className="space-y-3">
              <CardTitle className="text-4xl">Curate the canonical library</CardTitle>
              <CardDescription className="max-w-3xl text-base leading-7">
                This is the internal working set. Use it to inspect normalized offers, build a shortlist, and decide
                what should move from draft to selected to published before it reaches WordPress.
              </CardDescription>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[24px] bg-muted p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Library items</p>
                <p className="mt-2 font-display text-3xl font-bold tracking-[-0.03em]">{offers.length}</p>
                <p className="mt-1 text-sm text-muted-foreground">normalized offers available to curate</p>
              </div>
              <div className="rounded-[24px] bg-muted p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Merchants</p>
                <p className="mt-2 font-display text-3xl font-bold tracking-[-0.03em]">{merchantCount}</p>
                <p className="mt-1 text-sm text-muted-foreground">merchants represented in the current library</p>
              </div>
            <div className="rounded-[24px] bg-muted p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Selected</p>
              <p className="mt-2 font-display text-3xl font-bold tracking-[-0.03em]">{selectedCount}</p>
              <p className="mt-1 text-sm text-muted-foreground">offers shortlisted for the next publishing pass</p>
            </div>
            <div className="rounded-[24px] bg-muted p-5 md:col-span-3 lg:col-span-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Published</p>
              <p className="mt-2 font-display text-3xl font-bold tracking-[-0.03em]">{publishedCount}</p>
              <p className="mt-1 text-sm text-muted-foreground">offers currently approved for downstream publishing</p>
            </div>
          </div>
        </CardHeader>
          <CardContent className="flex flex-wrap gap-2 pt-0">
            <Link href="/links">
              <Button variant="outline">Open review queue</Button>
            </Link>
            <Link href="/networks">
              <Button variant="outline">Manage sources</Button>
            </Link>
          </CardContent>
        </Card>

        <OfferCatalog
          mode="studio"
          offers={offers}
          networks={networks}
          activeNetwork={activeNetwork}
          onNetworkChange={setActiveNetwork}
          selectedIds={selectedOfferIds}
          publishedIds={publishedOfferIds}
          onToggleSelect={(offerId) => updateOfferPublishStatus(offerId, "select")}
          onPublish={(offerId) => updateOfferPublishStatus(offerId, "publish")}
          onUnpublish={(offerId) => updateOfferPublishStatus(offerId, "unpublish")}
          actingOfferId={actingOfferId}
        />
      </div>
    </RequireAuth>
  );
}
