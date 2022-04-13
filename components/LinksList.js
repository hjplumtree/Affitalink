import { Flex, VStack, Code, Heading, Text } from "@chakra-ui/react";
import CopyTextToClipboard from "./CopyTextToClipboard";
import extractImg from "../lib/extractImg";

export default function LinksList({ links }) {
  const { $: meta, link: link_arr } = links;
  return (
    <VStack maxWidth="1000px" spacing={2}>
      {link_arr &&
        link_arr.map((link) => (
          <Flex
            key={link["link-id"]}
            justifyContent="space-between"
            w="100%"
            p={5}
            gap={8}
            wrap="wrap"
            marginTop={3}
            bg="#fff"
          >
            <VStack align="baseline" flexBasis="300px" flexGrow={1}>
              <Code>{link["advertiser-name"][0]}</Code>
              <Heading size="md">{link["link-name"][0]}</Heading>
              <Text fontSize="sm">{link["description"][0]}</Text>
            </VStack>
            <VStack align="baseline" width="200px">
              {/* TODO */}
              {/* Click to copy text*/}
              {/*  */}
              <CopyTextToClipboard title="Coupon code">
                {link["coupon-code"][0].length === 0
                  ? "No Code Needed"
                  : link["coupon-code"][0]}
              </CopyTextToClipboard>

              <CopyTextToClipboard title="Tracking link">
                {link["clickUrl"][0]}
              </CopyTextToClipboard>

              <CopyTextToClipboard title="Image link">
                {link["link-type"][0] === "Banner"
                  ? extractImg(link["link-code-html"][0])
                  : "No Image"}
              </CopyTextToClipboard>
            </VStack>
          </Flex>
        ))}
    </VStack>
  );
}
