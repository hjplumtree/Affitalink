import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Search } from "lucide-react";
import { useToastMessage } from "./ToastProvider";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

function formatDate(value) {
  if (!value) return "No date";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function buildOfferPayload(offer) {
  return {
    network: offer.network,
    merchantName: offer.merchantName,
    title: offer.title,
    description: offer.description,
    couponCode: offer.couponCode,
    destinationUrl: offer.destinationUrl,
    sourceUrl: offer.sourceUrl,
    startsAt: offer.startsAt,
    endsAt: offer.endsAt,
    status: offer.status,
    updatedAt: offer.updatedAt || offer.lastSeenAt,
  };
}

function buildOfferCopyText(offer) {
  return [
    `Merchant: ${offer.merchantName}`,
    `Title: ${offer.title}`,
    `Coupon: ${offer.couponCode || "No code"}`,
    `Destination: ${offer.destinationUrl || ""}`,
    `Source: ${offer.sourceUrl || ""}`,
    `Starts: ${offer.startsAt || ""}`,
    `Ends: ${offer.endsAt || ""}`,
    `Network: ${offer.network || ""}`,
  ].join("\n");
}

function OfferStat({ label, value, action }) {
  return (
    <div className="rounded-[22px] border border-border bg-muted/60 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{label}</p>
      <div className="mt-2 flex items-start justify-between gap-3">
        <p className="text-sm font-semibold leading-6 text-foreground">{value}</p>
        {action}
      </div>
    </div>
  );
}

export default function OfferCatalog({
  offers,
  networks,
  activeNetwork,
  onNetworkChange,
  selectedIds,
  onToggleSelect,
}) {
  const [search, setSearch] = useState("");
  const [expandedModes, setExpandedModes] = useState({});
  const toast = useToastMessage();

  const copyValue = async (value, label) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    toast({
      title: `${label} copied`,
      status: "info",
      position: "top-right",
      duration: 900,
    });
  };

  const filteredOffers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return offers.filter((offer) => {
      const matchesNetwork = activeNetwork === "all" || offer.network === activeNetwork;
      if (!matchesNetwork) return false;
      if (!query) return true;
      return [
        offer.merchantName,
        offer.title,
        offer.description,
        offer.couponCode,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [activeNetwork, search, offers]);

  const selectedOffers = useMemo(
    () => filteredOffers.filter((offer) => selectedIds.includes(offer.id)),
    [filteredOffers, selectedIds]
  );

  const toggleExpandedMode = (offerId, mode) => {
    setExpandedModes((current) => ({
      ...current,
      [offerId]: current[offerId] === mode ? null : mode,
    }));
  };

  const copySelected = async (mode) => {
    if (selectedOffers.length === 0) return;
    const text =
      mode === "json"
        ? JSON.stringify(selectedOffers.map(buildOfferPayload), null, 2)
        : selectedOffers.map(buildOfferCopyText).join("\n\n---\n\n");
    await copyValue(text, mode === "json" ? "Selected offer JSON" : "Selected offer block");
  };

  if (offers.length === 0) {
    return (
      <Card className="border-white/60 bg-white/95">
        <CardHeader>
          <Badge className="w-fit">No offers yet</Badge>
          <CardTitle>Connect a source and run a sync first</CardTitle>
          <CardDescription className="max-w-2xl text-base">
            This page will show your standardized coupon and sale data after the first successful update check.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="flex h-12 items-center gap-3 rounded-full border border-border bg-white px-4 text-sm shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search merchant, title, or coupon"
              className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            />
          </label>
          <select
            value={activeNetwork}
            onChange={(event) => onNetworkChange(event.target.value)}
            aria-label="Filter offers by source"
            className="h-12 rounded-full border border-border bg-white px-4 text-sm font-medium text-foreground shadow-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All sources</option>
            {networks.map((network) => (
              <option key={network} value={network}>
                {network.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{filteredOffers.length} offers</Badge>
          <Badge>{selectedOffers.length} selected</Badge>
        </div>
      </div>

      <Card className="border-white/60 bg-white/95">
        <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Publishing shortlist
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Select the offers you want to move into the coupon site. Updates is for review. Offers is where you pick what survives.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => copySelected("block")} disabled={selectedOffers.length === 0}>
              Copy selected block
            </Button>
            <Button variant="outline" onClick={() => copySelected("json")} disabled={selectedOffers.length === 0}>
              Copy selected JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredOffers.map((offer) => {
          const expandedMode = expandedModes[offer.id] || null;
          const isSelected = selectedIds.includes(offer.id);
          const payloadJson = JSON.stringify(buildOfferPayload(offer), null, 2);

          return (
            <Card
              key={offer.id}
              className={isSelected ? "border-primary/30 bg-primary/[0.045] shadow-lift" : "border-white/60 bg-white/95"}
            >
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <Badge>{offer.network?.toUpperCase()}</Badge>
                      <Badge variant="outline">{formatDate(offer.updatedAt || offer.lastSeenAt)}</Badge>
                      <Badge variant={offer.couponCode ? "default" : "secondary"}>
                        {offer.couponCode || "No code"}
                      </Badge>
                    </div>
                    <p className="truncate font-display text-xl font-bold tracking-[-0.03em] text-foreground">
                      {offer.merchantName}
                    </p>
                    <p className="mt-1 text-base font-semibold leading-7 text-foreground">
                      {offer.title}
                    </p>
                    {offer.description ? (
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                        {offer.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2 lg:max-w-[360px] lg:justify-end">
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => onToggleSelect(offer.id)}
                    >
                      {isSelected ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Selected
                        </>
                      ) : (
                        "Select"
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => copyValue(buildOfferCopyText(offer), "Offer block")}>
                      Copy block
                    </Button>
                    <Button variant="outline" onClick={() => copyValue(payloadJson, "Offer JSON")}>
                      Copy JSON
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <OfferStat
                    label="Coupon"
                    value={offer.couponCode || "No code needed"}
                    action={
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyValue(offer.couponCode || "No code needed", "Coupon code")}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                    }
                  />
                  <OfferStat label="Starts" value={formatDate(offer.startsAt)} />
                  <OfferStat label="Ends" value={formatDate(offer.endsAt)} />
                  <div className="rounded-[22px] border border-border bg-muted/60 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Links</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {offer.destinationUrl ? (
                        <Button size="sm" variant="ghost" onClick={() => copyValue(offer.destinationUrl, "Destination URL")}>
                          Copy destination
                        </Button>
                      ) : null}
                      {offer.sourceUrl ? (
                        <Button size="sm" variant="ghost" onClick={() => copyValue(offer.sourceUrl, "Source URL")}>
                          Copy source
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={expandedMode === "block" ? "default" : "outline"}
                    onClick={() => toggleExpandedMode(offer.id, "block")}
                  >
                    {expandedMode === "block" ? "Hide block" : "Show block"}
                  </Button>
                  <Button
                    size="sm"
                    variant={expandedMode === "json" ? "default" : "outline"}
                    onClick={() => toggleExpandedMode(offer.id, "json")}
                  >
                    {expandedMode === "json" ? "Hide JSON" : "Show JSON"}
                  </Button>
                  {offer.destinationUrl ? (
                    <a href={offer.destinationUrl} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open destination
                      </Button>
                    </a>
                  ) : null}
                  {offer.sourceUrl ? (
                    <a href={offer.sourceUrl} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open source
                      </Button>
                    </a>
                  ) : null}
                </div>

                {expandedMode === "block" ? (
                  <pre className="overflow-x-auto rounded-[22px] border border-border bg-muted/70 p-4 text-sm leading-6 text-foreground">
                    {buildOfferCopyText(offer)}
                  </pre>
                ) : null}

                {expandedMode === "json" ? (
                  <pre className="overflow-x-auto rounded-[22px] border border-border bg-muted/70 p-4 text-sm leading-6 text-foreground">
                    {payloadJson}
                  </pre>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
