import { useState, useEffect } from "react";
import LinksHeader from "../components/LinksHeader";
import LinksList from "../components/LinksList";
import { VStack } from "@chakra-ui/react";

export default function LinksPage() {
  const [data, setData] = useState([]);
  const [networkSites, setNetworkSites] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState(null);

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
  }, []);

  return (
    <VStack>
      <LinksHeader
        networkSites={networkSites}
        selectedNetwork={selectedNetwork}
        setSelectedNetwork={setSelectedNetwork}
        setData={setData}
      />
      <LinksList links={data} />
    </VStack>
  );
}
