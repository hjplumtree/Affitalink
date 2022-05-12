import { Flex, VStack, Code, Heading, Text } from "@chakra-ui/react";
import CopyTextToClipboard from "./CopyTextToClipboard";
import extractImg from "../lib/extractImg";
import SectionBox from "./SectionBox";

export default function LinksList({ links }) {
  const { page, data: link_arr } = links;
  return (
    <VStack width="clamp(0px, 100%, 1200px)" spacing={2} bg="transparent">
      {link_arr &&
        link_arr.map((link) => (
          <SectionBox key={link["link_id"]}>
            <Flex
              justifyContent="space-between"
              w="100%"
              p={5}
              gap={8}
              wrap="wrap"
            >
              <VStack align="baseline" flexBasis="300px" flexGrow={1}>
                <Code>{link["advertiser_name"]}</Code>
                <Heading size="md">{link["link_name"]}</Heading>
                <Text fontSize="sm">{link["description"]}</Text>
              </VStack>
              <VStack align="baseline" width="200px">
                <CopyTextToClipboard title="Coupon code">
                  {link["coupon_code"] === ""
                    ? "No Code Needed"
                    : link["coupon_code"]}
                </CopyTextToClipboard>

                <CopyTextToClipboard title="Tracking link">
                  {link["click_url"]}
                </CopyTextToClipboard>

                <CopyTextToClipboard title="Image link">
                  {link["link_code_html"] !== ""
                    ? extractImg(link["link_code_html"])
                    : "No Image"}
                </CopyTextToClipboard>
              </VStack>
            </Flex>
          </SectionBox>
        ))}
    </VStack>
  );
}
