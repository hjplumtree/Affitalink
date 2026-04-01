import { Flex, Box, Text } from "@chakra-ui/react";
import RouterLink from "./RouterLink";
import Image from "next/image";

export default function NetworkSiteList({
  imageUrl,
  name,
  subtitle,
  endpoint,
  ...styles
}) {
  return (
    <Flex
      alignItems="center"
      p={4}
      borderTop="1px solid rgba(103, 77, 55, 0.1)"
      gap={4}
      {...styles}
    >
      <Flex
        width="48px"
        height="48px"
        borderRadius="16px"
        bg="rgba(255,255,255,0.82)"
        align="center"
        justify="center"
        border="1px solid rgba(103, 77, 55, 0.12)"
      >
        <Image src={imageUrl} alt={name} width={30} height={30} />
      </Flex>
      <Box marginLeft={1}>
        <Text fontWeight="700" color="ink.900">
          {name}
        </Text>
        <Text fontSize="sm" color="ink.600">
          {subtitle}
        </Text>
      </Box>
      {endpoint ? (
        <RouterLink to={`/networks/${endpoint}`} marginLeft="auto">
          Open
        </RouterLink>
      ) : (
        <Box
          p={2}
          borderRadius={999}
          marginLeft="auto"
          bg="rgba(31, 106, 91, 0.08)"
          border="1px solid rgba(31, 106, 91, 0.12)"
        >
          <Text fontSize="xs" color="brand.700" fontWeight="700">
            Coming soon
          </Text>
        </Box>
      )}
    </Flex>
  );
}
