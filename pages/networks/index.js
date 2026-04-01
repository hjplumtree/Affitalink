import Header from "../../components/Header";
import NetworkSiteList from "../../components/NetworkSiteList";
import SectionBox from "../../components/SectionBox";
import { Text, VStack, SimpleGrid, Box } from "@chakra-ui/react";

export default function index() {
  return (
    <VStack align="stretch" spacing={5}>
      <SectionBox bg="rgba(255,255,255,0.98)">
        <Header
          eyebrow="Sources"
          title="Build a source wall that earns the queue's trust"
          subtitle="Each connector should justify its place. Validate credentials, trim the watchlist, and keep operations focused on sources that actually deserve review attention."
        />
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} mt={7}>
          <Box p={4} borderRadius="20px" bg="rgba(15,17,23,0.04)">
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="brand.500">
              Setup
            </Text>
            <Text mt={2} fontSize="sm" color="ink.700">
              Credentials and source validation live here, away from the queue.
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
              A source is only useful when its sync results are believable.
            </Text>
          </Box>
        </SimpleGrid>
      </SectionBox>
      <SectionBox>
        <Text fontSize="xs" fontWeight="700" letterSpacing="0.18em" textTransform="uppercase" color="brand.500">
          Available connectors
        </Text>
        <Text mt={2} color="ink.600" maxW="48ch">
          Start with the networks that matter today. Leave the rest off the critical path.
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
