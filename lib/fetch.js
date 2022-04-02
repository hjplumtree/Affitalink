export async function fetchCjAdvertisers(info) {
  let parseString = require("xml2js").parseString;
  try {
    const response = await fetch(
      `/cj-advertisers?requestor-cid=${info.requestorId}&advertiser-ids=joined`,
      {
        headers: {
          Authorization: "Bearer " + info.token,
        },
      },
    );

    if (!response.ok) {
      throw new Error("HTTP Erorr Status : " + response.status);
    }

    let advertisers = [];
    const xml = await response.text();
    parseString(xml, (e, result) => {
      console.log(result);
      if (e) throw new Error(e.message);
      advertisers = result["cj-api"].advertisers[0];
    });
    return advertisers;
  } catch (e) {
    throw new Error("Fetching error : " + e.message);
  }
}

export async function fetchLinks({ info, id }) {
  let parseString = require("xml2js").parseString;
  try {
    // CURRENT: fetch every joined advertiser's links
    // TO DO: Selected advertiers's links in /networks page
    const response = await fetch(
      `/offers?website-id=${info.websiteId}&advertiser-ids=joined&records-per-page=25`,
      {
        headers: {
          Authorization: "Bearer " + info.token,
        },
      },
    );

    if (!response.ok) {
      throw new Error("HTTP Error Status : " + response.status);
    }
    let offers = [];
    const xml = await response.text();
    parseString(xml, (e, result) => {
      if (e) throw new Error(e.message);
      offers = result["cj-api"].links[0];
    });
    return offers;
  } catch (e) {
    throw new Error("Fetching offer error : " + e.message);
  }
}
