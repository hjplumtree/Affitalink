import { useEffect, useState, useRef } from "react";
import { fetchCjAdvertisers } from "../lib/fetch";
import uppercaseFirstLetter from "../lib/uppercase";

export default function ListHeader({
  setData,
  selectedNetwork,
  setSelectedNetwork,
}) {
  const [networkSites, setNetworkSites] = useState([]);

  useEffect(() => {
    let newState = [];
    for (const [key, value] of Object.entries(localStorage)) {
      if (!!value && key !== "ally-supports-cache") {
        newState.push({ name: key, token: value });
      }
    }
    console.log(localStorage);
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
        <h1>{selectedNetwork && uppercaseFirstLetter(selectedNetwork.name)}</h1>
        <p>last update : 2022-03-27</p>
      </div>
      <div>
        <button onClick={handleClick}>Fetch Advertisers</button>
        <select onChange={handleChange}>
          {networkSites.map((advertiser) => (
            <option
              data-name={advertiser.name}
              key={advertiser.name}
              value={advertiser.token}
            >
              {uppercaseFirstLetter(advertiser.name)}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
