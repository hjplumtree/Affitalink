import { useState, useEffect } from "react";
import LinksHeader from "../components/LinksHeader";
import LinksList from "../components/LinksList";
import { VStack } from "@chakra-ui/react";
import { fetchLinks } from "../lib/fetch";
import { saveToDB } from "../lib/storage";
import { fetchTestLinks } from "../lib/demoFetch";
import Loading from "../components/Loading";
export default function LinksPage() {
  const [links, setLinks] = useState([]);
  const [networkSites, setNetworkSites] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let sites = [];
    for (const [key, value] of Object.entries(localStorage)) {
      if (key === "ally-supports-cache") continue;
      const parsedValue = JSON.parse(value);
      if (!parsedValue["advertisers"]) continue;
      sites.push({ name: key, info: parsedValue });
    }
    setNetworkSites(sites);
    setSelectedNetwork(sites[0]);

    if (sites.length === 0) return;
    if ("offers" in JSON.parse(localStorage.getItem(sites[0].name))) {
      const data = getOffersFromDB(sites[0].name);
      setLinks(data);
    }
  }, []);

  const fetchOffers = () => {
    setLoading(true);
    const { name, info } = selectedNetwork;
    const { auth } = info;

    let data = null;
    (async () => {
      const advertiser_ids = info["advertisers"]["advertisers_list"]
        .filter((advertiser) => advertiser.isChecked)
        .map((advertiser) => advertiser.id);
      // test network
      if (name === "testnet") {
        data = await fetchTestLinks(advertiser_ids);
      } else {
        data = await fetchLinks({
          auth: auth,
          network: name,
          ids: advertiser_ids,
        });
      }
      setLinks(data);
      setLoading(false);
    })();
  };

  useEffect(() => {
    if (!selectedNetwork) return;
    saveToDB(selectedNetwork.name, "offers", links);
  }, [links]);

  useEffect(() => {
    if (!selectedNetwork) return;
    const data = getOffersFromDB(selectedNetwork.name);
    setLinks(data);
  }, [selectedNetwork]);

  const getOffersFromDB = (network_name) => {
    const { offers } = { ...JSON.parse(localStorage.getItem(network_name)) };
    return offers;
  };
  return (
    <VStack>
      <LinksHeader
        networkSites={networkSites}
        setSelectedNetwork={setSelectedNetwork}
        fetchOffers={fetchOffers}
      />
      {links && <LinksList links={links} />}

      <Loading loading={loading} />
    </VStack>
  );
}
