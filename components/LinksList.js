import { Flex, VStack, Box, Code, Heading, Text } from "@chakra-ui/react";
import CopyTextToClipboard from "./CopyTextToClipboard";

export default function LinksList({ links }) {
  const { $: meta, link: link_arr } = links;
  return (
    <main>
      {link_arr &&
        link_arr.map((link) => (
          <Flex
            key={link["link-id"]}
            justifyContent="space-between"
            p={5}
            gap={2}
            wrap="wrap"
          >
            <VStack align="baseline" flexGrow="1" flexBasis="300px">
              <Code>{link["advertiser-name"][0]}</Code>
              <Heading size="md">{link["link-name"][0]}</Heading>
              <Text fontSize="sm">{link["description"][0]}</Text>
            </VStack>
            <VStack align="baseline" flex="0 0 100px">
              {/* TODO */}
              {/* Click to copy text*/}
              {/*  */}

              {link["coupon-code"][0].length === 0 ? (
                <Box>No Code Needed</Box>
              ) : (
                <CopyTextToClipboard>
                  ${link["coupon-code"][0]}
                </CopyTextToClipboard>
              )}
              <CopyTextToClipboard>{link["clickUrl"][0]}</CopyTextToClipboard>
              <Box>{link["link-code-html"][0]}</Box>
            </VStack>
          </Flex>
        ))}
    </main>
  );
}
