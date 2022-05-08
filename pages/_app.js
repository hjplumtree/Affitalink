import { ChakraProvider } from "@chakra-ui/react";
import Layouts from "../components/Layouts";
import Navigator from "../components/Navigator";
import { Flex } from "@chakra-ui/react";

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <Flex w="100%" h="100%">
        <Navigator position="fixed" />
        <Layouts bg="#ebe6f5" minHeight="100vh">
          <Component {...pageProps} />
        </Layouts>
      </Flex>
    </ChakraProvider>
  );
}

export default MyApp;
