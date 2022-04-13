import Header from "../../components/Header";
import NetworkSite from "../../components/NetworkSite";
import { Box } from "@chakra-ui/react";
import logo from "../../public/link_reduced.png";

function index() {
  return (
    <Box w="100%">
      <Box margin="0 auto" maxWidth="1000px" border="1px solid red">
        <Header
          title="NETWORKS"
          subtitle="Connect network sites to get links"
        />
        <Box>
          <NetworkSite
            imageUrl={logo}
            name="CJ"
            subtitle="Connect with CJ network"
            endpoint="cj"
          />
        </Box>
      </Box>
    </Box>
  );
}

export default index;
