const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000/api',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/api': ''
        }
      },
      '/socket.io': {
        target: 'http://127.0.0.1:3010', // target host
        changeOrigin: true, // needed for virtual hosted sites
        logLevel: 'debug'
      },
      '/download': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/download': ''
        }
      },
    }
  }
});
