import Loading from "./Loading";
import { fetchOffers } from "../lib/fetch";

export default function AdvertiserLists({ selectedNetwork, data }) {
  function handleClick(id) {
    fetchOffers({ info: selectedNetwork.info, id });
  }

  if (data.length === 0) {
    return <Loading />;
  } else {
    const page = data.$;
    const advertisers = data.advertiser;

    return (
      <main>
        {advertisers.map((advertiser) => (
          <div
            onClick={() => handleClick(...advertiser["advertiser-id"])}
            style={{ cursor: "pointer", border: "1px red solid" }}
            key={advertiser["advertiser-id"]}
          >
            <div>{advertiser["advertiser-name"][0]}</div>
            <div>id: {advertiser["advertiser-id"]}</div>
            <div>Category: {advertiser["primary-category"][0]["child"]}</div>
          </div>
        ))}
        <div></div>
      </main>
    );
  }
}
