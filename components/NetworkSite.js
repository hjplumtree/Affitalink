import { Flex, Box, Text, Heading } from "@chakra-ui/react";
import RouterLink from "./RouterLink";
import Image from "next/image";

export default function NetworkSite({ imageUrl, name, subtitle, endpoint }) {
  return (
    <Flex alignItems="center">
      <Image src={imageUrl} alt={name} width={30} height={30} />
      <Box marginLeft={3}>
        <Text>
          <strong>{name}</strong>
        </Text>
        <Text>{subtitle}</Text>
      </Box>
      <Flex marginLeft="auto" bg="#4895ef" color="#fff" borderRadius={5}>
        <RouterLink to={`/networks/${endpoint}`}>Connect</RouterLink>
      </Flex>
    </Flex>
  );
}
