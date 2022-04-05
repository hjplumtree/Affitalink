import { Box } from "@chakra-ui/react";

function Layouts({ children }) {
  return (
    <Box margin="50px auto" width="100%" maxWidth="1000px">
      {children}
    </Box>
  );
}

export default Layouts;
