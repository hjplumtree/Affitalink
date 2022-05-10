import encodeToTokenkey from "./encode";

export async function fetchLinks({ network, auth, ids }) {
  if (network === "cj") {
    return await fetchCJLinks(auth, ids);
  } else if (network === "rakuten") {
    return await fetchRakutenLinks(auth, ids);
  }
}

async function fetchCJLinks(auth, ids) {
  let parseString = require("xml2js").parseString;
  const advertiser_ids = ids.join(",");
  try {
    const response = await fetch(
      `/cj-links?website-id=${auth.website_id}&advertiser-ids=${advertiser_ids}&records-per-page=50`,
      {
        headers: {
          Authorization: "Bearer " + auth.token,
        },
      }
    );
    if (!response.ok) {
      throw response.status;
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
        link_id: offer["link-id"]?.[0],
        advertiser_name: offer["advertiser-name"]?.[0],
        link_name: offer["link-name"]?.[0],
        description: offer["description"]?.[0],
        coupon_code: offer["coupon-code"]?.[0],
        click_url: offer["clickUrl"]?.[0],
        link_type: offer["link-type"]?.[0],
        link_code_html: offer["link-code-html"]?.[0],
      };
    });

    return { page: $, data: filtered_data };
  } catch (e) {
    return "Invalid information provided";
  }
}

async function fetchRakutenLinks({ client_id, client_secret, sid }, ids) {
  const token = await fetchRakutenToken({
    id: client_id,
    secret: client_secret,
    sid: sid,
  });
  const mid = ids.join("|");
  let parseString = require("xml2js").parseString;

  try {
    const response = await fetch(
      `https://api.linksynergy.com/coupon/1.0?mid=${mid}&resultsperpage=50`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    if (!response.ok) {
      throw response.status;
    }
    let offers = [];
    const xml = await response.text();
    parseString(xml, (e, result) => {
      if (e) throw new Error(e.message);
      offers = result["couponfeed"];
    });

    const { link, ...page } = offers;
    const filtered_data = link.map((offer, index) => {
      return {
        link_id: `${offer["advertiserid"]?.[0]}${index}`,
        advertiser_name: offer["advertisername"]?.[0],
        link_name: offer["promotiontypes"]?.[0]["promotiontype"]?.[0]["_"],
        description: offer["offerdescription"]?.[0],
        coupon_code: offer["couponcode"] ? offer["couponcode"]?.[0] : "",
        click_url: offer["clickurl"]?.[0],
        link_type: offer["$"]["type"],
        link_code_html: "",
      };
    });

    return { page, data: filtered_data };
  } catch (e) {
    return "Invalid information provided";
  }
}

async function fetchRakutenToken({ id, secret, sid }) {
  const tokenkey = encodeToTokenkey(id, secret);
  try {
    const response = await fetch("https://api.linksynergy.com/token", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + tokenkey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `scope=${sid}`,
    });
    if (!response.ok) {
      throw response.status;
    }
    const data = await response.json();
    return data.access_token;
  } catch (e) {
    return "Invalid information provided";
  }
}

export async function fecthAdvertisers({ network, auth }) {
  if (network === "cj") {
    return await fetchCJAdvertisers(auth);
  } else if (network === "rakuten") {
    return await fetchRakutenAdvertisers(auth);
  }
}

async function fetchCJAdvertisers(auth) {
  let parseString = require("xml2js").parseString;
  const urls = [
    `/cj-advertisers?requestor-cid=${auth.requestor_id}&advertiser-ids=joined&records-per-page=100`,
    `/cj-links?website-id=${auth.website_id}&records-per-page=1`,
  ];
  try {
    const response = await Promise.all(
      urls.map((url) =>
        fetch(url, {
          headers: {
            Authorization: "Bearer " + auth.token,
          },
        })
      )
    );

    if (!response.every((res) => res.ok)) {
      throw response.status;
    }

    let data = [];
    const xml = await response[0].text();
    parseString(xml, (e, result) => {
      if (e) throw new Error(e.message);
      data = result["cj-api"].advertisers[0];
    });
    const { $: page, advertiser: advertisers } = data;
    const formatted_advertisers = advertisers.map((advertiser) => {
      return {
        id: advertiser["advertiser-id"][0],
        name: advertiser["advertiser-name"][0],
        category: advertiser["primary-category"][0]["parent"][0],
        seven_day_epc: advertiser["seven-day-epc"][0],
        three_month_epc: advertiser["three-month-epc"][0],
        isChecked: true,
      };
    });
    return { page, advertisers_info: formatted_advertisers };
  } catch (e) {
    return "Invalid information provided";
  }
}

async function fetchRakutenAdvertisers(auth) {
  const token = await fetchRakutenToken({
    id: auth.client_id,
    secret: auth.client_secret,
    sid: auth.sid,
  });

  let parseString = require("xml2js").parseString;

  try {
    const response = await fetch(
      "https://api.linksynergy.com/linklocator/1.0/getMerchByAppStatus/approved",
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    if (!response.ok) {
      throw response.status;
    }

    let advertisers = [];
    const xml = await response.text();
    parseString(xml, (e, result) => {
      if (e) throw new Error(e.message);
      advertisers = result["ns1:getMerchByAppStatusResponse"]["ns1:return"];
    });

    const formatted_advertisers = advertisers.map((advertiser) => {
      return {
        id: advertiser["ns1:mid"][0],
        name: advertiser["ns1:name"][0],
        isChecked: true,
      };
    });
    return { page: 0, advertisers_info: formatted_advertisers };
  } catch (e) {
    return "Invalid information provided";
  }
}
