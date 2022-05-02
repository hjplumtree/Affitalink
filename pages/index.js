import SectionBox from "../components/SectionBox";
import { VStack, Heading, Link, Text } from "@chakra-ui/react";

export default function Home() {
  return (
    <VStack>
      <SectionBox borderLeft="5px #1AD598 solid">
        <Heading size="lg" mb={7}>
          Welcome to Affitalink 👋
        </Heading>
        <Text fontSize="sm">
          This is beta service, feel free to use. Appreciate your feedback via{" "}
          <Link href="https://twitter.com/hjplumtree" color="#1DA1F2">
            Twitter
          </Link>
        </Text>
        <br />
        <Text fontSize="sm">1. Connect networks (Rakuten, CJ so far)</Text>
        <br />
        <Text fontSize="sm">2. Filter advertisers only you want to see</Text>
        <br />
        <Text fontSize="sm">3. Check offer title, description</Text>
        <br />
        <Text fontSize="sm">4. Copy tracking link, promo code, image url</Text>
      </SectionBox>
      <SectionBox borderLeft="5px #3A0CA3 solid">
        <Heading size="md"></Heading>
      </SectionBox>
    </VStack>
  );
}
