import nextConfig from "eslint-config-next";

const config = [
    {
        ignores: [".next/**", "node_modules/**", "**/*.tsbuildinfo"],
    },
    ...nextConfig,
];

export default config;
