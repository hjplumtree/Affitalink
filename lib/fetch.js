export async function fetchLinks({ network, info, ids }) {
  let parseString = require("xml2js").parseString;

  if (network === "cj") {
    return await fetchCJLinks(info);
  } else if (network === "rakuten") {
    console.log(info);
  }
}

async function fetchCJLinks(info) {
  let parseString = require("xml2js").parseString;

  try {
    const response = await fetch(
      `/offers?website-id=${info.website_id}&advertiser-ids=joined&records-per-page=50`,
      {
        headers: {
          Authorization: "Bearer " + info.token,
        },
      },
    );
    if (!response.ok) {
      throw new Error("CJ HTTP Error Status : " + response.status);
    }
    const xml = await response.text();
    let offers = [];
    parseString(xml, (e, result) => {
      if (e) throw new Error(e.message);
      offers = result["cj-api"].links[0];
    });

    const { $, link } = offers;
    const filtered_data = link.map((offer) => {
      return {
        link_id: offer["link-id"][0],
        advertiser_name: offer["advertiser-name"][0],
        link_name: offer["link-name"][0],
        description: offer["description"][0],
        coupon_code: offer["coupon-code"][0],
        click_url: offer["clickUrl"][0],
        link_type: offer["link-type"][0],
        link_code_html: offer["link-code-html"][0],
      };
    });

    return { page: $, data: filtered_data };
  } catch (e) {
    throw new Error("Fetching CJ links error : " + e.message);
  }
}

async function fetchRakutenTokenKey(info) {
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

async function fetchRakutenLinks(info) {
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

/* Comment out till select advertiser */

// export async function fetchCJAdvertisers(info) {
//   let parseString = require("xml2js").parseString;
//   try {
//     const response = await fetch(
//       `/cj-advertisers?requestor-cid=${info.requestorId}&advertiser-ids=joined`,
//       {
//         headers: {
//           Authorization: "Bearer " + info.token,
//         },
//       },
//     );

//     if (!response.ok) {
//       throw new Error("HTTP Erorr Status : " + response.status);
//     }

//     let advertisers = [];
//     const xml = await response.text();
//     parseString(xml, (e, result) => {
//       if (e) throw new Error(e.message);
//       advertisers = result["cj-api"].advertisers[0];
//     });
//     return advertisers;
//   } catch (e) {
//     throw new Error("Fetching error : " + e.message);
//   }
// }
