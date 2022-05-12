import { VStack, Box, Text, Icon } from "@chakra-ui/react";
import RouterLink from "./RouterLink";
import Image from "next/image";
import logo from "../public/logo.svg";
import { FaNetworkWired, FaLink, FaTachometerAlt } from "react-icons/fa";

export default function Navigator({ ...styles }) {
  return (
    <VStack
      align="stretch"
      h="100%"
      p={5}
      spacing={3}
      borderRight="1px solid #e5e5e5"
      width="clamp(200px, 100%, 220px)"
      {...styles}
    >
      <Box display="flex" mb={7}>
        <Image src={logo} alt="logo" width={30} height={30} />
        <Text ml={2} fontSize={20}>
          AffitaLink
        </Text>
      </Box>

      <Box>
        <RouterLink to="/">
          <Icon as={FaTachometerAlt} />
          Home
        </RouterLink>

        <Text mt={4} mb={2} fontSize="sm" color="#95AFC4">
          CONNECT
        </Text>
        <RouterLink to="/networks">
          <Icon as={FaNetworkWired} />
          Networks
        </RouterLink>

        <Text mt={4} mb={2} fontSize="sm" color="#95AFC4">
          COPY
        </Text>
        <RouterLink to="/links">
          <Icon as={FaLink} />
          Links
        </RouterLink>
      </Box>
    </VStack>
  );
}
