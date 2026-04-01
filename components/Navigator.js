import { VStack, Box, Text, Icon, Flex, HStack } from "@chakra-ui/react";
import RouterLink from "./RouterLink";
import Image from "next/image";
import logo from "../public/logo.svg";
import {
  FaNetworkWired,
  FaLink,
  FaHome,
  FaChevronLeft,
  FaChevronRight,
  FaSignInAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { useState } from "react";
import { useAuth } from "./AuthProvider";

export default function Navigator({ ...styles }) {
  const [burgerMenuOpen, setBurgerMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  return (
    <VStack
      alignItems="stretch"
      h="100%"
      p={3}
      pt={4}
      spacing={4}
      bg="rgba(248, 244, 237, 0.95)"
      borderRight="1px solid rgba(103, 77, 55, 0.14)"
      backdropFilter="blur(20px)"
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
            bg="white"
            border="1px solid rgba(103, 77, 55, 0.14)"
            display="grid"
            placeItems="center"
          >
            <Image src={logo} alt="logo" width="24px" height="24px" />
          </Box>
          <Box display={{ base: burgerMenuOpen || "none", lg: "block" }}>
            <Text fontSize="lg" fontWeight="700" letterSpacing="-0.03em" color="ink.900">
              AffitaLink
            </Text>
            <Text fontSize="xs" color="ink.500">
              Offer review workspace
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
          bg="rgba(255, 251, 246, 0.98)"
          color="ink.700"
          border="1px solid rgba(103, 77, 55, 0.16)"
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
          color="sand.700"
          letterSpacing="0.18em"
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
          color="sand.700"
          letterSpacing="0.18em"
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
            Review Queue
          </Text>
        </RouterLink>

        <Text
          display={{ base: burgerMenuOpen || "none", lg: "inline-block" }}
          mt={4}
          mb={2}
          fontSize="sm"
          color="sand.700"
          letterSpacing="0.18em"
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
            color="ink.700"
            _hover={{ bg: "rgba(255,255,255,0.72)" }}
          >
            <Flex align="center" gap={3}>
              <Icon width="18px" height="18px" as={FaSignOutAlt} />
              <Text display={{ base: burgerMenuOpen || "none", lg: "inline-block" }}>
                Sign out
              </Text>
            </Flex>
          </Box>
        ) : (
          <RouterLink to="/login" mt={{ base: burgerMenuOpen || 3, lg: 0 }}>
            <Icon width="18px" height="18px" as={FaSignInAlt} />
            <Text display={{ base: burgerMenuOpen || "none", lg: "inline-block" }}>
              Sign in
            </Text>
          </RouterLink>
        )}
      </Box>
    </VStack>
  );
}
