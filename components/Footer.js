import { VStack, Text, Flex, Link } from "@chakra-ui/react";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <VStack mt="auto" mb={7}>
      <Text>Made with happiness by HeJ</Text>
      <Flex color="#5a5a66" gap="3">
        <Link
          _hover={{ color: "#24292F" }}
          href="https://github.com/hjplumtree"
        >
          <FaGithub />
        </Link>
        <Link
          _hover={{ color: "#1DA1F2" }}
          href="https://twitter.com/hjplumtree"
        >
          <FaTwitter />
        </Link>
        <Link
          _hover={{ color: "#0077b5" }}
          href="https://www.linkedin.com/in/hjplumtree/"
        >
          <FaLinkedin />
        </Link>
      </Flex>
    </VStack>
  );
}
