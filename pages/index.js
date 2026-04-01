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
              eyebrow="Overview"
              title="Run affiliate review like a live signal feed, not a sleepy dashboard"
              subtitle="AffitaLink compresses the workflow into one bright operating surface: connect trusted sources, pull the latest snapshot, and clear the queue with evidence instead of tab sprawl."
            />
            <HStack mt={6} spacing={3} flexWrap="wrap">
              <RouterLink to="/links" display="inline-flex" width="fit-content">
                Open live queue
              </RouterLink>
              <RouterLink
                to="/networks"
                display="inline-flex"
                width="fit-content"
                bg="transparent"
                border="1px solid rgba(15, 17, 23, 0.12)"
              >
                Open source wall
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
              Workflow loop
            </Text>
            <VStack align="stretch" spacing={4} mt={4}>
              <Box>
                <Text fontSize="sm" color="whiteAlpha.600">01</Text>
                <Text fontSize="lg" fontWeight="700">Connect only trusted sources</Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="whiteAlpha.600">02</Text>
                <Text fontSize="lg" fontWeight="700">Select merchants worth watching</Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="whiteAlpha.600">03</Text>
                <Text fontSize="lg" fontWeight="700">Pull latest, inspect diff, clear queue</Text>
              </Box>
            </VStack>
          </Box>
        </Grid>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={8}>
          <Box p={4} borderRadius="22px" bg="rgba(15,17,23,0.04)">
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="brand.500">
              Speed
            </Text>
            <Text mt={2} fontSize="lg" fontWeight="700" color="ink.900">
              Pull now, not later
            </Text>
            <Text mt={1} fontSize="sm" color="ink.600">
              Manual sync keeps freshness explicit. No fake certainty, no hidden schedule.
            </Text>
          </Box>
          <Box p={4} borderRadius="22px" bg="rgba(15,17,23,0.04)">
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="aqua.600">
              Signal
            </Text>
            <Text mt={2} fontSize="lg" fontWeight="700" color="ink.900">
              Rank the changes that matter
            </Text>
            <Text mt={1} fontSize="sm" color="ink.600">
              The queue should surface offer drift, not become a landfill for minor churn.
            </Text>
          </Box>
          <Box p={4} borderRadius="22px" bg="rgba(15,17,23,0.04)">
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="lime.700">
              Control
            </Text>
            <Text mt={2} fontSize="lg" fontWeight="700" color="ink.900">
              Approve with proof
            </Text>
            <Text mt={1} fontSize="sm" color="ink.600">
              Before, after, source URL, confidence. Enough proof to decide without tab chaos.
            </Text>
          </Box>
        </SimpleGrid>
      </SectionBox>
      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
        <SectionBox>
          <Text fontSize="xs" fontWeight="700" letterSpacing="0.18em" textTransform="uppercase" color="brand.500">
            Product loop
          </Text>
          <VStack align="stretch" mt={5} spacing={4}>
            <Box>
              <Text fontSize="lg" fontWeight="700" color="ink.900">
                1. Build a clean source wall
              </Text>
              <Text mt={1} fontSize="sm" color="ink.600">
                Keep credentials and source validation away from the queue so operations stays clean.
              </Text>
            </Box>
            <Box>
              <Text fontSize="lg" fontWeight="700" color="ink.900">
                2. Trim the watchlist hard
              </Text>
              <Text mt={1} fontSize="sm" color="ink.600">
                Watch only merchants that deserve review attention. Everything else is drag.
              </Text>
            </Box>
            <Box>
              <Text fontSize="lg" fontWeight="700" color="ink.900">
                3. Clear the queue with confidence
              </Text>
              <Text mt={1} fontSize="sm" color="ink.600">
                Pull fresh data, inspect the brief, approve or dismiss, then move to the next item.
              </Text>
            </Box>
          </VStack>
        </SectionBox>
        <SectionBox>
          <Text fontSize="xs" fontWeight="700" letterSpacing="0.18em" textTransform="uppercase" color="brand.500">
            Why this feels different
          </Text>
          <VStack align="stretch" mt={5} spacing={4}>
            <Text fontSize="sm" color="ink.700">
              Most affiliate tools still feel like exports pretending to be products. This should feel closer to a content moderation desk: ranked list, visible freshness, one obvious next action.
            </Text>
            <Text fontSize="sm" color="ink.700">
              That matters because stale affiliate data rarely fails loudly. It leaks into weak copy, broken trust, and wasted review time.
            </Text>
          </VStack>
        </SectionBox>
      </SimpleGrid>
      <SectionBox bg="rgba(255,255,255,0.98)">
        <Text fontSize="xs" fontWeight="700" letterSpacing="0.18em" textTransform="uppercase" color="brand.500">
          Network access
        </Text>
        <Text fontSize="lg" fontWeight="700" mt={3} color="ink.900">
          Ready once your partner accounts are ready
        </Text>
        <Text fontSize="sm" color="ink.600" mt={2}>
          You must already be an affiliate to a network site to connect.
        </Text>
        <Text fontSize="sm">
          If you are already a partner with CJ or Rakuten, connect right away and start
          using the review queue instead of checking each network manually.
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
          to="/networks"
          mt={5}
          display="inline-flex"
          width="fit-content"
          border="1px solid rgba(139, 77, 255, 0.16)"
        >
          Configure sources
        </RouterLink>
      </SectionBox>
    </VStack>
  );
}
