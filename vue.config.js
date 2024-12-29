const { defineConfig } = require('@vue/cli-service')
const webpack = require("webpack");
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
      })
    ],
  },
  devServer: {
    client: {
      overlay: {
        runtimeErrors: (error) => {
          const ignoreErrors = [
            "ResizeObserver loop limit exceeded",
            "ResizeObserver loop completed with undelivered notifications.",
          ];
          if (ignoreErrors.includes(error.message)) {
            return false;
          }
          return true;
        },
      },
    },
  }
});
