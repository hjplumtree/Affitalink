import { Box } from "@chakra-ui/react";

export default function SectionBox({ children, ...styles }) {
  return (
    <Box
      width="clamp(0px, 100%, 1240px)"
      borderRadius="28px"
      border="1px solid"
      borderColor="rgba(103, 77, 55, 0.16)"
      boxShadow="0 18px 60px rgba(24, 34, 47, 0.06)"
      p={{ base: 5, lg: 7 }}
      bg="rgba(255, 251, 246, 0.86)"
      backdropFilter="blur(20px)"
      margin="0 auto"
      {...styles}
    >
      {children}
    </Box>
  );
}
