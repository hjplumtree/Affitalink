import { useState, useEffect } from "react";
import ListHeader from "../components/LinksHeader";
import LinksList from "../components/LinksList";

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
    <div>
      <ListHeader
        networkSites={networkSites}
        selectedNetwork={selectedNetwork}
        setSelectedNetwork={setSelectedNetwork}
        setData={setData}
      />
      <LinksList links={data} />
    </div>
  );
}
