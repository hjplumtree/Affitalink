import { Box, Heading, Text } from "@chakra-ui/react";

export default function Header({ title, subtitle }) {
  return (
    <Box w="100%">
      <Heading>{title}</Heading>
      <Text>{subtitle}</Text>
    </Box>
  );
}
