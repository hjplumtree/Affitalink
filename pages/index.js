import SectionBox from "../components/SectionBox";
import { VStack, Link, Text, HStack, Box, SimpleGrid, Grid } from "@chakra-ui/react";
import RouterLink from "../components/RouterLink";
import Header from "../components/Header";

export default function Home() {
  return (
    <VStack align="stretch" spacing={5}>
      <SectionBox bg="rgba(255,255,255,0.98)">
        <Grid templateColumns={{ base: "1fr", xl: "1.2fr 0.8fr" }} gap={6} alignItems="start">
          <Box>
            <Header
              eyebrow="Affiliate offers"
              title="Bring network discounts and sale offers into one clean view"
              subtitle="Connect your affiliate sources, pull the latest coupons and sales, and keep them in one consistent format instead of checking each network by hand."
            />
            <HStack mt={6} spacing={3} flexWrap="wrap">
              <RouterLink to="/offers" display="inline-flex" width="fit-content">
                View offers
              </RouterLink>
              <RouterLink
                to="/links"
                display="inline-flex"
                width="fit-content"
                bg="transparent"
                border="1px solid rgba(15, 17, 23, 0.12)"
              >
                Check updates
              </RouterLink>
              <RouterLink
                to="/networks"
                display="inline-flex"
                width="fit-content"
                bg="transparent"
                border="1px solid rgba(15, 17, 23, 0.12)"
              >
                Connect sources
              </RouterLink>
            </HStack>
          </Box>
          <Box
            p={{ base: 5, lg: 6 }}
            borderRadius="28px"
            bg="#11141d"
            color="white"
            boxShadow="0 28px 70px rgba(15,17,23,0.18)"
          >
            <Text fontSize="11px" letterSpacing="0.22em" textTransform="uppercase" color="whiteAlpha.600">
              How it works
            </Text>
            <VStack align="stretch" spacing={4} mt={4}>
              <Box>
                <Text fontSize="sm" color="whiteAlpha.600">01</Text>
                <Text fontSize="lg" fontWeight="700">Connect the networks you already use</Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="whiteAlpha.600">02</Text>
                <Text fontSize="lg" fontWeight="700">Choose which merchants should be tracked</Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="whiteAlpha.600">03</Text>
                <Text fontSize="lg" fontWeight="700">Sync new offers and check what changed</Text>
              </Box>
            </VStack>
          </Box>
        </Grid>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={8}>
          <Box p={4} borderRadius="22px" bg="rgba(15,17,23,0.04)">
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="brand.500">
              Sources
            </Text>
            <Text mt={2} fontSize="lg" fontWeight="700" color="ink.900">
              Keep every network in one place
            </Text>
            <Text mt={1} fontSize="sm" color="ink.600">
              Save network credentials once, then manage merchant coverage from a single dashboard.
            </Text>
          </Box>
          <Box p={4} borderRadius="22px" bg="rgba(15,17,23,0.04)">
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="brand.500">
              Format
            </Text>
            <Text mt={2} fontSize="lg" fontWeight="700" color="ink.900">
              Standardize messy affiliate data
            </Text>
            <Text mt={1} fontSize="sm" color="ink.600">
              Pull coupons, titles, and destination links into one format so the output is easier to use.
            </Text>
          </Box>
          <Box p={4} borderRadius="22px" bg="rgba(15,17,23,0.04)">
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="lime.700">
              Updates
            </Text>
            <Text mt={2} fontSize="lg" fontWeight="700" color="ink.900">
              Check what changed before it goes live
            </Text>
            <Text mt={1} fontSize="sm" color="ink.600">
              Compare before and after values so you can spot real offer changes without digging through each network.
            </Text>
          </Box>
        </SimpleGrid>
      </SectionBox>
      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
        <SectionBox>
          <Text fontSize="xs" fontWeight="700" letterSpacing="0.18em" textTransform="uppercase" color="brand.500">
            Product flow
          </Text>
          <VStack align="stretch" mt={5} spacing={4}>
            <Box>
              <Text fontSize="lg" fontWeight="700" color="ink.900">
                1. Connect sources
              </Text>
              <Text mt={1} fontSize="sm" color="ink.600">
                Add CJ, Rakuten, or test sources so the app can pull affiliate offers from them.
              </Text>
            </Box>
            <Box>
              <Text fontSize="lg" fontWeight="700" color="ink.900">
                2. Choose merchants
              </Text>
              <Text mt={1} fontSize="sm" color="ink.600">
                Track only the merchants you care about so the dashboard stays focused.
              </Text>
            </Box>
            <Box>
              <Text fontSize="lg" fontWeight="700" color="ink.900">
                3. Review incoming updates
              </Text>
              <Text mt={1} fontSize="sm" color="ink.600">
                Sync new offers, compare changed fields, then approve or dismiss each update.
              </Text>
            </Box>
          </VStack>
        </SectionBox>
        <SectionBox>
          <Text fontSize="xs" fontWeight="700" letterSpacing="0.18em" textTransform="uppercase" color="brand.500">
            What this dashboard is for
          </Text>
          <VStack align="stretch" mt={5} spacing={4}>
            <Text fontSize="sm" color="ink.700">
              This is not the public offers page. It is the internal dashboard that collects discount data from affiliate networks and helps you review incoming changes.
            </Text>
            <Text fontSize="sm" color="ink.700">
              That matters because stale offer data quickly turns into outdated copy, broken destination links, and inconsistent formatting.
            </Text>
          </VStack>
        </SectionBox>
      </SimpleGrid>
      <SectionBox bg="rgba(255,255,255,0.98)">
        <Text fontSize="xs" fontWeight="700" letterSpacing="0.18em" textTransform="uppercase" color="brand.500">
          Before you connect
        </Text>
        <Text fontSize="lg" fontWeight="700" mt={3} color="ink.900">
          You need active affiliate network access
        </Text>
        <Text fontSize="sm" color="ink.600" mt={2}>
          This dashboard only works if you already have partner access to a network.
        </Text>
        <Text fontSize="sm">
          If you are already a partner with CJ or Rakuten, connect right away and start
          using this dashboard instead of checking each source by hand.
        </Text>
        <Text fontSize="sm" mt={2}>
          More about partner programs:{" "}
          <Link
            href="https://rakutenadvertising.com/partners/publishers/"
            color="brand.600"
            isExternal
          >
            Rakuten Affiliate Publisher
          </Link>
        </Text>
        <RouterLink
          to="/offers"
          mt={5}
          display="inline-flex"
          width="fit-content"
          border="1px solid rgba(139, 77, 255, 0.16)"
        >
          View offer list
        </RouterLink>
      </SectionBox>
    </VStack>
  );
}
