import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import Header from "../components/Header";
import OfferCatalog from "../components/OfferCatalog";
import RequireAuth from "../components/RequireAuth";
import SectionBox from "../components/SectionBox";
import RouterLink from "../components/RouterLink";
import { useAuth } from "../components/AuthProvider";
import { authFetch } from "../lib/client/authFetch";

export default function OffersPage() {
  const { getAccessToken } = useAuth();
  const [offers, setOffers] = useState([]);
  const [activeNetwork, setActiveNetwork] = useState("all");

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

  return (
    <RequireAuth>
      <VStack align="stretch" spacing={5}>
        <SectionBox bg="rgba(255,255,255,0.98)">
          <Header
            eyebrow="Offers"
            title="View affiliate coupons and sale offers in one format"
            subtitle="This is the main output of the dashboard. It brings active offers from every connected source into one consistent list."
          />
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} mt={7}>
            <Box p={4} borderRadius="22px" bg="rgba(15,17,23,0.04)">
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="brand.500">
                Active offers
              </Text>
              <Text mt={2} fontSize="2xl" fontWeight="700" color="ink.900">
                {offers.length}
              </Text>
              <Text mt={1} fontSize="sm" color="ink.600">
                standardized offers currently available
              </Text>
            </Box>
            <Box p={4} borderRadius="22px" bg="rgba(15,17,23,0.04)">
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="brand.500">
                Merchants
              </Text>
              <Text mt={2} fontSize="2xl" fontWeight="700" color="ink.900">
                {merchantCount}
              </Text>
              <Text mt={1} fontSize="sm" color="ink.600">
                merchants currently represented
              </Text>
            </Box>
            <Box p={4} borderRadius="22px" bg="rgba(15,17,23,0.04)">
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="lime.700">
                Next step
              </Text>
              <Text mt={2} fontSize="lg" fontWeight="700" color="ink.900">
                Use Updates for change review
              </Text>
              <Text mt={1} fontSize="sm" color="ink.600">
                Review incoming changes on the updates page, then use this list as your clean source of truth.
              </Text>
            </Box>
          </SimpleGrid>
          <VStack align="start" mt={6} spacing={3}>
            <RouterLink to="/links" display="inline-flex" width="fit-content">
              Open updates
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
          </VStack>
        </SectionBox>

        <OfferCatalog
          offers={offers}
          networks={networks}
          activeNetwork={activeNetwork}
          onNetworkChange={setActiveNetwork}
        />
      </VStack>
    </RequireAuth>
  );
}
