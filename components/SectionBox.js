import { Box } from "@chakra-ui/react";

export default function SectionBox({ children, ...styles }) {
  return (
    <Box
      width="clamp(0px, 100%, 1240px)"
      position="relative"
      overflow="hidden"
      borderRadius="34px"
      border="1px solid"
      borderColor="rgba(15, 17, 23, 0.08)"
      boxShadow="0 32px 96px rgba(15, 17, 23, 0.08)"
      p={{ base: 5, lg: 7 }}
      bg="rgba(255, 255, 255, 0.94)"
      backdropFilter="blur(14px)"
      margin="0 auto"
      {...styles}
    >
      {children}
    </Box>
  );
}
