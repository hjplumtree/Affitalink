import { useState, useEffect } from "react";
import LinksHeader from "../components/LinksHeader";
import LinksList from "../components/LinksList";
import { VStack } from "@chakra-ui/react";
import { fetchLinks } from "../lib/fetch";

export default function LinksPage() {
  const [offer, setOffer] = useState([]);
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
    console.log(sites);
    setNetworkSites(sites);
    setSelectedNetwork(sites[0]);
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
      setOffer(data);
    });
  };

  return (
    <VStack>
      <LinksHeader
        networkSites={networkSites}
        selectedNetwork={selectedNetwork}
        setSelectedNetwork={setSelectedNetwork}
        fetchOffers={fetchOffers}
      />
      <LinksList links={offer} />
    </VStack>
  );
}
