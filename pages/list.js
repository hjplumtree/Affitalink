import { useState } from "react";
import ListHeader from "../components/ListHeader";
import AdvertiserLists from "../components/AdvertiserLists";

export default function List() {
  const [data, setData] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState(null);

  return (
    <div>
      <ListHeader
        selectedNetwork={selectedNetwork}
        setSelectedNetwork={setSelectedNetwork}
        setData={setData}
      />
      <AdvertiserLists selectedNetwork={selectedNetwork} data={data} />
    </div>
  );
}
