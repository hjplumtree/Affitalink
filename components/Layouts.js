import { Flex } from "@chakra-ui/react";
import Footer from "./Footer";

function Layouts({ children, ...styles }) {
  return (
    <Flex
      padding={3}
      direction="column"
      width="100%"
      height="100%"
      ml="220px"
      {...styles}
    >
      {children}
      <Footer />
    </Flex>
  );
}

export default Layouts;
