import { VStack, Box, Text, Icon } from "@chakra-ui/react";
import RouterLink from "./RouterLink";
import Image from "next/image";
import logo from "../public/logo.svg";
import { FaNetworkWired, FaLink, FaTachometerAlt } from "react-icons/fa";

export default function Navigator({ ...rest }) {
  return (
    <VStack
      p={5}
      align="stretch"
      h="100%"
      spacing={3}
      width="200px"
      borderRight="1px solid #e5e5e5"
      {...rest}
    >
      <Box display="flex" mb={5}>
        <Image src={logo} alt="logo" width={30} height={30} />
        <Text ml={2} fontSize={20}>
          AffitaLinks
        </Text>
      </Box>

      <RouterLink to="/">
        <Icon as={FaTachometerAlt} />
        Home
      </RouterLink>

      <RouterLink to="/networks">
        <Icon as={FaNetworkWired} />
        Networks
      </RouterLink>

      <RouterLink to="/links">
        <Icon as={FaLink} />
        Links
      </RouterLink>
    </VStack>
  );
}
