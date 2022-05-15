import { Flex } from "@chakra-ui/react";
import Footer from "./Footer";

function Layouts({ children, ...styles }) {
  return (
    <Flex
      p={3}
      pl={6}
      direction="column"
      width="100%"
      height="100%"
      ml={{ base: "50px", lg: "210px" }}
      {...styles}
    >
      {children}
      <Footer />
    </Flex>
  );
}

export default Layouts;
