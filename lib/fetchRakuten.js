export async function fetchTokenKey(info) {
  try {
    const response = await fetch("https://api.linksynergy.com/token", {
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify("scope=3279464"),
    });
  } catch (e) {
    throw new Error("fetching tokenkey error " + e.message);
  }
}

export async function fetchRakutenLinks({ token, id }) {
  let parseString = require("xml2js").parseString;
}

export async function fetchCJLinks({ info, ids }) {
  let parseString = require("xml2js").parseString;
  try {
    // CURRENT: fetch every joined advertiser's links
    // TO DO: Selected advertiers's links in /networks page
    const response = await fetch(
      `/offers?website-id=${info.website_id}&advertiser-ids=joined&records-per-page=50`,
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
