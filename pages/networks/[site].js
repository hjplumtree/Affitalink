import { useRouter } from "next/router";
import { useCallback, useState, useEffect } from "react";
import NetworkSiteSetting from "../../components/NetworkSiteSetting";
import AdvertiserLists from "../../components/AdvertiserLists";
import Loading from "../../components/Loading";
import RequireAuth from "../../components/RequireAuth";
import { useAuth } from "../../components/AuthProvider";
import { authFetch } from "../../lib/client/authFetch";
import { Badge } from "../../components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { useToastMessage } from "../../components/ToastProvider";

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

const ADVERTISERS_INITIAL_STATE = {
  page: 0,
  advertisers_list: [],
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
  const toast = useToastMessage();
  const { getAccessToken } = useAuth();

  const [advertisers, setAdvertisers] = useState(ADVERTISERS_INITIAL_STATE);
  const [auth, setAuth] = useState(null);
  const [connectorStatus, setConnectorStatus] = useState(null);

  const loadConnector = useCallback(async () => {
    if (!network_site_name) return;
    setLoading(true);
    try {
      const response = await authFetch(getAccessToken, `/api/connectors/${network_site_name}`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error?.message || "Could not load source settings");
      }

      const connector = payload?.connector || {
        auth: getInitialAuth(network_site_name),
        merchants: [],
        status: "not_connected",
      };

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
    } catch (error) {
      setAuth(getInitialAuth(network_site_name));
      setAdvertisers(ADVERTISERS_INITIAL_STATE);
      setConnectorStatus({
        status: "warning",
        message: error.message || "Could not load source settings.",
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
    setAdvertisers(ADVERTISERS_INITIAL_STATE);
    setAuth(getInitialAuth(network_site_name));
    setConnectorStatus({
      status: "not_connected",
      message: "Source removed.",
    });
  };

  return (
    <RequireAuth>
      {auth ? (
        <div className="space-y-5">
          <Card className="border-white/60 bg-white/95">
            <CardHeader className="space-y-5">
              <Badge className="w-fit">Source settings</Badge>
              <div className="space-y-3">
                <CardTitle className="text-4xl">{`Set up ${network_site_name?.toUpperCase()}`}</CardTitle>
                <CardDescription className="max-w-3xl text-base leading-7">
                  Save credentials, test the connection, and choose which merchants should appear in your incoming offer updates.
                </CardDescription>
              </div>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Set up the source here, then go back to the queue when the connection is working.
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-[24px] bg-muted p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Test</p>
                  <p className="mt-2 text-sm leading-6 text-foreground/85">
                    Test the saved credentials before trusting this source.
                  </p>
                </div>
                <div className="rounded-[24px] bg-muted p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Select</p>
                  <p className="mt-2 text-sm leading-6 text-foreground/85">
                    Turn on only the merchants you want to monitor.
                  </p>
                </div>
                <div className="rounded-[24px] bg-muted p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Return</p>
                  <p className="mt-2 text-sm leading-6 text-foreground/85">
                    Go back to the review workspace once this source is working.
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

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
        </div>
      ) : null}
      <Loading loading={loading} />
    </RequireAuth>
  );
}
