import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import OfferCatalog from "../components/OfferCatalog";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import type { OfferRecord } from "../types/offers";

export default function OffersPage() {
  const [offers, setOffers] = useState<OfferRecord[]>([]);
  const [activeNetwork, setActiveNetwork] = useState("all");

  const loadOffers = useCallback(async () => {
    const response = await fetch("/api/offers?public=1");
    const payload = (await response.json()) as { offers?: OfferRecord[] };
    setOffers(payload.offers || []);
  }, []);

  useEffect(() => {
    void loadOffers();
  }, [loadOffers]);

  const networks = useMemo(() => [...new Set(offers.map((offer) => offer.network).filter(Boolean))], [offers]);
  const merchantCount = useMemo(() => new Set(offers.map((offer) => offer.merchantId).filter(Boolean)).size, [offers]);
  const publishedCount = offers.filter((offer) => offer.publishStatus === "published").length;

  return (
    <div className="space-y-5">
      <Card className="border-white/60 bg-white/95">
        <CardHeader className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
            <div>
              <Badge className="w-fit">Library</Badge>
              <CardTitle className="mt-4 text-4xl lg:text-6xl lg:leading-[0.98]">
                Browse the reviewed offer library behind your publishing workflow
              </CardTitle>
              <CardDescription className="mt-3 max-w-3xl text-base leading-8">
                This is the readable library view of reviewed inventory. It helps operators inspect what has survived
                the review flow before those offers move into WordPress or another publishing destination.
              </CardDescription>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/offers">
                  <Button>Browse library</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline">Open library studio</Button>
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] bg-[#11141d] p-6 text-white shadow-[0_28px_70px_rgba(15,17,23,0.18)]">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">What this page is</p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm text-white/60">01</p>
                  <p className="text-lg font-bold">A readable output of the internal review system</p>
                  <p className="mt-1 text-sm leading-6 text-white/70">
                    It lets you inspect the current publishing inventory without jumping back into raw network screens.
                  </p>
                </div>
                <div>
                  <p className="text-sm text-white/60">02</p>
                  <p className="text-lg font-bold">Not the final coupon site by default</p>
                  <p className="mt-1 text-sm leading-6 text-white/70">
                    This library is the source of truth for downstream publishing, starting with WordPress.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[24px] bg-muted p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Published items</p>
              <p className="mt-2 font-display text-3xl font-bold tracking-[-0.03em]">{publishedCount}</p>
              <p className="mt-1 text-sm text-muted-foreground">offers currently marked ready for downstream use</p>
            </div>
            <div className="rounded-[24px] bg-muted p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Merchants</p>
              <p className="mt-2 font-display text-3xl font-bold tracking-[-0.03em]">{merchantCount}</p>
              <p className="mt-1 text-sm text-muted-foreground">brands represented in the reviewed library</p>
            </div>
            <div className="rounded-[24px] bg-muted p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Sources</p>
              <p className="mt-2 font-display text-3xl font-bold tracking-[-0.03em]">{networks.length}</p>
              <p className="mt-1 text-sm text-muted-foreground">affiliate sources currently feeding the library</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <OfferCatalog
        mode="public"
        offers={offers}
        networks={networks}
        activeNetwork={activeNetwork}
        onNetworkChange={setActiveNetwork}
      />
    </div>
  );
}
