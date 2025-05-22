/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    const MiniCssExtractPlugin = require('mini-css-extract-plugin');
    config.plugins.push(new MiniCssExtractPlugin());
    
    return config;
  },
}

module.exports = nextConfig 