import Header from "../../components/Header";
import NetworkSite from "../../components/NetworkSite";
import { Box, VStack } from "@chakra-ui/react";
import cj_logo from "../../public/cj.png";
import rakuten_logo from "../../public/rakuten.png";
import temp_logo from "../../public/favicon.ico";

function index() {
  return (
    <Box
      w="clamp(0px, 100%, 1000px)"
      shadow="base"
      p={30}
      bg="#fff"
      borderRadius={5}
    >
      <Box margin="0 auto">
        <Header
          title="NETWORKS"
          subtitle="Connect network sites to get links"
        />
        <VStack
          marginTop={5}
          p="20px 10px"
          border="1px solid #F1ECFE"
          align="stretch"
          spacing={3}
        >
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
          <NetworkSite
            imageUrl={temp_logo}
            name="Pepperjam"
            subtitle="Connect with Pepperjam network"
            endpoint={false}
          />
          <NetworkSite
            imageUrl={temp_logo}
            name="Impact"
            subtitle="Connect with Impact network"
            endpoint={false}
          />
        </VStack>
      </Box>
    </Box>
  );
}

export default index;
