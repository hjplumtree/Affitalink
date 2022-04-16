import { Box } from "@chakra-ui/react";

export default function SectionBox({ children, ...styles }) {
  return (
    <Box
      width="clamp(0px, 100%, 1000px)"
      borderRadius={5}
      shadow="base"
      p={30}
      bg="#fff"
      margin="0 auto"
      {...styles}
    >
      {children}
    </Box>
  );
}
