import { useEffect, useState, useRef } from "react";
import { fetchCjAdvertisers } from "../lib/fetch";

export default function ListHeader({ data, setData }) {
  const [networkSites, setNetworkSites] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState({});

  useEffect(() => {
    let newState = [];
    for (const [key, value] of Object.entries(localStorage)) {
      if (!!value && key !== "ally-supports-cache") {
        newState.push({ name: key, token: value });
      }
    }
    setNetworkSites(newState);
    setSelectedNetwork(newState[0]);
  }, []);

  const handleClick = () => {
    const token = selectedNetwork.token;
    fetchCjAdvertisers(token).then((data) => {
      setData(data);
    });
  };

  const handleChange = (e) => {
    setSelectedNetwork(networkSites[e.target.selectedIndex]);
  };

  return (
    <header>
      <div>
        <h1>{selectedNetwork.name}</h1>
        <p>last update : 2022-03-27</p>
      </div>
      <div>
        <button onClick={handleClick}>Get Data</button>
        <select onChange={handleChange}>
          {networkSites.map((advertiser) => (
            <option
              data-name={advertiser.name}
              key={advertiser.name}
              value={advertiser.token}
            >
              {advertiser.name.slice(0, 1).toUpperCase() +
                advertiser.name.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
