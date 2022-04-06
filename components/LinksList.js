import { Flex, VStack, Box } from "@chakra-ui/react";

export default function LinksList({ links }) {
  const { $: meta, link: link_arr } = links;
  console.log(meta, link_arr);
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
              <Box>{link["advertiser-name"][0]}</Box>
              <Box>{link["link-name"][0]}</Box>
              <Box>{link["description"][0]}</Box>
            </VStack>
            <VStack align="baseline" flex="0 0 100px">
              <Box>
                {link["coupon-code"][0].length === 0
                  ? "No Code Needed"
                  : `Code: ${link["coupon-code"][0]}`}
              </Box>
              <Box>{link["clickUrl"][0]}</Box>
              <Box>{link["link-code-html"][0]}</Box>
            </VStack>
          </Flex>
        ))}
    </main>
  );
}
