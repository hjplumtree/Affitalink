import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import NetworkSiteSetting from "../../components/NetworkSiteSetting";
import AdvertiserLists from "../../components/AdvertiserLists";
import { Box } from "@chakra-ui/react";

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
  const [data, setData] = useState({
    page: 0,
    advertisers: [],
  });
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    console.log(localStorage);
    if (!router.isReady) return;
    const current_data = { ...JSON.parse(localStorage.getItem(site)) };
    if (current_data["auth"]) {
      setAuth(current_data["auth"]);
    } else {
      initializeAuth();
    }
  }, [router.isReady]);

  const saveAuthToDB = (info) => {
    const current_data = { ...JSON.parse(localStorage.getItem(site)) };
    const updated_data = { ...current_data };
    updated_data["auth"] = info;
    localStorage.setItem(site, JSON.stringify(updated_data));
  };

  const initializeAuth = () => {
    if (site === "cj") {
      setAuth(cj_initialState);
      saveAuthToDB(cj_initialState);
    } else if (site === "rakuten") {
      setAuth(rakuten_initialState);
      saveAuthToDB(rakuten_initialState);
    }
  };

  return (
    <>
      {auth && (
        <Box>
          <NetworkSiteSetting
            networkName={site.toUpperCase()}
            storageName={site}
            initializeAuth={initializeAuth}
            setData={setData}
            saveAuthToDB={saveAuthToDB}
            auth={auth}
            setAuth={setAuth}
          />

          <AdvertiserLists data={data} setData={setData} />
        </Box>
      )}
    </>
  );
}
