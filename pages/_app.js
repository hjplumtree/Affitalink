import { ChakraProvider } from "@chakra-ui/react";
import Layouts from "../components/Layouts";
import Navigator from "../components/Navigator";
import { Flex } from "@chakra-ui/react";
import Head from "next/head";
import { AuthProvider } from "../components/AuthProvider";
import theme from "../lib/theme";

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Head>
          <link rel="icon" href="/logo.svg" />
        </Head>
        <Flex>
          <Navigator position="fixed" />
          <Layouts minHeight="100vh">
            <Component {...pageProps} />
          </Layouts>
        </Flex>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default MyApp;
