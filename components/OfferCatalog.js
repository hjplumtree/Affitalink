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
    <VStack align="stretch" spacing={4}>
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
        <HStack spacing={2} flexWrap="wrap">
          <Badge px={3} py={1.5} borderRadius="full" bg="rgba(15,17,23,0.06)" color="ink.700">
            {filteredOffers.length} offers
          </Badge>
          <Badge px={3} py={1.5} borderRadius="full" bg="rgba(139,77,255,0.10)" color="brand.700">
            {selectedOffers.length} selected
          </Badge>
        </HStack>
      </Flex>

      <Box
        border="1px solid rgba(15, 17, 23, 0.08)"
        borderRadius="24px"
        bg="rgba(255,255,255,0.94)"
        p={4}
      >
        <Flex
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          gap={3}
          direction={{ base: "column", md: "row" }}
        >
          <Box>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="brand.500">
              Publishing shortlist
            </Text>
            <Text mt={1} fontSize="sm" color="ink.600">
              Select the offers you want to move into the coupon site. `Updates` is for review, `Offers` is for picking what survives.
            </Text>
          </Box>
          <HStack spacing={2} flexWrap="wrap">
            <Button size="sm" variant="outline" onClick={() => copySelected("block")} isDisabled={selectedOffers.length === 0}>
              Copy selected block
            </Button>
            <Button size="sm" variant="outline" onClick={() => copySelected("json")} isDisabled={selectedOffers.length === 0}>
              Copy selected JSON
            </Button>
          </HStack>
        </Flex>
      </Box>

      <VStack align="stretch" spacing={3}>
        {filteredOffers.map((offer) => {
          const expandedMode = expandedModes[offer.id] || null;
          const isSelected = selectedIds.includes(offer.id);
          const payloadJson = JSON.stringify(buildOfferPayload(offer), null, 2);

          return (
            <Box
              key={offer.id}
              border="1px solid rgba(15, 17, 23, 0.08)"
              borderRadius="24px"
              bg={isSelected ? "rgba(139,77,255,0.06)" : "rgba(255,255,255,0.94)"}
              p={{ base: 4, lg: 5 }}
              boxShadow="0 12px 30px rgba(15,17,23,0.04)"
            >
              <VStack align="stretch" spacing={3}>
                <Flex
                  justify="space-between"
                  align={{ base: "stretch", lg: "start" }}
                  gap={3}
                  direction={{ base: "column", lg: "row" }}
                >
                  <Box minW={0} flex="1">
                    <HStack spacing={2} mb={2} flexWrap="wrap">
                      <Badge colorScheme="purple">{offer.network?.toUpperCase()}</Badge>
                      {offer.couponCode ? (
                        <Badge bg="rgba(139,77,255,0.10)" color="brand.700">
                          {offer.couponCode}
                        </Badge>
                      ) : (
                        <Badge bg="rgba(15,17,23,0.06)" color="ink.700">
                          No code
                        </Badge>
                      )}
                      <Badge bg="rgba(15,17,23,0.06)" color="ink.700">
                        {formatDate(offer.updatedAt || offer.lastSeenAt)}
                      </Badge>
                    </HStack>
                    <Text fontSize="lg" fontWeight="700" color="ink.900" noOfLines={1}>
                      {offer.merchantName}
                    </Text>
                    <Text mt={1} color="ink.800" fontWeight="600" noOfLines={2}>
                      {offer.title}
                    </Text>
                    {offer.description ? (
                      <Text mt={1} fontSize="sm" color="ink.600" noOfLines={2}>
                        {offer.description}
                      </Text>
                    ) : null}
                  </Box>

                  <Stack direction={{ base: "column", md: "row" }} spacing={2}>
                    <Button
                      size="sm"
                      variant={isSelected ? "accent" : "outline"}
                      onClick={() => onToggleSelect(offer.id)}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => copyValue(buildOfferCopyText(offer), "Offer block")}>
                      Copy block
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => copyValue(payloadJson, "Offer JSON")}>
                      Copy JSON
                    </Button>
                  </Stack>
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 4 }} spacing={3}>
                  <Box p={3} borderRadius="16px" bg="rgba(15,17,23,0.04)">
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="brand.500">
                      Coupon
                    </Text>
                    <HStack mt={2} justify="space-between" align="start">
                      <Text fontSize="sm" color="ink.800" fontWeight="600" noOfLines={2}>
                        {offer.couponCode || "No code needed"}
                      </Text>
                      <Button size="xs" variant="ghost" onClick={() => copyValue(offer.couponCode || "No code needed", "Coupon code")}>
                        Copy
                      </Button>
                    </HStack>
                  </Box>
                  <Box p={3} borderRadius="16px" bg="rgba(15,17,23,0.04)">
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="brand.500">
                      Starts
                    </Text>
                    <Text mt={2} fontSize="sm" color="ink.800">
                      {formatDate(offer.startsAt)}
                    </Text>
                  </Box>
                  <Box p={3} borderRadius="16px" bg="rgba(15,17,23,0.04)">
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="brand.500">
                      Ends
                    </Text>
                    <Text mt={2} fontSize="sm" color="ink.800">
                      {formatDate(offer.endsAt)}
                    </Text>
                  </Box>
                  <Box p={3} borderRadius="16px" bg="rgba(15,17,23,0.04)">
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="brand.500">
                      Links
                    </Text>
                    <Stack mt={2} direction="row" spacing={2} flexWrap="wrap">
                      {offer.destinationUrl ? (
                        <Button size="xs" variant="ghost" onClick={() => copyValue(offer.destinationUrl, "Destination URL")}>
                          Copy destination
                        </Button>
                      ) : null}
                      {offer.sourceUrl ? (
                        <Button size="xs" variant="ghost" onClick={() => copyValue(offer.sourceUrl, "Source URL")}>
                          Copy source
                        </Button>
                      ) : null}
                    </Stack>
                  </Box>
                </SimpleGrid>

                <HStack spacing={2} flexWrap="wrap">
                  <Button size="xs" variant={expandedMode === "block" ? "accent" : "outline"} onClick={() => toggleExpandedMode(offer.id, "block")}>
                    {expandedMode === "block" ? "Hide block" : "Show block"}
                  </Button>
                  <Button size="xs" variant={expandedMode === "json" ? "accent" : "outline"} onClick={() => toggleExpandedMode(offer.id, "json")}>
                    {expandedMode === "json" ? "Hide JSON" : "Show JSON"}
                  </Button>
                  {offer.destinationUrl ? (
                    <Button as={Link} href={offer.destinationUrl} isExternal size="xs" variant="outline">
                      Open destination
                    </Button>
                  ) : null}
                  {offer.sourceUrl ? (
                    <Button as={Link} href={offer.sourceUrl} isExternal size="xs" variant="outline">
                      Open source
                    </Button>
                  ) : null}
                </HStack>

                {expandedMode === "block" ? (
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    borderRadius="18px"
                    p={4}
                    bg="rgba(24, 34, 47, 0.04)"
                    color="ink.800"
                  >
                    {buildOfferCopyText(offer)}
                  </Code>
                ) : null}

                {expandedMode === "json" ? (
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    borderRadius="18px"
                    p={4}
                    bg="rgba(24, 34, 47, 0.04)"
                    color="ink.800"
                  >
                    {payloadJson}
                  </Code>
                ) : null}
              </VStack>
            </Box>
          );
        })}
      </VStack>
    </VStack>
  );
}
