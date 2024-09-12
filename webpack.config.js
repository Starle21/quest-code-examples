const webpack = require("webpack");
const path = require("path");

const config = {
  entry: "./11_allDown/11.allDown.js",
  output: {
    path: path.resolve(__dirname, "11_allDown"),
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
    static: path.resolve(__dirname, "11_allDown"),
    compress: false,
    port: 3001,
  },
  devtool: "cheap-module-source-map",
};

module.exports = config;
