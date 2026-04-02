import {
  Badge,
  Box,
  Button,
  Code,
  Flex,
  HStack,
  Input,
  Link,
  Select,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";

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

export default function OfferCatalog({ offers, networks, activeNetwork, onNetworkChange }) {
  const [search, setSearch] = useState("");
  const toast = useToast();

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

  if (offers.length === 0) {
    return (
      <Box
        border="1px solid rgba(15, 17, 23, 0.08)"
        borderRadius="30px"
        p={{ base: 5, lg: 6 }}
        bg="rgba(255,255,255,0.92)"
      >
        <Text fontSize="xs" fontWeight="700" letterSpacing="0.18em" textTransform="uppercase" color="brand.500">
          No offers yet
        </Text>
        <Text mt={3} fontSize="2xl" fontWeight="700" color="ink.900">
          Connect a source and run a sync first
        </Text>
        <Text mt={2} color="ink.600" maxW="44ch">
          This page will show your standardized coupon and sale data after the first successful update check.
        </Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={5}>
      <Flex
        align={{ base: "stretch", lg: "center" }}
        justify="space-between"
        gap={3}
        direction={{ base: "column", lg: "row" }}
      >
        <Stack direction={{ base: "column", md: "row" }} spacing={3}>
          <Select
            value={activeNetwork}
            onChange={(event) => onNetworkChange(event.target.value)}
            width={{ base: "100%", md: "180px" }}
            borderRadius="full"
            aria-label="Filter offers by source"
          >
            <option value="all">All sources</option>
            {networks.map((network) => (
              <option key={network} value={network}>
                {network.toUpperCase()}
              </option>
            ))}
          </Select>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search merchant, title, or coupon"
            borderRadius="full"
            width={{ base: "100%", md: "320px" }}
          />
        </Stack>
        <Badge px={3} py={1.5} borderRadius="full" bg="rgba(15,17,23,0.06)" color="ink.700">
          {filteredOffers.length} offers
        </Badge>
      </Flex>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4}>
        {filteredOffers.map((offer) => (
          <Box
            key={offer.id}
            border="1px solid rgba(15, 17, 23, 0.08)"
            borderRadius="28px"
            bg="rgba(255,255,255,0.94)"
            p={{ base: 5, lg: 6 }}
            boxShadow="0 18px 44px rgba(15,17,23,0.05)"
          >
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between" align="start">
                <Box>
                  <HStack spacing={2} mb={2}>
                    <Badge colorScheme="purple">{offer.network?.toUpperCase()}</Badge>
                    {offer.couponCode ? (
                      <Badge bg="rgba(139,77,255,0.10)" color="brand.700">
                        {offer.couponCode}
                      </Badge>
                    ) : null}
                  </HStack>
                  <Text fontSize="lg" fontWeight="700" color="ink.900">
                    {offer.merchantName}
                  </Text>
                  <Text mt={1} color="ink.800" fontWeight="600">
                    {offer.title}
                  </Text>
                </Box>
                <Text fontSize="xs" color="ink.500" textAlign="right">
                  Updated
                  <br />
                  {formatDate(offer.updatedAt || offer.lastSeenAt)}
                </Text>
              </HStack>

              {offer.description ? (
                <Text fontSize="sm" color="ink.600" noOfLines={3}>
                  {offer.description}
                </Text>
              ) : null}

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <Box p={3} borderRadius="18px" bg="rgba(15,17,23,0.04)">
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="brand.500">
                    Coupon code
                  </Text>
                  <HStack mt={2} justify="space-between" align="start">
                    <Text fontSize="sm" color="ink.800" fontWeight="600" noOfLines={2}>
                      {offer.couponCode || "No code needed"}
                    </Text>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => copyValue(offer.couponCode || "No code needed", "Coupon code")}
                    >
                      Copy
                    </Button>
                  </HStack>
                </Box>
                <Box p={3} borderRadius="18px" bg="rgba(15,17,23,0.04)">
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="brand.500">
                    Merchant
                  </Text>
                  <HStack mt={2} justify="space-between" align="start">
                    <Text fontSize="sm" color="ink.800" fontWeight="600" noOfLines={2}>
                      {offer.merchantName}
                    </Text>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => copyValue(offer.merchantName, "Merchant")}
                    >
                      Copy
                    </Button>
                  </HStack>
                </Box>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <Box p={3} borderRadius="18px" bg="rgba(15,17,23,0.04)">
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="brand.500">
                    Starts
                  </Text>
                  <Text mt={1} fontSize="sm" color="ink.800">
                    {formatDate(offer.startsAt)}
                  </Text>
                </Box>
                <Box p={3} borderRadius="18px" bg="rgba(15,17,23,0.04)">
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="brand.500">
                    Ends
                  </Text>
                  <Text mt={1} fontSize="sm" color="ink.800">
                    {formatDate(offer.endsAt)}
                  </Text>
                </Box>
              </SimpleGrid>

              <Box p={4} borderRadius="22px" bg="rgba(15,17,23,0.03)">
                <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={3} direction={{ base: "column", md: "row" }}>
                  <Box>
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="brand.500">
                      Copy-ready data
                    </Text>
                    <Text mt={1} fontSize="sm" color="ink.600">
                      Use this offer as raw input for docs, sheets, CMS entries, or prompts.
                    </Text>
                  </Box>
                  <HStack spacing={2} flexWrap="wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyValue(buildOfferCopyText(offer), "Offer block")}
                    >
                      Copy block
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copyValue(JSON.stringify(buildOfferPayload(offer), null, 2), "Offer JSON")
                      }
                    >
                      Copy JSON
                    </Button>
                  </HStack>
                </Flex>
                <Code
                  display="block"
                  mt={3}
                  whiteSpace="pre-wrap"
                  borderRadius="18px"
                  p={4}
                  bg="rgba(24, 34, 47, 0.04)"
                  color="ink.800"
                >
                  {JSON.stringify(buildOfferPayload(offer), null, 2)}
                </Code>
              </Box>

              <Stack direction={{ base: "column", md: "row" }} spacing={3}>
                {offer.destinationUrl ? (
                  <Button
                    variant="outline"
                    width={{ base: "100%", md: "fit-content" }}
                    onClick={() => copyValue(offer.destinationUrl, "Destination URL")}
                  >
                    Copy destination
                  </Button>
                ) : null}
                {offer.destinationUrl ? (
                  <Button
                    as={Link}
                    href={offer.destinationUrl}
                    isExternal
                    variant="accent"
                    width={{ base: "100%", md: "fit-content" }}
                  >
                    Open destination
                  </Button>
                ) : null}
                {offer.sourceUrl ? (
                  <Button
                    variant="outline"
                    width={{ base: "100%", md: "fit-content" }}
                    onClick={() => copyValue(offer.sourceUrl, "Source URL")}
                  >
                    Copy source
                  </Button>
                ) : null}
                {offer.sourceUrl ? (
                  <Button
                    as={Link}
                    href={offer.sourceUrl}
                    isExternal
                    variant="outline"
                    width={{ base: "100%", md: "fit-content" }}
                  >
                    Open source
                  </Button>
                ) : null}
              </Stack>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </VStack>
  );
}
