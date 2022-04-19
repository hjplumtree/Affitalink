import Header from "../../components/Header";
import NetworkSiteList from "../../components/NetworkSiteList";
import SectionBox from "../../components/SectionBox";
import { Box, VStack } from "@chakra-ui/react";
import cj_logo from "../../public/cj.png";
import rakuten_logo from "../../public/rakuten.png";
import temp_logo from "../../public/favicon.ico";

function index() {
  return (
    <SectionBox>
      <Box>
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
          <NetworkSiteList
            imageUrl={cj_logo}
            name="CJ"
            subtitle="Connect with CJ network"
            endpoint="cj"
          />
          <NetworkSiteList
            imageUrl={rakuten_logo}
            name="Rakuten"
            subtitle="Connect with Rakuten network"
            endpoint="rakuten"
          />
          <NetworkSiteList
            imageUrl={temp_logo}
            name="Pepperjam"
            subtitle="Connect with Pepperjam network"
            endpoint={false}
          />
          <NetworkSiteList
            imageUrl={temp_logo}
            name="Impact"
            subtitle="Connect with Impact network"
            endpoint={false}
          />
        </VStack>
      </Box>
    </SectionBox>
  );
}

export default index;
