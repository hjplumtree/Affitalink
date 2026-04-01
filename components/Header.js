import { Box, Heading, Text, VStack } from "@chakra-ui/react";

export default function Header({ title, subtitle, eyebrow, ...styles }) {
  return (
    <VStack align="start" spacing={2} w="100%">
      {eyebrow ? (
        <Text
          fontSize="11px"
          fontWeight="700"
          letterSpacing="0.24em"
          textTransform="uppercase"
          color="sand.700"
        >
          {eyebrow}
        </Text>
      ) : null}
      <Box w="100%">
        <Heading
          fontSize={{ base: "2xl", lg: "3xl" }}
          lineHeight="1.05"
          letterSpacing="-0.03em"
          color="ink.900"
          {...styles}
        >
          {title}
        </Heading>
        {subtitle ? (
          <Text mt={3} maxW="56ch" color="ink.600" fontSize={{ base: "sm", lg: "md" }}>
            {subtitle}
          </Text>
        ) : null}
      </Box>
    </VStack>
  );
}
