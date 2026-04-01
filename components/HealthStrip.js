import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Icon,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react";
import { FaArrowUp, FaCheckCircle, FaClock, FaExclamationTriangle, FaSync } from "react-icons/fa";
import { HEALTH_STATUS } from "../lib/client/reviewState";

function getHealthTone(summary) {
  if (!summary) return HEALTH_STATUS.idle;
  if (summary.syncStatus === "partial_failure") return HEALTH_STATUS.partial_failure;
  if (summary.syncStatus === "failed") return HEALTH_STATUS.failed;
  if (summary.isStale) return HEALTH_STATUS.stale;
  if (summary.lastSuccessfulSyncAt) return HEALTH_STATUS.success;
  return HEALTH_STATUS.idle;
}

export default function HealthStrip({
  connectors,
  activeNetwork,
  onNetworkChange,
  onSync,
  syncing,
}) {
  const summary = connectors.find((entry) => entry.network === activeNetwork) || null;
  const tone = getHealthTone(summary);
  const statusIcon =
    tone.tone === "green"
      ? FaCheckCircle
      : tone.tone === "yellow"
        ? FaClock
        : tone.tone === "red" || tone.tone === "orange"
          ? FaExclamationTriangle
          : FaArrowUp;

  return (
    <Flex
      align={{ base: "stretch", lg: "center" }}
      justify="space-between"
      gap={4}
      px={{ base: 4, lg: 5 }}
      py={4}
      borderRadius="26px"
      border="1px solid rgba(15, 17, 23, 0.08)"
      bg="rgba(255,255,255,0.96)"
      boxShadow="0 16px 34px rgba(15, 17, 23, 0.07)"
      direction={{ base: "column", lg: "row" }}
    >
      <Stack direction={{ base: "column", md: "row" }} spacing={4} flex="1" align="flex-start">
        <HStack spacing={3} minW={{ lg: "220px" }}>
          <Flex
            width="36px"
            height="36px"
            borderRadius="full"
            align="center"
            justify="center"
            bg="rgba(15, 17, 23, 0.08)"
            color="ink.900"
          >
            <Icon as={statusIcon} boxSize={4} />
          </Flex>
          <Box>
            <Text fontSize="xs" letterSpacing="0.18em" textTransform="uppercase" color="brand.500">
              Sync health
            </Text>
            <Text fontWeight="700" color="ink.900">
              {tone.label}
            </Text>
          </Box>
        </HStack>
        <Divider orientation="vertical" borderColor="rgba(15,17,23,0.08)" display={{ base: "none", md: "block" }} h="42px" />
        <Box flex="1">
          <Text fontSize="sm" color="ink.700">
            {tone.message}
          </Text>
          <Text mt={1} fontSize="sm" color="ink.500">
            {summary?.lastSyncAt
              ? `Last sync: ${new Date(summary.lastSyncAt).toLocaleString()}.`
              : "No manual sync has been run yet."}
          </Text>
        </Box>
      </Stack>
      <HStack spacing={3} alignItems="center" flexWrap="wrap" justify="flex-end">
        <Badge
          px={3}
          py={1.5}
          borderRadius="full"
          bg="rgba(15, 17, 23, 0.08)"
          color="ink.800"
          fontWeight="700"
        >
          {activeNetwork.toUpperCase()}
        </Badge>
        <Select
          size="sm"
          width="160px"
          borderRadius="full"
          value={activeNetwork}
          onChange={(event) => onNetworkChange(event.target.value)}
          aria-label="Select source network"
        >
          {connectors.map((connector) => (
            <option key={connector.network} value={connector.network}>
              {connector.network.toUpperCase()}
            </option>
          ))}
        </Select>
        <Button
          size="sm"
          onClick={onSync}
          isLoading={syncing}
          loadingText="Syncing"
          leftIcon={<FaSync />}
          variant="accent"
        >
          Pull latest
        </Button>
      </HStack>
    </Flex>
  );
}
