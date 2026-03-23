/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: "Premium Salon App",
  slug: "premium-salon-app",
  version: "1.0.0",
  scheme: "premium-salon-app",
  experiments: {
    baseUrl: process.env.GITHUB_ACTIONS === 'true' ? '/premium-salon-app' : ''
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/favicon.png"
  },
  plugins: [
    "expo-router"
  ]
};

module.exports = config;
