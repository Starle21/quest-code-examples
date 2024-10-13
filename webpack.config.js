const webpack = require("webpack");
const path = require("path");

const config = {
  entry: "./16_renderers/16.1.renderers-user.js",
  // entry: "./src/10index.js",
  output: {
    path: path.resolve(__dirname, "16_renderers"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            babelrc: false,
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: { chrome: "69" },
                  shippedProposals: true,
                },
              ],
              "@babel/preset-react",
            ],
          },
        },
      },
    ],
  },
  devServer: {
    static: path.resolve(__dirname, "16_renderers"),
    compress: false,
    port: 3001,
  },
  devtool: "source-map",
  // devtool: "cheap-module-source-map",
};

module.exports = config;
