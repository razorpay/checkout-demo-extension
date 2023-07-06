const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const coreConfig = {
  mode: "production",
  output: {
    path: path.resolve(__dirname, "dist"), // output folder
    publicPath: "",
    filename: "[name].bundle.js",
  },
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: true,
            },
          },
        ],
        include: /\.module\.css$/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
        exclude: /\.module\.css$/,
      },
      {
        test: /\.(png|jp(e*)g|svg|gif)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "assets/images/[hash]-[name].[ext]",
            },
          },
        ],
      },
    ],
  },
};

module.exports = [
  {
    ...coreConfig,
    entry: {
      popup: "./popup/index.js",
    },
    devServer: {
      port: 3000,
      static: "./dist",
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./popup/index.html", // base html
        filename: "popup.html",
      }),
    ],
  },
  {
    ...coreConfig,
    output: {
      path: path.resolve(__dirname, "dist/scripts"), // output folder
      filename: "[name].bundle.js",
      publicPath: "",
    },
    entry: {
      content: "./scripts/content.js",
    },
  },
  {
    ...coreConfig,
    output: {
      path: path.resolve(__dirname, "dist/scripts"), // output folder
      filename: "[name].bundle.js",
      publicPath: "",
    },
    entry: {
      background: "./scripts/background.js",
    },
  },
];
