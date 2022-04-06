import { Flex } from "@chakra-ui/react";

function Layouts({ children, ...rest }) {
  return (
    <Flex
      p="10px 50px"
      direction="column"
      width="100%"
      maxWidth="1000px"
      {...rest}
    >
      {children}
    </Flex>
  );
}

export default Layouts;
