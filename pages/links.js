import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Box, HStack, Text, VStack, useBreakpointValue, useToast, SimpleGrid } from "@chakra-ui/react";
import Loading from "../components/Loading";
import SectionBox from "../components/SectionBox";
import Header from "../components/Header";
import RouterLink from "../components/RouterLink";
import HealthStrip from "../components/HealthStrip";
import ReviewQueueList from "../components/ReviewQueueList";
import ReviewDetailPane from "../components/ReviewDetailPane";
import RequireAuth from "../components/RequireAuth";
import { useAuth } from "../components/AuthProvider";
import { authFetch } from "../lib/client/authFetch";

export default function LinksPage() {
  const router = useRouter();
  const toast = useToast();
  const { getAccessToken } = useAuth();
  const [items, setItems] = useState([]);
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState("");
  const isMobile = useBreakpointValue({ base: true, lg: false });

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
      <VStack align="stretch" spacing={5}>
        <SectionBox bg="rgba(255,255,255,0.98)">
          <Header
            eyebrow="Review workspace"
            title="Review offer changes"
            subtitle="Sync the latest offers, open a change, and approve or dismiss it with the details you need in one place."
          />
          <HStack spacing={3} mt={6} flexWrap="wrap">
            <RouterLink
              to="/links"
              display="inline-flex"
              width="fit-content"
              bg="transparent"
              border="1px solid rgba(15, 17, 23, 0.12)"
            >
              Reload queue
            </RouterLink>
            <RouterLink
              to="/networks"
              display="inline-flex"
              width="fit-content"
              bg="transparent"
              border="1px solid rgba(15, 17, 23, 0.12)"
            >
              Manage sources
            </RouterLink>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} mt={7}>
            <Box p={4} borderRadius="22px" bg="rgba(15,17,23,0.04)">
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="brand.500">
                Waiting now
              </Text>
              <Text mt={2} fontSize="2xl" fontWeight="700" color="ink.900">
                {items.length}
              </Text>
              <Text mt={1} fontSize="sm" color="ink.600">
                changes waiting for review
              </Text>
            </Box>
            <Box p={4} borderRadius="22px" bg="rgba(15,17,23,0.04)">
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="brand.500">
                Sources
              </Text>
              <Text mt={2} fontSize="2xl" fontWeight="700" color="ink.900">
                {connectors.length}
              </Text>
              <Text mt={1} fontSize="sm" color="ink.600">
                connected sources in this workspace
              </Text>
            </Box>
            <Box p={4} borderRadius="22px" bg="rgba(15,17,23,0.04)">
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="lime.700">
                Merchants watched
              </Text>
              <Text mt={2} fontSize="2xl" fontWeight="700" color="ink.900">
                {selectedCount}
              </Text>
              <Text mt={1} fontSize="sm" color="ink.600">
                selected merchants being monitored
              </Text>
            </Box>
          </SimpleGrid>
        </SectionBox>
        {hasConnector ? (
          <HealthStrip
            connectors={connectors}
            activeNetwork={activeNetwork}
            onNetworkChange={handleNetworkChange}
            onSync={handleSync}
            syncing={loading}
          />
        ) : (
          <SectionBox>
            <Text fontSize="xs" fontWeight="700" letterSpacing="0.18em" textTransform="uppercase" color="brand.500">
              Setup required
            </Text>
            <Text mt={3} fontSize="2xl" fontWeight="700" color="ink.900">
              Connect a source first
            </Text>
            <Text color="ink.600" mt={2} maxW="44ch">
              Save source credentials and choose merchants before you can build a
              review queue.
            </Text>
            <RouterLink
              to="/networks"
              mt={4}
              display="inline-flex"
              width="fit-content"
              border="1px solid rgba(139, 77, 255, 0.16)"
            >
              Open source settings
            </RouterLink>
          </SectionBox>
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
            <Box
              display="grid"
              gridTemplateColumns={{ base: "1fr", xl: "minmax(340px, 0.92fr) minmax(0, 1.08fr)" }}
              gap={5}
              alignItems="start"
            >
              <Box minW={0}>
                <ReviewQueueList
                  items={items}
                  selectedId={selectedItem?.id}
                  onSelect={handleSelect}
                />
              </Box>
              <Box display={{ base: "none", lg: "block" }} minW={0}>
                <ReviewDetailPane
                  item={selectedItem || items[0] || null}
                  onAction={handleAction}
                  acting={acting}
                />
              </Box>
            </Box>
          )
        ) : null}
        <Loading loading={loading} />
      </VStack>
    </RequireAuth>
  );
}
