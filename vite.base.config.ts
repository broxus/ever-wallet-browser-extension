import { defineConfig, UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import inject from "@rollup/plugin-inject";
import fs from "fs";

const SRC_DIR = resolve(__dirname, "./src");
const manifest = JSON.parse(fs.readFileSync(resolve(SRC_DIR, "manifest", "base.json")).toString());

export const getBaseConfig = (mode: string): UserConfig => {
    const isBeta = process.env.BETA === "true";
    const isFirefox = process.env.FIREFOX === "true";

    return {
        plugins: [
            react({
                babel: {
                    plugins: [
                        "babel-plugin-transform-typescript-metadata",
                        ["@babel/plugin-proposal-decorators", { legacy: true }],
                        ["@babel/plugin-transform-class-properties", { loose: true }],
                        ["@babel/plugin-transform-private-methods", { loose: true }],
                    ],
                },
            }),
        ],

        resolve: {
            alias: {
                "@app": resolve(__dirname, "./src"),
            },
        },

        assetsInclude: ["**/*.riv"],

        define: {
            "process.env.NODE_ENV": JSON.stringify(mode),
            "process.env.EXT_ENV": JSON.stringify(isBeta || isFirefox ? "beta" : "prod"),
            "process.env.EXT_VERSION": JSON.stringify(manifest.version),
            "process.env.EXT_NAME": JSON.stringify("SparX Wallet"),
            "process.env.EXT_RDNS": JSON.stringify("com.sparxwallet"),
            global: "globalThis",
        },

        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `@use "${resolve(__dirname, "src/popup/styles/_index.scss")}" as *;`,
                },
            },
            modules: {
                localsConvention: "camelCase",
            },
        },

        build: {
            outDir: "dist",
            emptyOutDir: false,
            sourcemap: mode === "development",
            minify: mode === "production",
        },

        optimizeDeps: {
            esbuildOptions: {
                define: {
                    global: "globalThis",
                },
            },
            include: ["buffer", "process", "stream-browserify", "util", "pump", "obj-multiplex", "end-of-stream"],
        },

        server: {
            hmr: false, // Disable HMR for browser extension
        },
    };
};

export const getInjectPlugin = () =>
    inject({
        process: [resolve(__dirname, "node_modules/process/browser.js"), "default"],
        Buffer: [resolve(__dirname, "node_modules/buffer/index.js"), "Buffer"],
    });
