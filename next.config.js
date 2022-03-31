/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/cj-advertisers",
        destination: `${process.env.NEXT_PUBLIC_CJ_ADVERTISERS_BASE_URL}?requestor-cid=${process.env.NEXT_PUBLIC_CJ_REQUESTOR_ID}&advertiser-ids=${process.env.NEXT_PUBLIC_CJ_ADVERTISER_IDS}`,
      },
      {
        source: "/offers/:slug",
        destination: `${process.env.NEXT_PUBLIC_CJ_OFFERS_BASE_URL}?website-id=${process.env.NEXT_PUBLIC_CJ_WEBSITE_ID}&advertiser-ids=:slug`,
      },
    ];
  },
};

module.exports = nextConfig;
