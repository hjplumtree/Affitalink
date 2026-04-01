import {
  Badge,
  Box,
  Button,
  Code,
  Divider,
  HStack,
  IconButton,
  Link,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa";
import { REVIEW_ITEM_STATE } from "../lib/client/reviewState";

function DiffRow({ label, beforeValue, afterValue }) {
  return (
    <Box>
      <Text fontSize="xs" textTransform="uppercase" color="brand.500" mb={2} letterSpacing="0.16em">
        {label}
      </Text>
      <Stack direction={{ base: "column", md: "row" }} spacing={3}>
        <Box
          flex="1"
          border="1px solid rgba(15, 17, 23, 0.10)"
          borderRadius="18px"
          p={4}
          bg="rgba(24, 34, 47, 0.03)"
        >
          <Text fontSize="xs" color="ink.500" mb={1}>
            Before
          </Text>
          <Text fontSize="sm" color="ink.800">
            {beforeValue || "—"}
          </Text>
        </Box>
        <Box
          flex="1"
          border="1px solid rgba(139, 77, 255, 0.16)"
          borderRadius="18px"
          p={4}
          bg="rgba(139, 77, 255, 0.08)"
        >
          <Text fontSize="xs" color="ink.500" mb={1}>
            After
          </Text>
          <Text fontSize="sm" color="ink.900">
            {afterValue || "—"}
          </Text>
        </Box>
      </Stack>
    </Box>
  );
}

export default function ReviewDetailPane({ item, onAction, acting, showBack, onBack }) {
  if (!item) {
    return (
      <Box
        border="1px solid rgba(15, 17, 23, 0.08)"
        borderRadius="30px"
        p={{ base: 5, lg: 6 }}
        bg="rgba(255, 255, 255, 0.92)"
        minH="520px"
      >
        <Text fontSize="xs" fontWeight="700" letterSpacing="0.18em" textTransform="uppercase" color="brand.500">
          Detail pane
        </Text>
        <Text mt={3} fontSize="2xl" fontWeight="700" color="ink.900">
          Review a flagged item
        </Text>
        <Text color="ink.600" mt={2} maxW="46ch">
          Select a change from the queue to inspect what changed, why it was surfaced,
          and what to do next.
        </Text>
      </Box>
    );
  }

  const state = REVIEW_ITEM_STATE[item.changeType] || REVIEW_ITEM_STATE.changed;
  const beforeSnapshot = item.beforeSnapshot || {};
  const afterSnapshot = item.afterSnapshot || {};

  return (
    <Box
      border="1px solid rgba(15, 17, 23, 0.08)"
      borderRadius="30px"
      p={{ base: 5, lg: 6 }}
      bg="rgba(255,255,255,0.96)"
      minH="520px"
      boxShadow="0 24px 64px rgba(15, 17, 23, 0.06)"
    >
      <VStack align="stretch" spacing={5}>
        <VStack align="start" spacing={2}>
          {showBack ? (
            <IconButton
              aria-label="Back to queue"
              icon={<FaArrowLeft />}
              variant="ghost"
              size="md"
              borderRadius="full"
              onClick={onBack}
            />
          ) : null}
          <HStack spacing={2}>
            <Badge px={2.5} py={1} borderRadius="full" colorScheme={state.tone}>
              {state.eyebrow}
            </Badge>
            <Badge px={2.5} py={1} borderRadius="full" bg="rgba(24, 34, 47, 0.06)" color="ink.700">
              {item.connector?.toUpperCase()}
            </Badge>
          </HStack>
          <Text fontSize={{ base: "2xl", lg: "3xl" }} fontWeight="700" letterSpacing="-0.03em" color="ink.900">
            {item.merchantName}
          </Text>
          <Text color="ink.700" fontSize="md">
            {item.title}
          </Text>
        </VStack>

        <Box p={4} borderRadius="22px" bg="rgba(15,17,23,0.03)">
          <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="brand.500" mb={2}>
            Decision brief
          </Text>
          <Text fontSize="lg" fontWeight="600" mb={2} color="ink.900">
            Why this hit the queue
          </Text>
          <Text color="ink.700">{item.reason}</Text>
          <HStack spacing={2} mt={2}>
            <Badge colorScheme={state.tone}>Confidence: {item.confidence}</Badge>
            <Badge bg="rgba(24, 34, 47, 0.06)" color="ink.700">
              Created {new Date(item.createdAt).toLocaleString()}
            </Badge>
          </HStack>
        </Box>

        <Divider borderColor="rgba(15, 17, 23, 0.08)" />
        <VStack align="stretch" spacing={3}>
          <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="brand.500">
            What changed
          </Text>
          <DiffRow
            label="Coupon code"
            beforeValue={beforeSnapshot.couponCode}
            afterValue={afterSnapshot.couponCode}
          />
          <DiffRow
            label="Title"
            beforeValue={beforeSnapshot.title}
            afterValue={afterSnapshot.title}
          />
          <DiffRow
            label="Destination"
            beforeValue={beforeSnapshot.destinationUrl}
            afterValue={afterSnapshot.destinationUrl}
          />
        </VStack>

        <Box p={4} borderRadius="22px" bg="rgba(15,17,23,0.03)">
          <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="brand.500" mb={2}>
            Source evidence
          </Text>
          <Text fontSize="lg" fontWeight="600" mb={2} color="ink.900">
            Verify before approving
          </Text>
          <Text fontSize="sm" color="ink.700">
            Latest seen: {afterSnapshot.lastSeenAt || "Unknown"}
          </Text>
          {afterSnapshot.sourceUrl ? (
            <Link href={afterSnapshot.sourceUrl} color="brand.600" isExternal fontWeight="600">
              Open source link
            </Link>
          ) : null}
          {afterSnapshot.destinationUrl ? (
            <Code
              display="block"
              mt={3}
              whiteSpace="pre-wrap"
              borderRadius="18px"
              p={4}
              bg="rgba(24, 34, 47, 0.04)"
              color="ink.800"
            >
              {afterSnapshot.destinationUrl}
            </Code>
          ) : null}
        </Box>

        <HStack spacing={3} pt={2}>
          <Button
            onClick={() => onAction("approve")}
            isLoading={acting === "approve"}
            variant="accent"
          >
            Approve update
          </Button>
          <Button
            variant="outline"
            colorScheme="red"
            onClick={() => onAction("dismiss")}
            isLoading={acting === "dismiss"}
          >
            Dismiss change
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
