import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Loading from "../components/Loading";
import HealthStrip from "../components/HealthStrip";
import ReviewQueueList from "../components/ReviewQueueList";
import ReviewDetailPane from "../components/ReviewDetailPane";
import RequireAuth from "../components/RequireAuth";
import { useAuth } from "../components/AuthProvider";
import { authFetch } from "../lib/client/authFetch";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useToastMessage } from "../components/ToastProvider";
import { useIsMobile } from "../lib/client/useIsMobile";

export default function LinksPage() {
  const router = useRouter();
  const toast = useToastMessage();
  const { getAccessToken } = useAuth();
  const [items, setItems] = useState([]);
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState("");
  const isMobile = useIsMobile();

  const activeNetwork = useMemo(() => {
    if (router.query.network) return router.query.network;
    return connectors[0]?.network || "cj";
  }, [connectors, router.query.network]);

  const selectedItemId = router.query.item || "";

  const loadWorkspace = useCallback(async (network = activeNetwork) => {
    setLoading(true);
    try {
      const [connectorsResponse, itemsResponse] = await Promise.all([
        authFetch(getAccessToken, "/api/connectors"),
        authFetch(getAccessToken, `/api/review-items?network=${network}`),
      ]);
      const connectorsPayload = await connectorsResponse.json();
      const itemsPayload = await itemsResponse.json();
      setConnectors(connectorsPayload.connectors || []);
      setItems(itemsPayload.items || []);
    } finally {
      setLoading(false);
    }
  }, [activeNetwork, getAccessToken]);

  useEffect(() => {
    if (!router.isReady) return;
    loadWorkspace(activeNetwork);
  }, [router.isReady, activeNetwork, loadWorkspace]);

  const selectedItem = items.find((item) => item.id === selectedItemId) || null;

  useEffect(() => {
    if (!router.isReady || isMobile || items.length === 0) return;
    const itemStillExists = items.some((item) => item.id === selectedItemId);
    if (selectedItemId && itemStillExists) return;
    router.replace(
      {
        pathname: "/links",
        query: { network: activeNetwork, item: items[0].id },
      },
      undefined,
      { shallow: true }
    );
  }, [router.isReady, isMobile, selectedItemId, activeNetwork, items, router]);

  const handleNetworkChange = (network) => {
    router.push(
      {
        pathname: "/links",
        query: { network },
      },
      undefined,
      { shallow: true }
    );
  };

  const handleSelect = (itemId) => {
    router.push(
      {
        pathname: "/links",
        query: { network: activeNetwork, item: itemId },
      },
      undefined,
      { shallow: true }
    );
  };

  const clearSelection = () => {
    router.push(
      {
        pathname: "/links",
        query: { network: activeNetwork },
      },
      undefined,
      { shallow: true }
    );
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      const response = await authFetch(getAccessToken, `/api/sync/${activeNetwork}`, {
        method: "POST",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error?.message || "Manual sync failed");
      }
      toast({
        title:
          payload.syncRun.status === "success"
            ? "Manual sync complete"
            : "Manual sync complete with warnings",
        status: payload.syncRun.status === "success" ? "success" : "warning",
        duration: 2200,
      });
      await loadWorkspace(activeNetwork);
    } catch (error) {
      toast({ title: error.message, status: "error", duration: 2500 });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    if (!selectedItem) return;
    setActing(action);
    try {
      const response = await authFetch(getAccessToken, `/api/review-items/${selectedItem.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error?.message || "Could not update review item");
      }
      await loadWorkspace(activeNetwork);
      toast({
        title: action === "approve" ? "Item approved" : "Item dismissed",
        status: "success",
        duration: 1800,
      });
    } catch (error) {
      toast({ title: error.message, status: "error", duration: 2500 });
    } finally {
      setActing("");
    }
  };

  const hasConnector = connectors.length > 0;
  const selectedCount = connectors.reduce(
    (count, connector) =>
      count + (connector.merchants || []).filter((merchant) => merchant.selected).length,
    0
  );

  return (
    <RequireAuth>
      <div className="space-y-5">
        <Card className="border-white/60 bg-white/95">
          <CardHeader className="space-y-5">
            <Badge className="w-fit">Offer updates</Badge>
            <div className="space-y-3">
              <CardTitle className="text-4xl">Check incoming changes from your affiliate sources</CardTitle>
              <CardDescription className="max-w-3xl text-base leading-7">
                This workspace shows coupons and sale updates that changed since the last sync so you can decide what should be kept and what should be ignored.
              </CardDescription>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[24px] bg-muted p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Updates</p>
                <p className="mt-2 font-display text-3xl font-bold tracking-[-0.03em]">{items.length}</p>
                <p className="mt-1 text-sm text-muted-foreground">incoming offer changes waiting for review</p>
              </div>
              <div className="rounded-[24px] bg-muted p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Sources</p>
                <p className="mt-2 font-display text-3xl font-bold tracking-[-0.03em]">{connectors.length}</p>
                <p className="mt-1 text-sm text-muted-foreground">connected sources in this workspace</p>
              </div>
              <div className="rounded-[24px] bg-muted p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Merchants watched</p>
                <p className="mt-2 font-display text-3xl font-bold tracking-[-0.03em]">{selectedCount}</p>
                <p className="mt-1 text-sm text-muted-foreground">selected merchants being monitored</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 pt-0">
            <Link href="/links">
              <Button variant="outline">Refresh updates</Button>
            </Link>
            <Link href="/networks">
              <Button variant="outline">Manage sources</Button>
            </Link>
          </CardContent>
        </Card>
        {hasConnector ? (
          <HealthStrip
            connectors={connectors}
            activeNetwork={activeNetwork}
            onNetworkChange={handleNetworkChange}
            onSync={handleSync}
            syncing={loading}
          />
        ) : (
          <Card className="border-white/60 bg-white/95">
            <CardHeader>
              <Badge className="w-fit">Setup required</Badge>
              <CardTitle>Connect a source first</CardTitle>
              <CardDescription className="max-w-2xl text-base leading-7">
                Save source credentials and choose merchants before you can build a stream of offer updates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/networks">
                <Button>Open source settings</Button>
              </Link>
            </CardContent>
          </Card>
        )}
        {hasConnector ? (
          isMobile && selectedItem ? (
            <ReviewDetailPane
              item={selectedItem}
              onAction={handleAction}
              acting={acting}
              showBack
              onBack={clearSelection}
            />
          ) : (
            <div className="grid items-start gap-5 xl:grid-cols-[minmax(340px,0.92fr)_minmax(0,1.08fr)]">
              <div className="min-w-0">
                <ReviewQueueList
                  items={items}
                  selectedId={selectedItem?.id}
                  onSelect={handleSelect}
                />
              </div>
              <div className="hidden min-w-0 lg:block">
                <ReviewDetailPane
                  item={selectedItem || items[0] || null}
                  onAction={handleAction}
                  acting={acting}
                />
              </div>
            </div>
          )
        ) : null}
        <Loading loading={loading} />
      </div>
    </RequireAuth>
  );
}
