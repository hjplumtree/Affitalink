import { Box, Heading, Text, VStack } from "@chakra-ui/react";

export default function Header({ title, subtitle, eyebrow, ...styles }) {
  return (
    <VStack align="start" spacing={3} w="100%">
      {eyebrow ? (
        <Text
          fontSize="11px"
          fontWeight="700"
          letterSpacing="0.24em"
          textTransform="uppercase"
          color="brand.500"
        >
          {eyebrow}
        </Text>
      ) : null}
      <Box w="100%">
        <Heading
          fontSize={{ base: "2xl", lg: "4xl" }}
          lineHeight={{ base: "1.08", lg: "0.98" }}
          letterSpacing="-0.04em"
          color="ink.900"
          {...styles}
        >
          {title}
        </Heading>
        {subtitle ? (
          <Text mt={1} maxW="62ch" color="ink.600" fontSize={{ base: "sm", lg: "md" }} lineHeight="1.7">
            {subtitle}
          </Text>
        ) : null}
      </Box>
    </VStack>
  );
}
