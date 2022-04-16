import SectionBox from "../components/SectionBox";
import Header from "../components/Header";
import { VStack, Heading, Divider } from "@chakra-ui/react";

export default function Home() {
  return (
    <VStack>
      <SectionBox>
        <Header title="Welcome to Affitalink" />
      </SectionBox>
      <SectionBox>
        <Heading size="lg" mb={7}>
          Now is beta, feel free to use and feedback 😄
        </Heading>
        <Heading size="lg">1. Connect networks like CJ and Rakuten</Heading>
        <Heading size="lg">2. Get tracking links</Heading>
        <Heading size="lg">
          Also find coupon code, description, image link ... etc
        </Heading>
      </SectionBox>
    </VStack>
  );
}
