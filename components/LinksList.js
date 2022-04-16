import { Flex, VStack, Code, Heading, Text } from "@chakra-ui/react";
import CopyTextToClipboard from "./CopyTextToClipboard";
import extractImg from "../lib/extractImg";
import SectionBox from "./SectionBox";

export default function LinksList({ links }) {
  const { page, data: link_arr } = links;
  return (
    <SectionBox>
      <VStack width="clamp(0px, 100%, 1000px)" spacing={2}>
        {link_arr &&
          link_arr.map((link) => (
            <Flex
              key={link["link_id"]}
              justifyContent="space-between"
              w="100%"
              p={5}
              gap={8}
              wrap="wrap"
              marginTop={3}
              bg="#fff"
              shadow="base"
              borderRadius={5}
            >
              <VStack align="baseline" flexBasis="300px" flexGrow={1}>
                <Code>{link["advertiser_name"]}</Code>
                <Heading size="md">{link["link_name"]}</Heading>
                <Text fontSize="sm">{link["description"]}</Text>
              </VStack>
              <VStack align="baseline" width="200px">
                {/* TODO */}
                {/* Click to copy text*/}
                {/*  */}
                <CopyTextToClipboard title="Coupon code">
                  {link["coupon_code"] === ""
                    ? "No Code Needed"
                    : link["coupon_code"]}
                </CopyTextToClipboard>

                <CopyTextToClipboard title="Tracking link">
                  {link["click_url"]}
                </CopyTextToClipboard>

                <CopyTextToClipboard title="Image link">
                  {link["link_type"] === "Banner"
                    ? extractImg(link["link_code_html"])
                    : "No Image"}
                </CopyTextToClipboard>
              </VStack>
            </Flex>
          ))}
      </VStack>
    </SectionBox>
  );
}
