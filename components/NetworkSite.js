import { Flex, Image, Box, Text } from "@chakra-ui/react";
import RouterLink from "./RouterLink";

export default function NetworkSite({ imageUrl, name, subtitle, endpoint }) {
  return (
    <Flex>
      <Image src={imageUrl} alt={name} witdth={30} height={30} />
      <Box>
        <Text>{name}</Text>
        <Text>{subtitle}</Text>
      </Box>
      <RouterLink to="/networks/add">Connect</RouterLink>
    </Flex>
  );
}
