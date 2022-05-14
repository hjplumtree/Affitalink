import { ChakraProvider } from "@chakra-ui/react";
import Layouts from "../components/Layouts";
import Navigator from "../components/Navigator";
import { Flex } from "@chakra-ui/react";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <Head>
        <link rel="icon" href="/logo.svg" />
      </Head>
      <Flex>
        <Navigator position="fixed" />
        <Layouts bg="#ebe6f5" minHeight="100vh">
          <Component {...pageProps} />
        </Layouts>
      </Flex>
    </ChakraProvider>
  );
}

export default MyApp;
