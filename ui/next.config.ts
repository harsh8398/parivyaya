import type { NextConfig } from "next";

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    output: isDemoMode ? "export" : "standalone",
    // For GitHub Pages deployment, set basePath if deploying to a subdirectory
    // basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
    images: {
        unoptimized: isDemoMode, // Required for static export
    },
};

export default nextConfig;
