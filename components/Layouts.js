import { Flex } from "@chakra-ui/react";
import Footer from "./Footer";

function Layouts({ children, ...styles }) {
  return (
    <Flex
      p={{ base: 3, lg: 6 }}
      pl={{ base: 4, lg: 10 }}
      direction="column"
      width="100%"
      height="100%"
      ml={{ base: "50px", lg: "210px" }}
      bg="transparent"
      maxW="1600px"
      gap={4}
      {...styles}
    >
      {children}
      <Footer />
    </Flex>
  );
}

export default Layouts;
