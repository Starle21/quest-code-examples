const webpack = require("webpack");
const path = require("path");

const config = {
  entry: "./14_reactAtoms/14.reactAtoms.8.js",
  output: {
    path: path.resolve(__dirname, "14_reactAtoms"),
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
    static: path.resolve(__dirname, "14_reactAtoms"),
    compress: false,
    port: 3001,
  },
  devtool: "source-map",
  // devtool: "cheap-module-source-map",
};

module.exports = config;
