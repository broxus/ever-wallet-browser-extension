import { defineConfig, mergeConfig } from "vite";
import { resolve } from "path";
import { getBaseConfig, getInjectPlugin } from "./vite.base.config";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const baseConfig = getBaseConfig(mode);

    return mergeConfig(baseConfig, {
        define: {
            ...baseConfig.define,
            "process.env.EXT_ADDITIONAL_COMMITS": JSON.stringify("0"),
        },

        build: {
            ...baseConfig.build,
            rollupOptions: {
                input: {
                    inpage: resolve(__dirname, "src/inpage.ts"),
                },

                output: {
                    entryFileNames: (chunkInfo: any) => {
                        // All scripts go to js folder
                        if (["inpage"].includes(chunkInfo.name)) {
                            return "js/[name].js";
                        }

                        return "assets/[name].js";
                    },
                    format: "iife",
                    chunkFileNames: "assets/[name].js",
                    assetFileNames: "assets/[name][extname]",
                },
                plugins: [getInjectPlugin()],
            },
        },
    });
});
