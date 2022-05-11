import SectionBox from "../components/SectionBox";
import { VStack, Heading, Link, Text } from "@chakra-ui/react";
import RouterLink from "../components/RouterLink";

export default function Home() {
  return (
    <VStack>
      <SectionBox borderLeft="5px #1AD598 solid">
        <Heading size="lg" mb={7}>
          Welcome to Affitalink 👋
        </Heading>
        <Text fontSize="sm">
          This is beta service, feel free to use. Appreciate your feedback via{" "}
          <Link
            href="https://www.producthunt.com/posts/affitalink"
            color="#DA552F"
            isExternal
          >
            Product Hunt
          </Link>
        </Text>
        <br />
        <Text fontSize="sm">1. Connect networks (Rakuten, CJ for now)</Text>
        <br />
        <Text fontSize="sm">2. Filter advertisers only you want to see</Text>
        <br />
        <Text fontSize="sm">3. Check offer title, description</Text>
        <br />
        <Text fontSize="sm">4. Copy tracking link, promo code, image url</Text>
        <br />
        <Text fontSize="sm">5. Paste to anywhere!</Text>
      </SectionBox>
      <SectionBox borderLeft="5px #3A0CA3 solid">
        <Heading size="sm" mb={7}>
          Network sites are ready to be connected!
        </Heading>
        <Text fontSize="sm">
          You must already be an affiliate to a network site to connect. for
          example,{" "}
          <Link
            href="https://rakutenadvertising.com/partners/publishers/"
            color="#1DA1F2"
            isExternal
          >
            Rakuten Affiliate Publisher
          </Link>
        </Text>
        <Text fontSize="sm" mb={6}>
          {`If you're already a partner with CJ or Rakuten, connect right
          away!`}
        </Text>
        <RouterLink
          border="1px #3A0CA3 solid"
          color="#3A0CA3"
          bg="#F1ECFE"
          borderRadius={5}
          padding={2}
          to="/networks"
          display="inline"
          fontSize="md"
          fontWeight="bold"
        >
          Connect Network Site
        </RouterLink>
      </SectionBox>
    </VStack>
  );
}
