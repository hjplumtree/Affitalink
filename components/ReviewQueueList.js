import { Badge, Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { REVIEW_ITEM_STATE } from "../lib/client/reviewState";

export default function ReviewQueueList({ items, selectedId, onSelect }) {
  if (items.length === 0) {
    return (
      <Box
        border="1px solid rgba(103, 77, 55, 0.16)"
        borderRadius="28px"
        p={{ base: 5, lg: 6 }}
        bg="rgba(255, 251, 246, 0.9)"
      >
        <Text
          fontSize="xs"
          fontWeight="700"
          letterSpacing="0.18em"
          textTransform="uppercase"
          color="sand.700"
        >
          Queue clear
        </Text>
        <Text mt={3} fontSize="2xl" fontWeight="700" letterSpacing="-0.03em" color="ink.900">
          All caught up
        </Text>
        <Text color="ink.600" mt={2} maxW="42ch">
          No review items are waiting right now. Run a manual sync when you want a fresh pass
          across your monitored merchants.
        </Text>
      </Box>
    );
  }

  return (
    <Box
      border="1px solid rgba(103, 77, 55, 0.16)"
      borderRadius="28px"
      bg="rgba(255, 251, 246, 0.9)"
      overflow="hidden"
    >
      <Flex
        align={{ base: "start", md: "center" }}
        justify="space-between"
        gap={3}
        px={{ base: 4, lg: 5 }}
        py={4}
        borderBottom="1px solid rgba(103, 77, 55, 0.12)"
        direction={{ base: "column", md: "row" }}
      >
        <Box>
          <Text fontSize="xs" fontWeight="700" letterSpacing="0.18em" textTransform="uppercase" color="sand.700">
            Attention queue
          </Text>
          <Text mt={1} fontSize="lg" fontWeight="700" color="ink.900">
            Review the most meaningful changes first
          </Text>
        </Box>
        <Badge
          alignSelf={{ base: "start", md: "center" }}
          px={3}
          py={1.5}
          borderRadius="full"
          bg="rgba(24, 34, 47, 0.06)"
          color="ink.700"
        >
          {items.length} waiting
        </Badge>
      </Flex>
      <VStack align="stretch" spacing={0}>
      {items.map((item) => {
        const state = REVIEW_ITEM_STATE[item.changeType] || REVIEW_ITEM_STATE.changed;
        const isSelected = item.id === selectedId;
        return (
          <Box
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(item.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(item.id);
              }
            }}
            borderTop="1px solid rgba(103, 77, 55, 0.08)"
            bg={isSelected ? "rgba(31, 106, 91, 0.1)" : "transparent"}
            px={{ base: 4, lg: 5 }}
            py={4}
            cursor="pointer"
            transition="background 160ms ease"
            _hover={{ bg: isSelected ? "rgba(31, 106, 91, 0.12)" : "rgba(255,255,255,0.64)" }}
          >
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={1} flex="1">
                <HStack spacing={2}>
                  <Badge
                    px={2.5}
                    py={1}
                    borderRadius="full"
                    colorScheme={state.tone}
                  >
                    {state.eyebrow}
                  </Badge>
                  <Text fontSize="xs" color="ink.500" letterSpacing="0.12em" textTransform="uppercase">
                    {item.connector?.toUpperCase()}
                  </Text>
                </HStack>
                <Text fontWeight="700" fontSize="md" color="ink.900" noOfLines={1}>
                  {item.merchantName}
                </Text>
                <Text fontSize="sm" color="ink.700" noOfLines={1}>
                  {item.title}
                </Text>
                <Text fontSize="xs" color="ink.500" noOfLines={1}>
                  {item.reason}
                </Text>
              </VStack>
              <Text fontSize="xs" color="ink.500" whiteSpace="nowrap">
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </HStack>
          </Box>
        );
      })}
      </VStack>
    </Box>
  );
}
