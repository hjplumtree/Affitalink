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
    sid: "",
  };

  // Test network auth
  const testnet_initialState = {
    test_token_77777: "77777",
    test_sid_77777: "77777",
  };

  const advertisers_initialState = {
    page: 0,
    advertisers_info: [],
  };
  const [advertisers, setAdvertisers] = useState(advertisers_initialState);
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    const current_data = { ...JSON.parse(localStorage.getItem(site)) };
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
    if (advertisers["advertisers_info"].length === 0) return;
    saveToDB("advertisers", advertisers);
  }, [advertisers]);

  useEffect(() => {
    if (!auth) return;
    if (Object.values(auth)[0] === "") return;
    saveToDB("auth", auth);
  }, [auth]);

  const saveToDB = (name, data) => {
    const current_data = { ...JSON.parse(localStorage.getItem(site)) };
    const updated_data = { ...current_data };
    updated_data[name] = data;
    localStorage.setItem(site, JSON.stringify(updated_data));
  };

  const initializeAuth = () => {
    if (site === "cj") {
      setAuth(cj_initialState);
    } else if (site === "rakuten") {
      setAuth(rakuten_initialState);
    } else if (site === "testnet") {
      setAuth(testnet_initialState);
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
            networkName={site.toUpperCase()}
            storageName={site}
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
