/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, options) => {
    if (!config.externals) {
      config.externals = [];
    }

    config.externals = ["geoip-lite", ...config.externals];

    return config;
  },
};

module.exports = nextConfig;
