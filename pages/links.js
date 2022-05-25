import { useState, useEffect } from "react";
import LinksHeader from "../components/LinksHeader";
import LinksList from "../components/LinksList";
import { VStack, useToast } from "@chakra-ui/react";
import { fetchLinks } from "../lib/fetch";
import { fetchTestLinks } from "../lib/demoFetch";
import Loading from "../components/Loading";
export default function LinksPage() {
  const [links, setLinks] = useState([]);
  const [networkSites, setNetworkSites] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [error, setError] = useState("");

  useEffect(() => {
    let sites = [];
    for (const [key, value] of Object.entries(localStorage)) {
      if (!!value && key !== "ally-supports-cache") {
        const parsedValue = JSON.parse(value);
        sites.push({ name: key, info: parsedValue });
      }
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
      if (typeof data === "string") {
        setError(data);
      } else {
        setLinks(data);
      }
      setLoading(false);
    })();
  };

  useEffect(() => {
    if (!selectedNetwork) return;
    saveOffersToDB();
  }, [links]);

  useEffect(() => {
    if (!selectedNetwork) return;
    const data = getOffersFromDB(selectedNetwork.name);
    setLinks(data);
  }, [selectedNetwork]);

  const saveOffersToDB = () => {
    const { name } = selectedNetwork;
    const current_data = { ...JSON.parse(localStorage.getItem(name)) };
    const updated_data = { ...current_data };
    updated_data["offers"] = links;
    localStorage.setItem(name, JSON.stringify(updated_data));
  };

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
