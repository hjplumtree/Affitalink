import { VStack, Box, Link, Text, Icon } from "@chakra-ui/react";
import RouterLink from "./RouterLink";
import Image from "next/image";
import logo from "../public/link_reduced.png";
import { FaNetworkWired, FaLink } from "react-icons/fa";
import NextLink from "next/link";

export default function Navigator({ ...rest }) {
  return (
    <VStack
      p={5}
      align="stretch"
      h="100%"
      spacing={3}
      width="200px"
      borderRight="1px solid #e5e5e5"
      {...rest}
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
        <Icon as={FaNetworkWired} />
        Networks
      </RouterLink>

      <RouterLink to="/links">
        <Icon as={FaLink} />
        Links
      </RouterLink>
    </VStack>
  );
}
