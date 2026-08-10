/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        // TODO: consider adding a Content-Security-Policy once leaflet's inline
        // styles and the tile CDNs (server.arcgisonline.com, *.basemaps.cartocdn.com)
        // have been audited and allowlisted.
        return [
            {
                source: "/:path*",
                headers: [
                    { key: "X-Frame-Options", value: "DENY" },
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    {
                        key: "Permissions-Policy",
                        value: "geolocation=(self), camera=(), microphone=()",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
