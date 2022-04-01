/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/cj-advertisers",
        destination: `${process.env.NEXT_PUBLIC_CJ_ADVERTISERS_BASE_URL}`,
      },
      {
        source: "/offers",
        destination: `${process.env.NEXT_PUBLIC_CJ_OFFERS_BASE_URL}`,
      },
    ];
  },
};

module.exports = nextConfig;
