import { Flex, VStack, Box } from "@chakra-ui/react";

export default function LinksList({ links }) {
  const { $: meta, link: link_arr } = links;
  console.log(meta, link_arr);
  return (
    <main>
      {link_arr.map((link) => (
        <Flex
          key={link["link-id"]}
          justifyContent="space-between"
          p={5}
          gap={2}
        >
          <VStack align="baseline" flex="2">
            <Box>{link["advertiser-name"][0]}</Box>
            <Box>{link["link-name"][0]}</Box>
            <Box>{link["description"][0]}</Box>
          </VStack>
          <VStack align="baseline" flex="1">
            <Box>{link["coupon-code"][0] ?? "No Need Code"}</Box>
            <Box>{link["clickUrl"][0]}</Box>
            <Box>{link["link-code-html"][0]}</Box>
          </VStack>
        </Flex>
      ))}
    </main>
  );
}
