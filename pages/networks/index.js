import Header from "../../components/Header";
import NetworkSiteList from "../../components/NetworkSiteList";
import SectionBox from "../../components/SectionBox";
import { Text, VStack, SimpleGrid, Box } from "@chakra-ui/react";

export default function index() {
  return (
    <VStack align="stretch" spacing={5}>
      <SectionBox bg="linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255, 240, 244, 0.82), rgba(236,255,255,0.84))">
        <Header
          eyebrow="Sources"
          title="Choose the feeds that keep the queue moving"
          subtitle="This is the source wall. Connect what you trust, ignore what you do not need, and keep the review workspace focused on decisions instead of setup clutter."
        />
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} mt={7}>
          <Box p={4} borderRadius="20px" bg="rgba(15,17,23,0.04)">
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="brand.500">
              Setup
            </Text>
            <Text mt={2} fontSize="sm" color="ink.700">
              Credentials live here, away from the review queue.
            </Text>
          </Box>
          <Box p={4} borderRadius="20px" bg="rgba(15,17,23,0.04)">
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="aqua.600">
              Selection
            </Text>
            <Text mt={2} fontSize="sm" color="ink.700">
              Choose only the merchants worth monitoring.
            </Text>
          </Box>
          <Box p={4} borderRadius="20px" bg="rgba(15,17,23,0.04)">
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="lime.700">
              Trust
            </Text>
            <Text mt={2} fontSize="sm" color="ink.700">
              A connector is only useful if its sync results are believable.
            </Text>
          </Box>
        </SimpleGrid>
      </SectionBox>
      <SectionBox>
        <Text fontSize="xs" fontWeight="700" letterSpacing="0.18em" textTransform="uppercase" color="brand.500">
          Available connectors
        </Text>
        <VStack marginTop={5} align="stretch" spacing={0}>
          <NetworkSiteList
            imageUrl="/rakuten.png"
            name="Rakuten"
            subtitle="Connect with Rakuten network"
            endpoint="rakuten"
          />
          <NetworkSiteList
            imageUrl="/cj.png"
            name="CJ"
            subtitle="Connect with CJ network"
            endpoint="cj"
          />
          <NetworkSiteList
            imageUrl="/impact_logo.png"
            name="Impact"
            subtitle="Connect with Impact network"
            endpoint={false}
          />
          <NetworkSiteList
            imageUrl="/ebay_logo.png"
            name="eBay"
            subtitle="Connect with eBay network"
            endpoint={false}
          />
          <NetworkSiteList
            imageUrl="/logo.svg"
            name="TEST NETWORK"
            subtitle="EXPLORE with TEST NETWORK"
            endpoint="testnet"
          />
        </VStack>
      </SectionBox>
    </VStack>
  );
}
