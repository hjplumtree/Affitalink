import Loading from "./Loading";

export default function AdvertiserLists({ data }) {
  if (data.length === 0) {
    return <Loading />;
  } else {
    const page = data.$;
    const advertisers = data.advertiser;

    console.log(advertisers);
    return (
      <main>
        {advertisers.map((advertiser) => (
          <div key={advertiser["advertiser-id"]}>
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
