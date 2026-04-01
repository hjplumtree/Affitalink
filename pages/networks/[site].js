import { useRouter } from "next/router";
import { useCallback, useState, useEffect } from "react";
import NetworkSiteSetting from "../../components/NetworkSiteSetting";
import AdvertiserLists from "../../components/AdvertiserLists";
import { Text, VStack, useToast, SimpleGrid, Box } from "@chakra-ui/react";
import Loading from "../../components/Loading";
import RequireAuth from "../../components/RequireAuth";
import { useAuth } from "../../components/AuthProvider";
import { authFetch } from "../../lib/client/authFetch";
import SectionBox from "../../components/SectionBox";
import Header from "../../components/Header";

const CJ_INITIAL_AUTH = {
  token: "",
  requestor_id: "",
  website_id: "",
};

const RAKUTEN_INITIAL_AUTH = {
  client_id: "",
  client_secret: "",
  sid: "",
};

const TESTNET_INITIAL_AUTH = {
  test_token_77777: "77777",
  test_sid_77777: "77777",
};

function getInitialAuth(network) {
  if (network === "cj") return CJ_INITIAL_AUTH;
  if (network === "rakuten") return RAKUTEN_INITIAL_AUTH;
  return TESTNET_INITIAL_AUTH;
}

export default function Site() {
  const router = useRouter();
  const { site: network_site_name } = router.query;
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { getAccessToken } = useAuth();

  const advertisers_initialState = {
    page: 0,
    advertisers_list: [],
  };

  const [advertisers, setAdvertisers] = useState(advertisers_initialState);
  const [auth, setAuth] = useState(null);
  const [connectorStatus, setConnectorStatus] = useState(null);

  const initializeAuth = () => {
    setAuth(getInitialAuth(network_site_name));
  };

  const loadConnector = useCallback(async () => {
    if (!network_site_name) return;
    setLoading(true);
    try {
      const response = await authFetch(getAccessToken, `/api/connectors/${network_site_name}`);
      const payload = await response.json();
      const connector = payload.connector;
      setAuth(connector.auth || getInitialAuth(network_site_name));
      setAdvertisers({
        page: 0,
        advertisers_list: connector.merchants || [],
      });
      setConnectorStatus({
        status: connector.status,
        message:
          connector.status === "connected"
            ? "Source is saved and ready for manual sync."
            : "No saved source settings yet.",
      });
    } finally {
      setLoading(false);
    }
  }, [network_site_name, getAccessToken]);

  // Initialization
  useEffect(() => {
    if (!router.isReady) return;
    loadConnector();
  }, [router.isReady, loadConnector]);

  const fetchAdvertiserList = async () => {
    setLoading(true);
    try {
      const response = await authFetch(getAccessToken, `/api/connectors/${network_site_name}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auth }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error?.message || "Could not validate source settings");
      }
      setAdvertisers({
        page: 0,
        advertisers_list: payload.connector.merchants || [],
      });
      setConnectorStatus({
        status: "connected",
        message: "Credentials look valid. Merchants are ready to review.",
      });
      toast({
        title: "Source saved",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      setConnectorStatus({
        status: "warning",
        message: error.message,
      });
      toast({ title: error.message, status: "error", duration: 2500 });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdvertiser = async (merchantId) => {
    const nextAdvertisers = advertisers.advertisers_list.map((merchant) =>
      merchant.id === merchantId
        ? { ...merchant, selected: !merchant.selected }
        : merchant
    );
    setAdvertisers({ ...advertisers, advertisers_list: nextAdvertisers });
    await authFetch(getAccessToken, `/api/connectors/${network_site_name}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchants: nextAdvertisers }),
    });
  };

  const deleteDB = async () => {
    await authFetch(getAccessToken, `/api/connectors/${network_site_name}`, {
      method: "DELETE",
    });
    setAdvertisers(advertisers_initialState);
    initializeAuth();
    setConnectorStatus({
      status: "not_connected",
      message: "Source removed.",
    });
  };

  return (
    <RequireAuth>
      {auth ? (
        <VStack align="stretch" spacing={5}>
          <SectionBox bg="rgba(255,255,255,0.98)">
            <Header
              eyebrow="Source settings"
              title={`Set up ${network_site_name?.toUpperCase()}`}
              subtitle="Save credentials, test the connection, and choose which merchants should appear in the review queue."
            />
            <Text mt={5} fontSize="sm" color="ink.600" maxW="48ch">
              Set up the source here, then go back to the queue when the connection is working.
            </Text>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} mt={7}>
              <Box p={4} borderRadius="20px" bg="rgba(15,17,23,0.04)">
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="brand.500">
                  Test
                </Text>
                <Text mt={2} fontSize="sm" color="ink.700">
                  Test the saved credentials before trusting this source.
                </Text>
              </Box>
              <Box p={4} borderRadius="20px" bg="rgba(15,17,23,0.04)">
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="brand.500">
                  Select
                </Text>
                <Text mt={2} fontSize="sm" color="ink.700">
                  Turn on only the merchants you want to monitor.
                </Text>
              </Box>
              <Box p={4} borderRadius="20px" bg="rgba(15,17,23,0.04)">
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="lime.700">
                  Return
                </Text>
                <Text mt={2} fontSize="sm" color="ink.700">
                  Go back to the review workspace once this source is working.
                </Text>
              </Box>
            </SimpleGrid>
          </SectionBox>

          <NetworkSiteSetting
            networkName={network_site_name.toUpperCase()}
            auth={auth}
            setAuth={setAuth}
            fetchAdvertiserList={fetchAdvertiserList}
            deleteDB={deleteDB}
            connectorStatus={connectorStatus}
            helperText="Save credentials, test the connection, and choose which merchants should be monitored."
            actionLabel="Save and test connection"
          />

          <AdvertiserLists
            advertisers={advertisers}
            onToggleAdvertiser={handleToggleAdvertiser}
          />
        </VStack>
      ) : null}
      <Loading loading={loading} />
    </RequireAuth>
  );
}
