import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import OfferCatalog from "../components/OfferCatalog";
import RequireAuth from "../components/RequireAuth";
import { useAuth } from "../components/AuthProvider";
import { authFetch } from "../lib/client/authFetch";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export default function OffersPage() {
  const { getAccessToken } = useAuth();
  const [offers, setOffers] = useState([]);
  const [activeNetwork, setActiveNetwork] = useState("all");
  const [selectedOfferIds, setSelectedOfferIds] = useState([]);

  const loadOffers = useCallback(async () => {
    const response = await authFetch(getAccessToken, "/api/offers");
    const payload = await response.json();
    setOffers(payload.offers || []);
  }, [getAccessToken]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const networks = useMemo(
    () => [...new Set(offers.map((offer) => offer.network).filter(Boolean))],
    [offers]
  );
  const merchantCount = useMemo(
    () => new Set(offers.map((offer) => offer.merchantId)).size,
    [offers]
  );
  const selectedCount = selectedOfferIds.length;

  const toggleOfferSelection = useCallback((offerId) => {
    setSelectedOfferIds((current) =>
      current.includes(offerId)
        ? current.filter((id) => id !== offerId)
        : current.concat(offerId)
    );
  }, []);

  return (
    <RequireAuth>
      <div className="space-y-5">
        <Card className="border-white/60 bg-white/95">
          <CardHeader className="space-y-5">
            <Badge className="w-fit">Offers</Badge>
            <div className="space-y-3">
              <CardTitle className="text-4xl">View affiliate coupons and sale offers in one format</CardTitle>
              <CardDescription className="max-w-3xl text-base leading-7">
                This is the reusable offer dataset. It pulls active offers from every connected source into one consistent list so you can decide what actually moves into the coupon site.
              </CardDescription>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[24px] bg-muted p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Active offers</p>
                <p className="mt-2 font-display text-3xl font-bold tracking-[-0.03em]">{offers.length}</p>
                <p className="mt-1 text-sm text-muted-foreground">standardized offers currently available</p>
              </div>
              <div className="rounded-[24px] bg-muted p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Merchants</p>
                <p className="mt-2 font-display text-3xl font-bold tracking-[-0.03em]">{merchantCount}</p>
                <p className="mt-1 text-sm text-muted-foreground">merchants currently represented</p>
              </div>
              <div className="rounded-[24px] bg-muted p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Selected now</p>
                <p className="mt-2 font-display text-3xl font-bold tracking-[-0.03em]">{selectedCount}</p>
                <p className="mt-1 text-sm text-muted-foreground">offers picked to move into the coupon site</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 pt-0">
            <Link href="/links">
              <Button>Open updates</Button>
            </Link>
            <Link href="/networks">
              <Button variant="outline">Manage sources</Button>
            </Link>
          </CardContent>
        </Card>
        <OfferCatalog
          offers={offers}
          networks={networks}
          activeNetwork={activeNetwork}
          onNetworkChange={setActiveNetwork}
          selectedIds={selectedOfferIds}
          onToggleSelect={toggleOfferSelection}
        />
      </div>
    </RequireAuth>
  );
}
