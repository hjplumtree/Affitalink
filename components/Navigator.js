import { VStack, Box, Text, Icon, Flex } from "@chakra-ui/react";
import RouterLink from "./RouterLink";
import Image from "next/image";
import logo from "../public/logo.svg";
import {
  FaNetworkWired,
  FaLink,
  FaHome,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useState } from "react";

export default function Navigator({ ...styles }) {
  const [burgerMenuOpen, setBurgerMenuOpen] = useState(false);
  return (
    <VStack
      alignItems="center"
      h="100%"
      p={2}
      pt={3}
      spacing={3}
      bg="#fff"
      borderRight="1px solid #e5e5e5"
      width={{ base: burgerMenuOpen ? "210px" : "55px", lg: "210px" }}
      {...styles}
      zIndex={100}
    >
      <Box display="flex" mb={7} alignItems="center" width="100%">
        <Image src={logo} alt="logo" width="33px" height="33px" />
        <Text
          display={{ base: burgerMenuOpen || "none", lg: "inline-block" }}
          ml={2}
          fontSize={20}
        >
          AffitaLink
        </Text>

        <Icon
          w="24px"
          h="24px"
          p="6px"
          as={burgerMenuOpen ? FaChevronLeft : FaChevronRight}
          position="absolute"
          right="-17px"
          bg={"#fff"}
          color="#000"
          border="1px solid #e5e5e5"
          borderRadius="50%"
          display={{ lg: "none" }}
          cursor="pointer"
          onClick={() => {
            setBurgerMenuOpen((menu) => !menu);
          }}
          _hover={{ bg: "#D6E0E8" }}
        />
      </Box>

      <Box w="100%">
        <Box as={Flex} align="center">
          <RouterLink
            to="/"
            width="100%"
            justifyContent={{
              base: burgerMenuOpen ? "stretch" : "center",
              lg: "stretch",
            }}
          >
            <Icon width="18px" height="18px" as={FaHome} />
            <Text
              display={{ base: burgerMenuOpen || "none", lg: "inline-block" }}
            >
              Home
            </Text>
          </RouterLink>
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
          <Icon
            width="18px"
            height="18px"
            as={FaNetworkWired}
            justifyContent={{
              base: burgerMenuOpen ? "stretch" : "center",
              lg: "stretch",
            }}
          />
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
          <Icon
            width="18px"
            height="18px"
            as={FaLink}
            justifyContent={{
              base: burgerMenuOpen ? "stretch" : "center",
              lg: "stretch",
            }}
          />
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
