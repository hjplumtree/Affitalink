const dummy_advertisers = [
  { id: "42680", name: "24S", isChecked: true },
  { id: "41970", name: "ASOS", isChecked: true },
  { id: "37978", name: "Macys", isChecked: true },
  { id: "13816", name: "Saks Fifth Avenue", isChecked: true },
  { id: "40584", name: "Yoox", isChecked: true },
];

export async function fecthTestAdvertisers(auth) {
  if (Object.values(auth).every((ele) => ele === "77777")) {
    await timeout(2000);
    return { page: 0, advertisers_info: dummy_advertisers };
  } else {
    return "Invalid information provided";
  }
}

async function timeout(sec) {
  return new Promise((resolve) => setTimeout(resolve, sec));
}
