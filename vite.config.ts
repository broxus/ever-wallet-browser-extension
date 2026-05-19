import { defineConfig, mergeConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { manifestPlugin } from './vite-manifest-plugin';
import svgr from 'vite-plugin-svgr';
import { execSync } from 'child_process';
import { getBaseConfig, getInjectPlugin } from './vite.base.config';

let tag;
try {
    tag = execSync('git describe --tags --abbrev=0 2>/dev/null').toString().trim();
} catch (_) {
    tag = 'v0.0.0';
}

let additionalCommits;
try {
    additionalCommits = execSync(`git rev-list ${tag}..HEAD --count 2>/dev/null || echo "0"`).toString().trim();
} catch (_) {
    additionalCommits = '0';
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const isBeta = process.env.BETA === 'true';

    const baseConfig = getBaseConfig(mode);

    return mergeConfig(baseConfig, {
        plugins: [
            svgr({
                svgrOptions: {
                    prettier: false,
                    svgo: false,
                    titleProp: true,
                    ref: true,
                },
            }),
            // Manifest plugin
            manifestPlugin({
                manifestPath: resolve(__dirname, 'src/manifest/base.json'),
                betaManifestPath: resolve(__dirname, 'src/manifest/beta.json'),
                firefoxManifestPath: resolve(__dirname, 'src/manifest/firefox.json'),
            }),

            // Copy static assets
            viteStaticCopy({
                targets: [
                    {
                        src: isBeta ? 'src/icons/beta/*' : 'src/icons/prod/*',
                        dest: '.',
                    },
                ],
            }),
        ],

        define: {
            ...baseConfig.define,
            'process.env.EXT_ADDITIONAL_COMMITS': JSON.stringify(additionalCommits),
        },

        build: {
            ...baseConfig.build,
            rollupOptions: {
                input: {
                    popup: resolve(__dirname, 'src/popup/popup.html'),
                    home: resolve(__dirname, 'src/popup/home.html'),
                    notification: resolve(__dirname, 'src/popup/notification.html'),
                    'phishing-warning': resolve(__dirname, 'src/popup/phishing-warning.html'),
                },
                output: {
                    entryFileNames: 'assets/[name].js',
                    chunkFileNames: 'assets/[name].js',
                    assetFileNames: 'assets/[name][extname]',
                    format: 'esm',
                },
                plugins: [
                    getInjectPlugin(),
                    {
                        name: 'move-html-to-root',
                        generateBundle(options: any, bundle: any) {
                            for (const fileName in bundle) {
                                const file = bundle[fileName];
                                if (fileName.endsWith('.html')) {
                                    // Remove 'src/popup/' from the path
                                    const newFileName = fileName.replace(/^src\/popup\//, '');
                                    if (newFileName !== fileName) {
                                        file.fileName = newFileName;
                                        bundle[newFileName] = file;
                                        delete bundle[fileName];
                                    }
                                }
                            }
                        },
                    },
                ],
            },
        },
    });
});
