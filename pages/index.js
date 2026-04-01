import SectionBox from "../components/SectionBox";
import { VStack, Link, Text, HStack } from "@chakra-ui/react";
import RouterLink from "../components/RouterLink";
import Header from "../components/Header";

export default function Home() {
  return (
    <VStack align="stretch" spacing={5}>
      <SectionBox>
        <Header
          eyebrow="Overview"
          title="Affiliate offer review with more signal, less drag"
          subtitle="Built for fast-moving operators. Connect a source, run sync when you want it, and clear the queue before stale copy or broken offers make it downstream."
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
      </SectionBox>
      <SectionBox>
        <Text fontSize="xs" fontWeight="700" letterSpacing="0.18em" textTransform="uppercase" color="brand.500">
          Product loop
        </Text>
        <VStack align="stretch" mt={5} spacing={4}>
          <Text fontSize="sm" color="ink.700">
            1. Connect networks like CJ or Rakuten and save credentials server-side.
          </Text>
          <Text fontSize="sm" color="ink.700">
            2. Choose only the merchants you actually want monitored.
          </Text>
          <Text fontSize="sm" color="ink.700">
            3. Run manual sync and let AffitaLink surface meaningful changes.
          </Text>
          <Text fontSize="sm" color="ink.700">
            4. Approve or dismiss from a split-pane queue with source evidence.
          </Text>
        </VStack>
      </SectionBox>
      <SectionBox bg="linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255, 240, 244, 0.76), rgba(248,255,241,0.8))">
        <Text fontSize="xs" fontWeight="700" letterSpacing="0.18em" textTransform="uppercase" color="brand.500">
          Network access
        </Text>
        <Text fontSize="lg" fontWeight="700" mt={3} color="ink.900">
          Network sites are ready to be connected
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
          Connect Network Site
        </RouterLink>
      </SectionBox>
    </VStack>
  );
}
