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
      borderTop="1px solid rgba(15, 17, 23, 0.08)"
      gap={4}
      {...styles}
    >
      <Flex
        width="48px"
        height="48px"
        borderRadius="16px"
        bg="linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255, 240, 244, 0.68), rgba(236,255,255,0.6))"
        align="center"
        justify="center"
        border="1px solid rgba(15, 17, 23, 0.08)"
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
          bg="rgba(172, 232, 44, 0.16)"
          border="1px solid rgba(172, 232, 44, 0.24)"
        >
          <Text fontSize="xs" color="lime.800" fontWeight="700">
            Coming soon
          </Text>
        </Box>
      )}
    </Flex>
  );
}
