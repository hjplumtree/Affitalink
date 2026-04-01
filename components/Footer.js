import { VStack, Text, Flex, Link } from "@chakra-ui/react";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <VStack pt={10} mt="auto" mb={5} spacing={2}>
      <Text fontSize="sm" color="ink.500">
        Built for faster offer review.
      </Text>
      <Flex color="ink.500" gap="3">
        <Link
          _hover={{ color: "ink.900" }}
          href="https://github.com/hjplumtree"
        >
          <FaGithub />
        </Link>
        <Link
          _hover={{ color: "brand.600" }}
          href="https://twitter.com/hjplumtree"
        >
          <FaTwitter />
        </Link>
        <Link
          _hover={{ color: "brand.600" }}
          href="https://www.linkedin.com/in/hjplumtree/"
        >
          <FaLinkedin />
        </Link>
      </Flex>
    </VStack>
  );
}
