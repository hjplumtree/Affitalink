import { ChakraProvider } from "@chakra-ui/react";
import Layouts from "../components/Layouts";

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <Layouts>
        <Component {...pageProps} />
      </Layouts>
    </ChakraProvider>
  );
}

export default MyApp;
