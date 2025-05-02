const path = require('path');
const { ProvidePlugin, DefinePlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { resolve } = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const SRC_DIR = resolve(__dirname, './src');
const DIST_DIR = resolve(__dirname, './dist');
const TS_CONFIG = resolve(__dirname, 'tsconfig.json');
const TS_CONFIG_DEV = resolve(__dirname, 'tsconfig.dev.json');

const manifest = JSON.parse(fs.readFileSync(resolve(SRC_DIR, 'manifest', 'base.json')).toString())
const manifestBeta = JSON.parse(fs.readFileSync(resolve(SRC_DIR, 'manifest', 'beta.json')).toString())
const manifestFirefox = JSON.parse(fs.readFileSync(resolve(SRC_DIR, 'manifest', 'firefox.json')).toString())

let tag;
try {
    tag = execSync('git describe --tags --abbrev=0 2>/dev/null').toString().trim();
} catch (error) {
    tag = 'v0.0.0'; 
}

let additionalCommits;
try {
    additionalCommits = execSync(`git rev-list ${tag}..HEAD --count 2>/dev/null || echo "0"`).toString().trim();
} catch (error) {
    additionalCommits = '0'; 
}

module.exports = [
    (env, { mode }) => ({
        name: 'worker',
        target: 'webworker',
        devtool: mode === 'development' ? 'cheap-module-source-map' : false,
        context: SRC_DIR,

        entry: {
            worker: ['./worker.ts'],
        },

        output: {
            filename: 'js/[name].js',
            path: DIST_DIR,
            assetModuleFilename: 'assets/[name][ext][query]',
        },

        optimization: {
            chunkIds: 'named',
            moduleIds: 'named',
        },

        resolve: {
            alias: {
                '@app': resolve(__dirname, './src'),
            },
            extensions: ['.tsx', '.ts', '.js'],
        },

        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            configFile: mode === 'development' ? TS_CONFIG_DEV : TS_CONFIG,
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
                        from: (env.beta) ? 'icons/beta/*' : 'icons/prod/*',
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
                            if (env.firefox) {
                                return JSON.stringify({
                                    ...JSON.parse(content.toString()),
                                    ...manifestFirefox,
                                }, null, 2)
                            }


                            return content;
                        },
                    },
                ],
            }),
            new DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(mode),
                'process.env.EXT_ENV': JSON.stringify(env.beta ? 'beta' : 'prod'),
                'process.env.EXT_VERSION': JSON.stringify(manifest.version),
                'process.env.EXT_ADDITIONAL_COMMITS': JSON.stringify(additionalCommits),
                'process.env.EXT_NAME': JSON.stringify(manifest.name),
                'process.env.EXT_RDNS': JSON.stringify('com.sparxwallet'),
            }),
            new ProvidePlugin({
                process: 'process/browser',
            }),
            new ForkTsCheckerWebpackPlugin({
                typescript: {
                    configFile: mode === 'development' ? TS_CONFIG_DEV : TS_CONFIG,
                },
            }),
        ],
    }),

    (env, { mode }) => ({
        name: 'web',
        dependencies: ['worker'],
        devtool: mode === 'development' ? 'cheap-module-source-map' : false,
        context: SRC_DIR,

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

        optimization: {
            chunkIds: 'named',
            moduleIds: 'named',
        },

        resolve: {
            alias: {
                '@app': resolve(__dirname, './src'),
            },
            fallback: {
                'util': require.resolve('util/'),
                buffer: require.resolve('buffer'),
            },
            extensions: ['.tsx', '.ts', '.js'],
        },

        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            configFile: mode === 'development' ? TS_CONFIG_DEV : TS_CONFIG,
                        },
                    },
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                modules: {
                                    auto: true,
                                    localIdentName: '[local]__[hash:base64:8]',
                                    exportLocalsConvention: 'camelCase',
                                },
                                importLoaders: 1,
                            }
                        },
                        'sass-loader',
                        {
                            loader: 'sass-resources-loader',
                            options: {
                                hoistUseStatements: true,
                                resources: [
                                    path.resolve('./src/popup/styles/_theme.scss'),
                                    path.resolve('./src/popup/styles/_typo.scss'),
                                    path.resolve('./src/popup/styles/_variables.scss'),
                                    path.resolve('./src/popup/styles/_mixins.scss'),
                                ],
                            },
                        },
                    ],
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/i,
                    type: 'asset/resource',
                },
                {
                    test: /\.svg$/i,
                    issuer: /\.[jt]sx?$/,
                    include: resolve(SRC_DIR, 'popup/assets/icons'),
                    use: [{
                        loader: require.resolve('@svgr/webpack'),
                        options: {
                            prettier: false,
                            svgo: false,
                            svgoConfig: {
                                plugins: [{ removeViewBox: false }],
                            },
                            titleProp: true,
                            ref: true,
                        },
                    }],
                },
                {
                    test: /\.(png|jpe?g|gif|svg)$/i,
                    type: 'asset/resource',
                    exclude: resolve(SRC_DIR, 'popup/assets/icons'),
                },
            ],
        },

        plugins: [
            new DefinePlugin({
                'process.env.EXT_ENV': JSON.stringify(env.beta ? 'beta' : 'prod'),
                'process.env.NODE_ENV': JSON.stringify(mode),
                'process.env.EXT_VERSION': JSON.stringify(manifest.version),
                'process.env.EXT_ADDITIONAL_COMMITS': JSON.stringify(additionalCommits),
                'process.env.EXT_NAME': JSON.stringify(manifest.name),
                'process.env.EXT_RDNS': JSON.stringify('com.sparxwallet'),
            }),
            new ProvidePlugin({
                process: 'process/browser',
                Buffer: ['buffer', 'Buffer'],
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
            new ForkTsCheckerWebpackPlugin({
                typescript: {
                    configFile: mode === 'development' ? TS_CONFIG_DEV : TS_CONFIG,
                },
            }),
        ],
    }),
];
