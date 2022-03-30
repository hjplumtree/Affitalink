import { fetchCjAdvertisers } from "../lib/fetch";
import { useEffect, useState } from "react";
import ListHeader from "../components/ListHeader";

export default function List() {
  const [data, setData] = useState({});

  return (
    <div>
      <ListHeader />

      <main>
        <div>
          <h3>Ashford</h3>
          <p>13 Offers</p>
        </div>
      </main>
    </div>
  );
}
