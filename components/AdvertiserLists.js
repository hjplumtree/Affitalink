import Loading from "./Loading";
import { fetchOffers } from "../lib/fetch";
import { useState } from "react";

export default function AdvertiserLists({ selectedNetwork, data }) {
  function handleClick(id) {
    fetchLinks({ info: selectedNetwork.info, id }).then((offers) =>
      setOffers(offers),
    );
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
            <div>Category: {advertiser["primary-category"][0]["parent"]}</div>
            <br />
            <div>EPC</div>
            <div>
              7-day: ${advertiser["seven-day-epc"][0]} / 3-month: $
              {advertiser["three-month-epc"][0]}
            </div>
            <div></div>
          </div>
        ))}
      </main>
    );
  }
}
