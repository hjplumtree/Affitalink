import { useState, useEffect } from "react";
import LinksHeader from "../components/LinksHeader";
import LinksList from "../components/LinksList";
import { VStack } from "@chakra-ui/react";
import { fetchLinks } from "../lib/fetch";

export default function LinksPage() {
  const [links, setLinks] = useState([]);
  const [networkSites, setNetworkSites] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState(null);

  useEffect(() => {
    let sites = [];
    for (const [key, value] of Object.entries(localStorage)) {
      if (!!value && key !== "ally-supports-cache") {
        const parsedValue = JSON.parse(value);
        sites.push({ name: key, data: parsedValue });
      }
    }
    setNetworkSites(sites);
    setSelectedNetwork(sites[0]);

    if ("offers" in JSON.parse(localStorage.getItem(sites[0].name))) {
      const data = getOffersFromDB(sites[0].name);
      setLinks(data);
    }
  }, []);

  const fetchOffers = () => {
    const { name, data } = selectedNetwork;
    const { auth } = data;
    const advertiser_ids = data["advertisers"]["advertisers_info"]
      .filter((advertiser) => advertiser.isChecked)
      .map((advertiser) => advertiser.id);

    fetchLinks({
      auth: auth,
      network: name,
      ids: advertiser_ids.join(","),
    }).then((data) => {
      setLinks(data);
    });
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
        selectedNetwork={selectedNetwork}
        setSelectedNetwork={setSelectedNetwork}
        fetchOffers={fetchOffers}
      />
      <LinksList links={links} />
    </VStack>
  );
}
