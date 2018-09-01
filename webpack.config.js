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

const setupApp = app => {
  // TODO: Split out any resource that are expensive to
  // initialize into more persistent references. (e.g. db)
  const config = require("./server/config")({ env: process.env });
  
  // Use an indirect middleware that leans on the require() 
  // cache - clearing cache results in code reload.
  app.use((req, res, next) =>
    require("./server")(config)(req, res, next));

  // These are paths where server-related modules live
  const paths = [ "lib", "server" ]
    .map(name => path.join(__dirname, name));
  
  // Set up a file watcher on the paths.
  const watcher = chokidar.watch(paths, {
    usePolling: true,
    interval: 1000,
    awaitWriteFinish: {
      stabilityThreshold: 1000,
      pollInterval: 500
    }
  });

  // Whenever anything happens to any file, clear the require()
  // cache for *all* watched paths.
  watcher.on("ready", () => {
    watcher.on("all", (event, path) => {
      console.log("Clearing require() cache for server");
      Object.keys(require.cache)
        .filter(id => paths.filter(path => id.startsWith(path)).length > 0)
        .forEach(id => delete require.cache[id]);
    });
  });
};

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
    aggregateTimeout: 500,
    poll: 500
  },
  devServer: {
    disableHostCheck: true,
    public: HOST,
    port: PORT,
    after: setupApp,
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
