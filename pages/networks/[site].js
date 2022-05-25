import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import NetworkSiteSetting from "../../components/NetworkSiteSetting";
import AdvertiserLists from "../../components/AdvertiserLists";
import { Box } from "@chakra-ui/react";
import { saveToDB } from "../../lib/storage";

export default function Site() {
  const router = useRouter();
  const { site: network_site_name } = router.query;

  const cj_initial_auth = {
    token: "",
    requestor_id: "",
    website_id: "",
  };

  const rakuten_initial_auth = {
    client_id: "",
    client_secret: "",
    sid: "",
  };

  // Test network auth
  const testnet_initial_auth = {
    test_token_77777: "77777",
    test_sid_77777: "77777",
  };

  const advertisers_initialState = {
    page: 0,
    advertisers_list: [],
  };

  const [advertisers, setAdvertisers] = useState(advertisers_initialState);
  const [auth, setAuth] = useState(null);

  // Initialization
  useEffect(() => {
    if (!router.isReady) return;
    const current_data = {
      ...JSON.parse(localStorage.getItem(network_site_name)),
    };
    if (current_data["auth"]) {
      setAuth(current_data["auth"]);
    } else {
      initializeAuth();
    }
    if (current_data["advertisers"]) {
      setAdvertisers(current_data["advertisers"]);
    } else {
      initializeAdvertisers();
    }
  }, [router.isReady]);

  useEffect(() => {
    if (advertisers["advertisers_list"].length === 0) return;
    saveToDB(network_site_name, "advertisers", advertisers);
  }, [advertisers]);

  useEffect(() => {
    if (!auth) return;
    if (Object.values(auth)[0] === "") return;
    saveToDB(network_site_name, "auth", auth);
  }, [auth]);

  const initializeAuth = () => {
    if (network_site_name === "cj") {
      setAuth(cj_initial_auth);
    } else if (network_site_name === "rakuten") {
      setAuth(rakuten_initial_auth);
    } else if (network_site_name === "testnet") {
      setAuth(testnet_initial_auth);
    }
  };

  const initializeAdvertisers = () => {
    setAdvertisers(advertisers_initialState);
  };

  const deleteLocal = (storageName) => {
    localStorage.removeItem(storageName);
  };

  return (
    <>
      {auth && (
        <Box>
          <NetworkSiteSetting
            networkName={network_site_name.toUpperCase()}
            storageName={network_site_name}
            deleteLocal={deleteLocal}
            setAdvertisers={setAdvertisers}
            auth={auth}
            setAuth={setAuth}
            advertisers_initialState={advertisers_initialState}
            initializeAuth={initializeAuth}
          />

          <AdvertiserLists
            advertisers={advertisers}
            setAdvertisers={setAdvertisers}
          />
        </Box>
      )}
    </>
  );
}
