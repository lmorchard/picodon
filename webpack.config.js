const webpack = require("webpack");
const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const server = require("./server");
const config = require("./server/config");

const {
  PORT = 8000,
  PROJECT_DOMAIN,
  NODE_ENV = "development"
} = process.env;

const HOST = process.env.HOST || `${PROJECT_DOMAIN}.glitch.me`;

const setupApp = app => server(config({ app, env: process.env }));

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
    aggregateTimeout: 300,
    poll: 1000
  },
  devServer: {
    disableHostCheck: true,
    public: HOST,
    port: PORT,
    before: setupApp,
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
        test: /\.css$/,
        use: [
          "css-hot-loader",
          MiniCssExtractPlugin.loader,
          "css-loader"
        ]
      },
      {
        test: /\.(jpe?g|gif|png|svg)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              hash: "sha512",
              digest: "hex",
              publicPath: "/static/app/images/",
              outputPath: "static/app/images/",
              name: "[name]-[hash].[ext]"
            }
          }
        ]
      }
    ]
  }
};
