import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import NetworkSiteSetting from "../../components/NetworkSiteSetting";
import AdvertiserLists from "../../components/AdvertiserLists";
import { Box, useToast } from "@chakra-ui/react";
import { saveToDB } from "../../lib/storage";
import { fecthAdvertisers } from "../../lib/fetch";
import { fecthTestAdvertisers } from "../../lib/demoFetch";
import Loading from "../../components/Loading";

export default function Site() {
  const router = useRouter();
  const { site: network_site_name } = router.query;
  const [loading, setLoading] = useState(false);
  const toast = useToast();

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

  // when advertisers auth
  useEffect(() => {
    if (!auth) return;
    if (Object.values(auth)[0] === "") return;
    saveToDB(network_site_name, "auth", auth);
  }, [auth]);

  // when advertisers change
  useEffect(() => {
    if (advertisers["advertisers_list"].length === 0) return;
    saveToDB(network_site_name, "advertisers", advertisers);
  }, [advertisers]);

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

  const fetchAdvertiserList = () => {
    setLoading(true);
    let data = null;
    (async () => {
      if (network_site_name === "TESTNET") {
        data = await fecthTestAdvertisers(auth);
      } else {
        data = await fecthAdvertisers({
          network: network_site_name,
          auth: auth,
        });
      }

      if (typeof data === "string") {
        toast({ title: data, status: "error", duration: 2000 });
      } else {
        setAdvertisers(data);
        toast({
          title: "Advertisers connected!",
          status: "success",
          duration: 2000,
        });
      }
      setLoading(false);
    })();
  };

  const deleteDB = () => {
    localStorage.removeItem(network_site_name);
    setAdvertisers(advertisers_initialState);
    initializeAuth();
  };

  return (
    <>
      {auth && (
        <Box>
          <NetworkSiteSetting
            networkName={network_site_name.toUpperCase()}
            auth={auth}
            setAuth={setAuth}
            fetchAdvertiserList={fetchAdvertiserList}
            deleteDB={deleteDB}
          />

          <AdvertiserLists
            advertisers={advertisers}
            setAdvertisers={setAdvertisers}
          />
        </Box>
      )}
      <Loading loading={loading} />
    </>
  );
}
