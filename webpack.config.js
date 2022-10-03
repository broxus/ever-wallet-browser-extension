const { ProvidePlugin, DefinePlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { resolve } = require('path');
const fs = require('fs');

const SRC_DIR = resolve(__dirname, './src');
const DIST_DIR = resolve(__dirname, './dist');

const manifest = JSON.parse(fs.readFileSync(resolve(SRC_DIR, 'manifest', 'base.json')).toString())
const manifestBeta = JSON.parse(fs.readFileSync(resolve(SRC_DIR, 'manifest', 'beta.json')).toString())

module.exports = [
    (env, { mode }) => ({
        name: 'worker',
        target: 'webworker',
        devtool: mode === 'development' ? 'inline-source-map' : false,
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
                    exclude: /node_modules/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            configFile: mode === 'development' ? 'tsconfig.dev.json' : 'tsconfig.json',
                        },
                    },
                },
            ],
        },

        plugins: [
            new CleanWebpackPlugin(),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: env.beta ? 'icons/beta/*' : 'icons/prod/*',
                        to: '[name][ext]'
                    },
                    {
                        from: 'manifest/base.json',
                        to: 'manifest.json',
                        transform(content) {
                            if (env.beta) {
                                return JSON.stringify({
                                    ...JSON.parse(content.toString()),
                                    ...manifestBeta,
                                }, null, 2)
                            }

                            return content;
                        },
                    },
                ],
            }),
            new DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(mode),
                'process.env.EXT_VERSION': JSON.stringify(manifest.version),
            }),
            new ProvidePlugin({
                process: 'process/browser',
            }),
        ],
    }),

    (env, { mode }) => ({
        name: 'web',
        dependencies: ['worker'],
        devtool: mode === 'development' ? 'inline-source-map' : false,
        context: SRC_DIR,

        experiments: {
            asyncWebAssembly: true,
        },

        entry: {
            popup: ['reflect-metadata', './popup/popup.tsx'],
            phishing: ['./popup/phishing-warning.ts'],
            contentscript: ['reflect-metadata', './contentscript.ts'],
            inpage: {
                import: './inpage.ts',
                library: {
                    name: 'inpage',
                    type: 'umd',
                },
            },
        },

        output: {
            filename: 'js/[name].js',
            path: DIST_DIR,
            assetModuleFilename: 'assets/[name][ext][query]',
            publicPath: '',
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
                    exclude: /node_modules/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            configFile: mode === 'development' ? 'tsconfig.dev.json' : 'tsconfig.json',
                        },
                    },
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
                    type: 'asset/resource',
                },
            ],
        },
        plugins: [
            new DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(mode),
                'process.env.EXT_VERSION': JSON.stringify(manifest.version),
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
            new HtmlWebpackPlugin({
                template: './popup/phishing-warning.html',
                chunks: ['phishing'],
                filename: 'phishing-warning.html',
            }),
        ],
    }),
];
