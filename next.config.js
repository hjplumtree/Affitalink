/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/cj-advertisers",
        destination: `https://advertiser-lookup.api.cj.com/v2/advertiser-lookup`,
      },
      {
        source: "/cj-links",
        destination: `https://link-search.api.cj.com/v2/link-search`,
      },

      // Doesn't work! Because POST??
      {
        source: "/rakuten-token",
        destination: "https://api.linksynergy.com/token",
      },
      {
        source: "/rakuten-links",
        destination: "https://api.linksynergy.com/coupon/1.0",
      },
      {
        source: "/rakuten-advertisers",
        destination:
          "https://api.linksynergy.com/linklocator/1.0/getMerchByAppStatus/approved",
      },
    ];
  },
};

module.exports = nextConfig;
