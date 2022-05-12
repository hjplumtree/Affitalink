export async function fecthTestAdvertisers(auth) {
  if (Object.values(auth).every((ele) => ele === "77777")) {
    await timeout(2000);
    return { page: 0, advertisers_info: dummy_advertisers };
  } else {
    return "Invalid information provided";
  }
}

export async function fetchTestLinks(ids) {
  await timeout(2000);
  const filtered_links = dummy_links.filter((link) =>
    ids.includes(link.advertiser_id),
  );
  return { page: 0, data: filtered_links };
}

async function timeout(sec) {
  return new Promise((resolve) => setTimeout(resolve, sec));
}

const dummy_advertisers = [
  { id: "42680", name: "24S", isChecked: true },
  { id: "5338367", name: "Agoda", isChecked: true },
  { id: "4529306", name: "Forever 21", isChecked: true },
  { id: "13816", name: "Saks Fifth Avenue", isChecked: true },
  { id: "40584", name: "Yoox", isChecked: true },
];

const dummy_links = [
  {
    link_id: "1",
    advertiser_id: "13816",
    advertiser_name: "Saks Fifth Avenue",
    link_name: "Spring Sale",
    description:
      "Spring Sale: Up to 30% OFF* Select Kid's Styles Including Ralph Lauren & Camilla! Valid 5/5-6.5. Shop Now!",
    coupon_code: "",
    click_url:
      "https://click.linksynergy.com/fs-bin/click?id=F6WR5pfQj3Y&offerid=778432.10007473&type=3&subid=0",
    link_type: "TEXT",
    link_code_html: "",
  },
  {
    link_id: "2",
    advertiser_id: "4529306",

    advertiser_name: "Forever 21",
    link_name: "Extra 40% Off Sale",
    description:
      "Valid 5/4/22 - 5/11/22. Online/In-app only on the Extra 40% Off Sale pages only. To redeem online at Forever21.com or in-app on the Forever 21 app, enter code EXTRA40 at checkout. Valid on items tagged Use Code: Extra40. Cannot be combined with any other offer (excluding shipping promotions). Excludes Summer Sale 30% Off All Dresses, Tops, Shorts, Swim, Sandals, Jewelry and Hats, Last Chance Sale, and The Final Few Sale. Not applicable to the purchase of gift cards or e-gift cards, or to taxes, shipping or handling charges. Applies to new purchases only. Forever 21 reserves the right to modify or cancel this promotion at any time without notice.",
    coupon_code: "EXTRA40",
    click_url: "https://www.tkqlhce.com/click-7928723-15239843-1651827172000",
    link_type: "Text Link",
    link_code_html: `<a href="https://www.tkqlhce.com/click-7928723-15239843-1651827172000">Extra 40% Off Sale</a><img src="https://www.ftjcfx.com/image-7928723-15239843-1651827172000" width="1" height="1" border="0"/>`,
  },
  {
    link_id: "3",
    advertiser_id: "42680",

    advertiser_name: "24S",

    link_name: "15% OFF ON YOUR FIRST PURCHASE",
    description: "24S |15% OFF ON YOUR FIRST PURCHASE AT 24S | CODE: 15FIRST",
    coupon_code: "15FIRST",
    click_url:
      "https://click.linksynergy.com/fs-bin/click?id=F6WR5pfQj3Y&offerid=1104133.215&type=3&subid=0",
    link_type: "TEXT",
    link_code_html: "",
  },
  {
    link_id: "4",
    advertiser_id: "40584",

    advertiser_name: "Yoox",
    link_name: "Up To 80% Off!",
    description: "AU | Promotion | Sale – Up To 80% Off!",
    coupon_code: "",
    click_url:
      "https://click.linksynergy.com/fs-bin/click?id=F6WR5pfQj3Y&offerid=401023.699&type=3&subid=0",
    link_type: "TEXT",
    link_code_html: "",
  },
  {
    link_id: "5",
    advertiser_id: "13816",

    advertiser_name: "Saks Fifth Avenue",
    link_name: "Gift with Purchase",
    description:
      "Estée Lauder: Add More Style To Your Gift. Receive a full-size Re-Nutriv Hydrating Foam Cleanser, headband and Exclusive drawstring bag with any Estée Lauder purchase of $200.* Valid 5/2-5/13. Shop Now!",
    coupon_code: "",
    click_url:
      "https://click.linksynergy.com/fs-bin/click?id=F6WR5pfQj3Y&offerid=778432.10007466&type=3&subid=0",
    link_type: "TEXT",
    link_code_html: "",
  },
  {
    link_id: "6",
    advertiser_id: "5338367",

    advertiser_name: "Agoda",
    link_name: "Save up to 75% on Hotels Worldwide.",
    description:
      "Save up to 75% on Hotels Worldwide. Free Cancellations and Booking Deals",
    coupon_code: "",
    click_url: "https://www.tkqlhce.com/click-7928723-15098251-1636987558000",
    link_type: "TEXT",
    link_code_html: `<a href="https://www.tkqlhce.com/click-7928723-15098251-1636987558000">
    <img src="https://www.lduhtrp.net/image-7928723-15098251-1636987558000" width="200" height="400" alt="" border="0"/></a>`,
  },
];
