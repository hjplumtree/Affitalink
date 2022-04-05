import { VStack, Box, Link, Text } from "@chakra-ui/react";
import RouterLink from "./RouterLink";
import Image from "next/image";
import logo from "../public/link_reduced.png";
import { StarIcon, AddIcon, LinkIcon } from "@chakra-ui/icons";
import NextLink from "next/link";

export default function Navigator() {
  return (
    <VStack
      outline="none"
      p={5}
      align="stretch"
      spacing={3}
      minWidth="200px"
      borderRight="1px solid #e5e5e5"
      mr={5}
    >
      <Box mb={2}>
        <NextLink href="/" passHref>
          <Link display="flex" alignItems="center" gap={3}>
            <Image src={logo} alt="logo" width={30} height={30} />
            <Text fontSize={20}>AffitaLinks</Text>
          </Link>
        </NextLink>
      </Box>
      <RouterLink to="/networks">
        <StarIcon />
        Networks
      </RouterLink>
      <RouterLink to="/networks/add">
        <AddIcon /> Connect
      </RouterLink>
      <RouterLink to="/links">
        <LinkIcon />
        Links
      </RouterLink>
    </VStack>
  );
}
