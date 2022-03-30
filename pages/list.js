import { useState } from "react";
import ListHeader from "../components/ListHeader";
import AdvertiserLists from "../components/AdvertiserLists";

export default function List() {
  const [data, setData] = useState([]);

  return (
    <div>
      <ListHeader setData={setData} />
      <AdvertiserLists data={data} />
    </div>
  );
}
