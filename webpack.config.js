const webpack = require("webpack");
const path = require("path");
const chokidar = require("chokidar");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const {
  PORT = 8000,
  PROJECT_DOMAIN,
  NODE_ENV = "development"
} = process.env;

const HOST = process.env.HOST || `${PROJECT_DOMAIN}.glitch.me`;
const API_PORT = parseInt(PORT, 10) + 1;

module.exports = {
  mode: NODE_ENV === "development" ? "development" : "production",
  entry: {
    index: "./client/src/index.js"
  },
  output: {
    path: path.resolve(__dirname, "client/build"),
    filename: "[name].js"
  },
  watchOptions: {
    aggregateTimeout: 1500,
    poll: 2000
  },
  devServer: {
    disableHostCheck: true,
    public: HOST,
    port: PORT,
    proxy: {
      '/': {
        target: `http://localhost:${API_PORT}`
      },
      '/socket': {
        target: `ws://localhost:${API_PORT}`,
        ws: true
      }
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": `"${NODE_ENV}"`
    }),
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin()
  ],
  module: {
    rules: [
     {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
            presets: [
              ["@babel/preset-env", { modules: false }],
              "@babel/preset-react"
            ],
            plugins: [
              "react-hot-loader/babel",
              "@babel/plugin-proposal-object-rest-spread",
              "@babel/plugin-proposal-class-properties"
            ]
          }
        }
      },
      {
        test: /\.less$/,
        use: [
          "css-hot-loader",
          MiniCssExtractPlugin.loader,
          "css-loader",
          "less-loader"
        ]
      },
      {
        test: /\.(jpe?g|gif|png|svg)$/i,
        use: [ "file-loader" ]
      }
    ]
  }
};
