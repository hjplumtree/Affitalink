import { useState, useEffect } from "react";
import ListHeader from "../components/ListHeader";
import AdvertiserLists from "../components/AdvertiserLists";

export default function List() {
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
      <AdvertiserLists selectedNetwork={selectedNetwork} data={data} />
    </div>
  );
}
