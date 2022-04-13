import { Box, Heading, Text } from "@chakra-ui/react";

export default function Header({ title, subtitle }) {
  return (
    <Box>
      <Heading>{title}</Heading>
      <Text>{subtitle}</Text>
    </Box>
  );
}
