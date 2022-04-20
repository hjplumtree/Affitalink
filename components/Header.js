import { Box, Heading, Text } from "@chakra-ui/react";

export default function Header({ title, subtitle, ...styles }) {
  return (
    <Box w="100%">
      <Heading {...styles}>{title}</Heading>
      <Text>{subtitle}</Text>
    </Box>
  );
}
