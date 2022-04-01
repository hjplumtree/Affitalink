import { fetchCjAdvertisers } from "../lib/fetch";
import uppercaseFirstLetter from "../lib/uppercase";

export default function ListHeader({
  networkSites,
  setData,
  selectedNetwork,
  setSelectedNetwork,
}) {
  const handleClick = () => {
    const network_info = selectedNetwork.info;
    fetchCjAdvertisers(network_info).then((data) => {
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
