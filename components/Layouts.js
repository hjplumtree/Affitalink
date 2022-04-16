import { Flex } from "@chakra-ui/react";

function Layouts({ children, ...rest }) {
  return (
    <Flex padding={3} direction="column" width="100%" ml="200px" {...rest}>
      {children}
    </Flex>
  );
}

export default Layouts;
