import Header from "../../components/Header";
import NetworkSite from "../../components/NetworkSite";
import { Box, VStack } from "@chakra-ui/react";
import cj_logo from "../../public/cj.png";
import rakuten_logo from "../../public/rakuten.png";

function index() {
  return (
    <Box w="100%">
      <Box margin="0 auto" maxWidth="1000px" border="1px solid red">
        <Header
          title="NETWORKS"
          subtitle="Connect network sites to get links"
        />
        <VStack align="stretch">
          <NetworkSite
            imageUrl={cj_logo}
            name="CJ"
            subtitle="Connect with CJ network"
            endpoint="cj"
          />
          <NetworkSite
            imageUrl={rakuten_logo}
            name="Rakuten"
            subtitle="Connect with Rakuten network"
            endpoint="rakuten"
          />
        </VStack>
      </Box>
    </Box>
  );
}

export default index;
