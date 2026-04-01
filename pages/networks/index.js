import Header from "../../components/Header";
import NetworkSiteList from "../../components/NetworkSiteList";
import SectionBox from "../../components/SectionBox";
import { Box, Text, VStack } from "@chakra-ui/react";

export default function index() {
  return (
    <VStack align="stretch" spacing={5}>
      <SectionBox>
        <Header
          eyebrow="Sources"
          title="Choose the sources that feed your queue"
          subtitle="Connector setup lives away from the review workspace on purpose. Save credentials here, verify the connection, and then head back to the queue once the source is trustworthy."
        />
      </SectionBox>
      <SectionBox>
        <Text fontSize="xs" fontWeight="700" letterSpacing="0.18em" textTransform="uppercase" color="sand.700">
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
