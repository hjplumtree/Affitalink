import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Search } from "lucide-react";
import { useToastMessage } from "./ToastProvider";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import type { OfferExportPayload, OfferRecord } from "../types/offers";

function formatDate(value?: string | null) {
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

function buildOfferPayload(offer: OfferRecord): OfferExportPayload {
  return {
    network: offer.network,
    merchantName: offer.merchantName,
    title: offer.title,
    description: offer.description ?? null,
    couponCode: offer.couponCode ?? null,
    destinationUrl: offer.destinationUrl ?? null,
    sourceUrl: offer.sourceUrl ?? null,
    startsAt: offer.startsAt ?? null,
    endsAt: offer.endsAt ?? null,
    status: offer.status ?? null,
    publishStatus: offer.publishStatus ?? null,
    publishedAt: offer.publishedAt ?? null,
    updatedAt: offer.updatedAt || offer.lastSeenAt || null,
  };
}

function buildOfferCopyText(offer: OfferRecord) {
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

function OfferStat({
  label,
  value,
  action,
}: {
  label: string;
  value: string;
  action?: ReactNode;
}) {
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

interface OfferCatalogProps {
  offers: OfferRecord[];
  networks: string[];
  activeNetwork: string;
  onNetworkChange: (network: string) => void;
  selectedIds?: string[];
  onToggleSelect?: (offerId: string) => void;
  mode?: "public" | "studio";
  publishedIds?: string[];
  onPublish?: (offerId: string) => void;
  onUnpublish?: (offerId: string) => void;
  actingOfferId?: string;
}

export default function OfferCatalog({
  offers,
  networks,
  activeNetwork,
  onNetworkChange,
  selectedIds = [],
  onToggleSelect,
  mode = "public",
  publishedIds = [],
  onPublish,
  onUnpublish,
  actingOfferId = "",
}: OfferCatalogProps) {
  const isStudio = mode === "studio";
  const [search, setSearch] = useState("");
  const [expandedModes, setExpandedModes] = useState<Record<string, "block" | "json" | null>>({});
  const toast = useToastMessage();

  const copyValue = async (value: string, label: string) => {
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
      return [offer.merchantName, offer.title, offer.description, offer.couponCode]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [activeNetwork, search, offers]);

  const selectedOffers = useMemo(
    () => filteredOffers.filter((offer) => selectedIds.includes(offer.id)),
    [filteredOffers, selectedIds]
  );

  const toggleExpandedMode = (offerId: string, nextMode: "block" | "json") => {
    setExpandedModes((current) => ({
      ...current,
      [offerId]: current[offerId] === nextMode ? null : nextMode,
    }));
  };

  const copySelected = async (nextMode: "block" | "json") => {
    if (selectedOffers.length === 0) return;
    const text =
      nextMode === "json"
        ? JSON.stringify(selectedOffers.map(buildOfferPayload), null, 2)
        : selectedOffers.map(buildOfferCopyText).join("\n\n---\n\n");
    await copyValue(text, nextMode === "json" ? "Selected offer JSON" : "Selected offer block");
  };

  if (offers.length === 0) {
    return (
      <Card className="border-white/60 bg-white/95">
        <CardHeader>
          <Badge className="w-fit">{isStudio ? "No offers yet" : "Library is empty"}</Badge>
          <CardTitle>{isStudio ? "Connect a source and run a sync first" : "No reviewed offers are available yet"}</CardTitle>
          <CardDescription className="max-w-2xl text-base">
            {isStudio
              ? "This page will show your normalized offer data after the first successful review cycle."
              : "Once sources are connected, reviewed, and published, this page shows the current offer library snapshot."}
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
          {isStudio ? <Badge>{selectedOffers.length} selected</Badge> : null}
        </div>
      </div>

      {isStudio ? (
        <Card className="border-white/60 bg-white/95">
          <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Publishing shortlist
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Select the offers you want to push downstream. Review is for triage. Library studio is where you decide what survives into the publishing inventory.
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
      ) : null}

      <div className="space-y-3">
        {filteredOffers.map((offer) => {
          const expandedMode = expandedModes[offer.id] || null;
          const isSelected = selectedIds.includes(offer.id);
          const isPublished = publishedIds.includes(offer.id);
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
                      {isStudio ? (
                        <Badge variant={isPublished ? "default" : isSelected ? "secondary" : "outline"}>
                          {isPublished ? "Published" : isSelected ? "Selected" : "Draft"}
                        </Badge>
                      ) : null}
                      <Badge variant={offer.couponCode ? "default" : "secondary"}>
                        {offer.couponCode || "No code"}
                      </Badge>
                    </div>
                    <p className="truncate font-display text-xl font-bold tracking-[-0.03em] text-foreground">
                      {offer.merchantName}
                    </p>
                    <p className="mt-1 text-base font-semibold leading-7 text-foreground">{offer.title}</p>
                    {offer.description ? (
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{offer.description}</p>
                    ) : null}
                  </div>

                  {isStudio ? (
                    <div className="flex flex-wrap gap-2 lg:max-w-[360px] lg:justify-end">
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => onToggleSelect?.(offer.id)}
                        disabled={actingOfferId === offer.id || isPublished}
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
                      {isPublished ? (
                        <Button variant="outline" onClick={() => onUnpublish?.(offer.id)} disabled={actingOfferId === offer.id}>
                          Unpublish
                        </Button>
                      ) : (
                        <Button onClick={() => onPublish?.(offer.id)} disabled={actingOfferId === offer.id || !isSelected}>
                          Publish
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 lg:max-w-[360px] lg:justify-end">
                      {offer.couponCode ? (
                        <Button variant="outline" onClick={() => copyValue(offer.couponCode ?? "", "Coupon code")}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy code
                        </Button>
                      ) : null}
                      {offer.destinationUrl ? (
                        <a href={offer.destinationUrl} target="_blank" rel="noreferrer">
                          <Button>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open destination
                          </Button>
                        </a>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <OfferStat
                    label="Coupon"
                    value={offer.couponCode || "No code needed"}
                    action={
                      isStudio ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyValue(offer.couponCode || "No code needed", "Coupon code")}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </Button>
                      ) : undefined
                    }
                  />
                  <OfferStat label="Starts" value={formatDate(offer.startsAt)} />
                  <OfferStat label="Ends" value={formatDate(offer.endsAt)} />
                  <div className="rounded-[22px] border border-border bg-muted/60 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Links</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {offer.destinationUrl ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyValue(offer.destinationUrl ?? "", "Destination URL")}
                        >
                          Copy destination
                        </Button>
                      ) : null}
                      {offer.sourceUrl ? (
                        <Button size="sm" variant="ghost" onClick={() => copyValue(offer.sourceUrl ?? "", "Source URL")}>
                          Copy source
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {isStudio ? (
                    <>
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
                    </>
                  ) : null}
                  {offer.destinationUrl ? (
                    <a href={offer.destinationUrl} target="_blank" rel="noreferrer">
                      <Button size="sm" variant={isStudio ? "outline" : "ghost"}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open destination
                      </Button>
                    </a>
                  ) : null}
                  {offer.sourceUrl ? (
                    <a href={offer.sourceUrl} target="_blank" rel="noreferrer">
                      <Button size="sm" variant={isStudio ? "outline" : "ghost"}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open source
                      </Button>
                    </a>
                  ) : null}
                </div>

                {isStudio && expandedMode === "block" ? (
                  <pre className="overflow-x-auto rounded-[22px] border border-border bg-muted/70 p-4 text-sm leading-6 text-foreground">
                    {buildOfferCopyText(offer)}
                  </pre>
                ) : null}

                {isStudio && expandedMode === "json" ? (
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
