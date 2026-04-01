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
          title="Connect the sources you want to monitor"
          subtitle="Save credentials, test the connection, and choose which merchants should feed the review queue."
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
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="brand.500">
              Selection
            </Text>
            <Text mt={2} fontSize="sm" color="ink.700">
              Choose only the merchants worth monitoring.
            </Text>
          </Box>
          <Box p={4} borderRadius="20px" bg="rgba(15,17,23,0.04)">
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="lime.700">
              Checks
            </Text>
            <Text mt={2} fontSize="sm" color="ink.700">
              A source is only useful when the connection works and the sync results look right.
            </Text>
          </Box>
        </SimpleGrid>
      </SectionBox>
      <SectionBox>
        <Text fontSize="xs" fontWeight="700" letterSpacing="0.18em" textTransform="uppercase" color="brand.500">
          Available sources
        </Text>
        <Text mt={2} color="ink.600" maxW="48ch">
          Start with the networks you actively use. Leave the rest disconnected.
        </Text>
        <VStack marginTop={5} align="stretch" spacing={0}>
          <NetworkSiteList
            imageUrl="/rakuten.png"
            name="Rakuten"
            subtitle="Add your Rakuten account"
            endpoint="rakuten"
          />
          <NetworkSiteList
            imageUrl="/cj.png"
            name="CJ"
            subtitle="Add your CJ account"
            endpoint="cj"
          />
          <NetworkSiteList
            imageUrl="/impact_logo.png"
            name="Impact"
            subtitle="Support planned"
            endpoint={false}
          />
          <NetworkSiteList
            imageUrl="/ebay_logo.png"
            name="eBay"
            subtitle="Support planned"
            endpoint={false}
          />
          <NetworkSiteList
            imageUrl="/logo.svg"
            name="Test network"
            subtitle="Use the built-in test source"
            endpoint="testnet"
          />
        </VStack>
      </SectionBox>
    </VStack>
  );
}
