module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Disable hot reload websocket strict origin check on preview domains
      return webpackConfig;
    },
  },
  devServer: {
    allowedHosts: 'all',
    host: '0.0.0.0',
    port: 3000,
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws',
    },
  },
};
