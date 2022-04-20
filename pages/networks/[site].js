import { useRouter } from "next/router";
import { useState } from "react";
import NetworkSiteSetting from "../../components/NetworkSiteSetting";
import SectionBox from "../../components/SectionBox";
import { Box } from "@chakra-ui/react";
import AdvertiserLists from "../../components/AdvertiserLists";

export default function Site() {
  const router = useRouter();
  const { site } = router.query;

  const cj_initialState = {
    token: "",
    requestor_id: "",
    website_id: "",
  };

  const rakuten_initialState = {
    client_id: "",
    client_secret: "",
  };
  const [cjInfo, setCjInfo] = useState(cj_initialState);
  const [rakutenInfo, setRakutenInfo] = useState(rakuten_initialState);
  const [data, setData] = useState({
    page: null,
    advertisers: [],
  });
  return (
    <Box>
      {site === "cj" && (
        <NetworkSiteSetting
          info={cjInfo}
          setInfo={setCjInfo}
          networkName="CJ"
          storageName="cj"
          initialState={cj_initialState}
          setData={setData}
        />
      )}
      {site === "rakuten" && (
        <NetworkSiteSetting
          info={rakutenInfo}
          setInfo={setRakutenInfo}
          networkName="RAKUTEN"
          storageName="rakuten"
          initialState={rakuten_initialState}
          setData={setData}
        />
      )}
      <AdvertiserLists data={data} />
    </Box>
  );
}
