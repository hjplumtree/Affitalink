import { VStack, Box, Text, Icon, Flex, HStack, Divider } from "@chakra-ui/react";
import RouterLink from "./RouterLink";
import Image from "next/image";
import logo from "../public/logo.svg";
import {
  FaNetworkWired,
  FaLink,
  FaHome,
  FaTags,
  FaChevronLeft,
  FaChevronRight,
  FaSignInAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { useState } from "react";
import { useOptionalAuth } from "./AuthProvider";

export default function Navigator({ ...styles }) {
  const [burgerMenuOpen, setBurgerMenuOpen] = useState(false);
  const auth = useOptionalAuth();
  const user = auth?.user || null;
  const signOut = auth?.signOut || (async () => {});
  return (
    <VStack
      alignItems="stretch"
      h="100%"
      p={3}
      pt={4}
      spacing={4}
      bg="#12131a"
      borderRight="1px solid rgba(255, 255, 255, 0.06)"
      backdropFilter="blur(18px)"
      width={{ base: burgerMenuOpen ? "210px" : "55px", lg: "210px" }}
      {...styles}
      zIndex={100}
    >
      <Box display="flex" mb={5} alignItems="center" width="100%" position="relative">
        <HStack spacing={3}>
          <Box
            width="40px"
            height="40px"
            borderRadius="16px"
            bg="rgba(255,255,255,0.06)"
            border="1px solid rgba(255, 255, 255, 0.10)"
            display="grid"
            placeItems="center"
          >
            <Image src={logo} alt="logo" width="24px" height="24px" />
          </Box>
          <Box display={{ base: burgerMenuOpen ? "block" : "none", lg: "block" }}>
            <Text fontSize="lg" fontWeight="700" letterSpacing="-0.03em" color="white">
              AffitaLink
            </Text>
            <Text fontSize="xs" color="rgba(255,255,255,0.76)">
              Affiliate offers dashboard
            </Text>
          </Box>
        </HStack>

        <Icon
          w="24px"
          h="24px"
          p="6px"
          as={burgerMenuOpen ? FaChevronLeft : FaChevronRight}
          position="absolute"
          right="-17px"
          bg="rgba(21, 25, 38, 0.98)"
          color="white"
          border="1px solid rgba(255, 255, 255, 0.12)"
          borderRadius="50%"
          display={{ lg: "none" }}
          cursor="pointer"
          onClick={() => {
            setBurgerMenuOpen((menu) => !menu);
          }}
          _hover={{ bg: "white" }}
        />
      </Box>

      <Box w="100%">
        <Text
          display={{ base: burgerMenuOpen ? "block" : "none", lg: "block" }}
          fontSize="xs"
          color="rgba(255,255,255,0.78)"
          lineHeight="1.5"
          mb={4}
          px={3}
        >
          Collect offers from affiliate networks and keep them in one format.
        </Text>
        <Box
          display={{ base: burgerMenuOpen ? "block" : "none", lg: "block" }}
          mx={3}
          mb={4}
          p={3}
          borderRadius="18px"
          bg="rgba(255,255,255,0.05)"
          border="1px solid rgba(255,255,255,0.10)"
        >
          <Text fontSize="10px" color="rgba(255,255,255,0.62)" letterSpacing="0.16em" textTransform="uppercase">
            Workspace
          </Text>
          <Text mt={1} fontSize="sm" color="white" fontWeight="700">
            Sync sources, check updates, publish cleaner offer data.
          </Text>
        </Box>
        <Divider borderColor="whiteAlpha.200" mb={4} />
        <Box as={Flex} align="center">
          <RouterLink
            to="/"
            width="100%"
            justifyContent={{
              base: burgerMenuOpen ? "stretch" : "center",
              lg: "stretch",
            }}
            color="whiteAlpha.900"
            _hover={{ bg: "rgba(255,255,255,0.08)" }}
          >
            <Icon width="18px" height="18px" as={FaHome} />
            <Text
              display={{ base: burgerMenuOpen ? "inline-block" : "none", lg: "inline-block" }}
            >
              Overview
            </Text>
          </RouterLink>
        </Box>

        <Text
          display={{ base: burgerMenuOpen ? "inline-block" : "none", lg: "inline-block" }}
          mt={4}
          mb={2}
          fontSize="xs"
          color="rgba(255,255,255,0.54)"
          letterSpacing="0.18em"
          fontWeight="700"
        >
          SETUP
        </Text>
        <RouterLink
          to="/networks"
          mt={{ base: burgerMenuOpen ? 3 : 0, lg: 0 }}
          color="whiteAlpha.900"
          _hover={{ bg: "rgba(255,255,255,0.08)" }}
        >
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
            display={{ base: burgerMenuOpen ? "inline-block" : "none", lg: "inline-block" }}
          >
            Sources
          </Text>
        </RouterLink>

        <Text
          display={{ base: burgerMenuOpen ? "inline-block" : "none", lg: "inline-block" }}
          mt={4}
          mb={2}
          fontSize="xs"
          color="rgba(255,255,255,0.54)"
          letterSpacing="0.18em"
          fontWeight="700"
        >
          OFFERS
        </Text>
        <RouterLink
          to="/offers"
          mt={{ base: burgerMenuOpen ? 3 : 0, lg: 0 }}
          color="whiteAlpha.900"
          _hover={{ bg: "rgba(255,255,255,0.08)" }}
        >
          <Icon
            width="18px"
            height="18px"
            as={FaTags}
            justifyContent={{
              base: burgerMenuOpen ? "stretch" : "center",
              lg: "stretch",
            }}
          />
          <Text
            display={{ base: burgerMenuOpen ? "inline-block" : "none", lg: "inline-block" }}
          >
            Offers
          </Text>
        </RouterLink>
        <RouterLink
          to="/links"
          mt={3}
          color="whiteAlpha.900"
          _hover={{ bg: "rgba(255,255,255,0.08)" }}
        >
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
            display={{ base: burgerMenuOpen ? "inline-block" : "none", lg: "inline-block" }}
            >
            Updates
          </Text>
        </RouterLink>

        <Text
          display={{ base: burgerMenuOpen ? "inline-block" : "none", lg: "inline-block" }}
          mt={4}
          mb={2}
          fontSize="xs"
          color="rgba(255,255,255,0.54)"
          letterSpacing="0.18em"
          fontWeight="700"
        >
          ACCOUNT
        </Text>
        {user ? (
          <Box
            as="button"
            width="100%"
            textAlign="left"
            onClick={signOut}
            p={3}
            borderRadius={14}
            color="whiteAlpha.900"
            _hover={{ bg: "rgba(255,255,255,0.08)" }}
          >
            <Flex align="center" gap={3}>
              <Icon width="18px" height="18px" as={FaSignOutAlt} />
              <Text display={{ base: burgerMenuOpen ? "inline-block" : "none", lg: "inline-block" }}>
                Sign out
              </Text>
            </Flex>
          </Box>
        ) : (
          <RouterLink
            to="/login"
            mt={{ base: burgerMenuOpen ? 3 : 0, lg: 0 }}
            color="whiteAlpha.900"
            _hover={{ bg: "rgba(255,255,255,0.08)" }}
          >
            <Icon width="18px" height="18px" as={FaSignInAlt} />
            <Text display={{ base: burgerMenuOpen ? "inline-block" : "none", lg: "inline-block" }}>
              Sign in
            </Text>
          </RouterLink>
        )}
      </Box>
    </VStack>
  );
}
