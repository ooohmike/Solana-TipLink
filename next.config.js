/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = {
  images: {
    domains: ["raw.githubusercontent.com", "api.phantom.app"], // Add any other domains you need here
  },
};
