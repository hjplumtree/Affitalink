export async function fetchCjAdvertisers() {
  let parseString = require("xml2js").parseString;
  try {
    const response = await fetch("/cj-advertisers", {
      headers: {
        Authorization: "Bearer " + process.env.NEXT_PUBLIC_CJ_TOKEN,
      },
    });

    if (!response.ok) {
      throw new Error("HTTP Erorr Status : " + response.status);
    }

    let advertisers = [];
    const xml = await response.text();
    parseString(xml, (error, result) => {
      if (error) throw new Error(error.message);
      advertisers = result["cj-api"].advertisers[0];
    });
    return advertisers;
  } catch (e) {
    throw new Error("Fetching error : " + e.message);
  }
}