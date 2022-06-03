const { ProvidePlugin, DefinePlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { resolve } = require('path');

const SRC_DIR = resolve(__dirname, './src');
const DIST_DIR = resolve(__dirname, './dist');

module.exports = [
  (env, { mode }) => ({
    name: 'worker',
    target: 'webworker',
    devtool: mode === 'development' ? 'inline-source-map' : 'source-map',
    context: SRC_DIR,

    experiments: {
      asyncWebAssembly: true,
    },

    entry: {
      worker: ['reflect-metadata', './worker.ts'],
    },

    output: {
      filename: 'js/[name].js',
      path: DIST_DIR,
    },

    resolve: {
      alias: {
        '@app': resolve(__dirname, './src'),
      },
      extensions: ['.tsx', '.ts', '.js', '.wasm'],
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },

    plugins: [
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          'static',
        ],
      }),
      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(mode),
      }),
      new ProvidePlugin({
        process: 'process/browser',
      }),
    ],
  }),

  (env, { mode }) => ({
    name: 'web',
    dependencies: ['worker'],
    devtool: mode === 'development' ? 'inline-source-map' : 'source-map',
    context: SRC_DIR,

    experiments: {
      asyncWebAssembly: true,
    },

    entry: {
      popup: ['reflect-metadata', './popup/popup.tsx'],
      contentscript: ['reflect-metadata', './contentscript.ts'],
      inpage: {
        import: ['reflect-metadata', './inpage.ts'],
        library: {
          name: 'inpage',
          type: 'umd',
        },
      },
    },

    output: {
      filename: 'js/[name].js',
      path: DIST_DIR,
    },

    resolve: {
      alias: {
        '@app': resolve(__dirname, './src'),
      },
      fallback: {
        'util': require.resolve('util/'),
      },
      extensions: ['.tsx', '.ts', '.js', '.wasm'],
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.s[ac]ss$/i,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          use: [
            {
              loader: 'file-loader',
            },
          ],
        },
      ],
    },
    plugins: [
      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(mode),
      }),
      new ProvidePlugin({
        process: 'process/browser',
      }),
      new HtmlWebpackPlugin({
        template: './popup/popup.html',
        chunks: ['popup'],
        filename: 'popup.html',
      }),
      new HtmlWebpackPlugin({
        template: './popup/home.html',
        chunks: ['popup'],
        filename: 'home.html',
      }),
      new HtmlWebpackPlugin({
        template: './popup/notification.html',
        chunks: ['popup'],
        filename: 'notification.html',
      }),
    ],
  }),
];
