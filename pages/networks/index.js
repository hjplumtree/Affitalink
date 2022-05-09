import Header from "../../components/Header";
import NetworkSiteList from "../../components/NetworkSiteList";
import SectionBox from "../../components/SectionBox";
import { Box, VStack } from "@chakra-ui/react";
import cj_logo from "../../public/cj.png";
import rakuten_logo from "../../public/rakuten.png";
import impact_logo from "../../public/impact_logo.png";
import ebay_logo from "../../public/ebay_logo.png";

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
            imageUrl={rakuten_logo}
            name="Rakuten"
            subtitle="Connect with Rakuten network"
            endpoint="rakuten"
          />
          <NetworkSiteList
            imageUrl={cj_logo}
            name="CJ"
            subtitle="Connect with CJ network"
            endpoint="cj"
          />
          <NetworkSiteList
            imageUrl={impact_logo}
            name="Impact"
            subtitle="Connect with Impact network"
            endpoint={false}
          />
          <NetworkSiteList
            imageUrl={ebay_logo}
            name="eBay"
            subtitle="Connect with eBay network"
            endpoint={false}
          />
        </VStack>
      </Box>
    </SectionBox>
  );
}

export default index;
