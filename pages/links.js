import { useState, useEffect } from "react";
import LinksHeader from "../components/LinksHeader";
import LinksList from "../components/LinksList";
import { VStack } from "@chakra-ui/react";

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
    const {
      name,
      data: { advertisers },
    } = selectedNetwork;
    console.log(advertisers);
    // fetchLinks({ info: network_info, network: name }).then((data) => {
    //   setOffer(data);
    // });
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
