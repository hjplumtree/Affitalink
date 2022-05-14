import { VStack, Box, Text, Icon, Flex } from "@chakra-ui/react";
import RouterLink from "./RouterLink";
import Image from "next/image";
import logo from "../public/logo.svg";
import {
  FaBars,
  FaNetworkWired,
  FaLink,
  FaTachometerAlt,
  FaArrowCircleLeft,
  FaArrowCircleRight,
} from "react-icons/fa";
import { useState } from "react";

export default function Navigator({ ...styles }) {
  const [burgerMenuOpen, setBurgerMenuOpen] = useState(false);
  return (
    <VStack
      align={{ base: burgerMenuOpen || "center", lg: "stretch" }}
      h="100%"
      pt={4}
      pr={8}
      pb={4}
      pl={4}
      spacing={3}
      bg="#fff"
      borderRight="1px solid #e5e5e5"
      width={{ base: burgerMenuOpen ? "220px" : "70px", lg: "220px" }}
      {...styles}
    >
      <Box display="flex" mb={7}>
        <Image src={logo} alt="logo" width={30} height={30} />
        <Text
          display={{ base: burgerMenuOpen || "none", lg: "inline-block" }}
          ml={2}
          fontSize={20}
        >
          AffitaLink
        </Text>
      </Box>

      <Box>
        <Box as={Flex} align="center">
          <RouterLink to="/" width="100%">
            <Icon as={FaTachometerAlt} />
            <Text
              display={{ base: burgerMenuOpen || "none", lg: "inline-block" }}
            >
              Home
            </Text>
          </RouterLink>
          <Icon
            w="22px"
            h="22px"
            as={burgerMenuOpen ? FaArrowCircleLeft : FaArrowCircleRight}
            position="absolute"
            right="-10px"
            color="#95AFC4"
            display={{ lg: "none" }}
            cursor="pointer"
            onClick={() => {
              setBurgerMenuOpen((menu) => !menu);
            }}
            _hover={{ color: "#000" }}
          />
        </Box>

        <Text
          display={{ base: burgerMenuOpen || "none", lg: "inline-block" }}
          mt={4}
          mb={2}
          fontSize="sm"
          color="#95AFC4"
        >
          CONNECT
        </Text>
        <RouterLink to="/networks" mt={{ base: burgerMenuOpen || 3, lg: 0 }}>
          <Icon as={FaNetworkWired} />
          <Text
            display={{ base: burgerMenuOpen || "none", lg: "inline-block" }}
          >
            Networks
          </Text>
        </RouterLink>

        <Text
          display={{ base: burgerMenuOpen || "none", lg: "inline-block" }}
          mt={4}
          mb={2}
          fontSize="sm"
          color="#95AFC4"
        >
          COPY
        </Text>
        <RouterLink to="/links" mt={{ base: burgerMenuOpen || 3, lg: 0 }}>
          <Icon as={FaLink} />
          <Text
            display={{ base: burgerMenuOpen || "none", lg: "inline-block" }}
          >
            Links
          </Text>
        </RouterLink>
      </Box>
    </VStack>
  );
}
