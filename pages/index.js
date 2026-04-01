import SectionBox from "../components/SectionBox";
import { VStack, Link, Text, HStack, Box, SimpleGrid } from "@chakra-ui/react";
import RouterLink from "../components/RouterLink";
import Header from "../components/Header";

export default function Home() {
  return (
    <VStack align="stretch" spacing={5}>
      <SectionBox bg="linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255, 240, 244, 0.92) 45%, rgba(236,255,255,0.92))">
        <Header
          eyebrow="Overview"
          title="Operate the affiliate queue like a live signal desk"
          subtitle="AffitaLink is not a scrapbook of links anymore. It is a fast review surface for operators who need to spot offer drift, trust the latest sync, and move on."
        />
        <HStack mt={6} spacing={3} flexWrap="wrap">
          <RouterLink to="/links" display="inline-flex" width="fit-content">
            Open review queue
          </RouterLink>
          <RouterLink
            to="/networks"
            display="inline-flex"
            width="fit-content"
            bg="transparent"
            border="1px solid rgba(15, 17, 23, 0.12)"
          >
            Configure connectors
          </RouterLink>
        </HStack>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={8}>
          <Box p={4} borderRadius="22px" bg="rgba(15,17,23,0.04)">
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="brand.500">
              Speed
            </Text>
            <Text mt={2} fontSize="lg" fontWeight="700" color="ink.900">
              Manual sync when you want it
            </Text>
            <Text mt={1} fontSize="sm" color="ink.600">
              No mystery scheduler. Pull fresh data when you are ready to review it.
            </Text>
          </Box>
          <Box p={4} borderRadius="22px" bg="rgba(15,17,23,0.04)">
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="aqua.600">
              Signal
            </Text>
            <Text mt={2} fontSize="lg" fontWeight="700" color="ink.900">
              Meaningful changes only
            </Text>
            <Text mt={1} fontSize="sm" color="ink.600">
              The queue is for differences that matter, not for everything that moved a pixel.
            </Text>
          </Box>
          <Box p={4} borderRadius="22px" bg="rgba(15,17,23,0.04)">
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="lime.700">
              Control
            </Text>
            <Text mt={2} fontSize="lg" fontWeight="700" color="ink.900">
              Approve with evidence
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
                1. Connect the right sources
              </Text>
              <Text mt={1} fontSize="sm" color="ink.600">
                Start with CJ, Rakuten, or your test network. Keep setup separate from review work.
              </Text>
            </Box>
            <Box>
              <Text fontSize="lg" fontWeight="700" color="ink.900">
                2. Select the merchants worth watching
              </Text>
              <Text mt={1} fontSize="sm" color="ink.600">
                Trim noise early so the queue reflects the offers you actually care about.
              </Text>
            </Box>
            <Box>
              <Text fontSize="lg" fontWeight="700" color="ink.900">
                3. Sync, inspect, approve
              </Text>
              <Text mt={1} fontSize="sm" color="ink.600">
                Run manual sync, open the split pane, inspect the diff, then approve or dismiss.
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
              Most affiliate tools feel like exports wearing a UI costume. This one should feel closer to a moderation desk. A ranked list, clear freshness, and one obvious next action.
            </Text>
            <Text fontSize="sm" color="ink.700">
              That matters because stale data does not fail loudly. It just quietly turns into bad copy, broken trust, and extra tabs.
            </Text>
          </VStack>
        </SectionBox>
      </SimpleGrid>
      <SectionBox bg="linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255, 240, 244, 0.76), rgba(248,255,241,0.8))">
        <Text fontSize="xs" fontWeight="700" letterSpacing="0.18em" textTransform="uppercase" color="brand.500">
          Network access
        </Text>
        <Text fontSize="lg" fontWeight="700" mt={3} color="ink.900">
          Ready when your affiliate accounts are ready
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
          border="1px solid rgba(255, 66, 122, 0.16)"
        >
          Open source wall
        </RouterLink>
      </SectionBox>
    </VStack>
  );
}
