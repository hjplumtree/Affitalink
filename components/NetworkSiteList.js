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
      p={5}
      borderTop="1px solid rgba(15, 17, 23, 0.08)"
      gap={4}
      transition="background 180ms ease"
      _hover={{ bg: "rgba(15,17,23,0.025)" }}
      {...styles}
    >
      <Flex
        width="48px"
        height="48px"
        borderRadius="16px"
        bg="rgba(15,17,23,0.04)"
        align="center"
        justify="center"
        border="1px solid rgba(15, 17, 23, 0.08)"
      >
        <Image src={imageUrl} alt={name} width={30} height={30} />
      </Flex>
      <Box marginLeft={1}>
        <Text fontWeight="700" color="ink.900" fontSize="lg">
          {name}
        </Text>
        <Text fontSize="sm" color="ink.600">
          {subtitle}
        </Text>
      </Box>
      {endpoint ? (
        <RouterLink to={`/networks/${endpoint}`} marginLeft="auto" border="1px solid rgba(15,17,23,0.08)">
          Configure
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
