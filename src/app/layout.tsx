import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const poppins = Poppins({
    weight: ["400", "600"],
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "UAE SOS",
    description: "UAE SOS",
    manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
    themeColor: "#000000",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={ poppins.className }>
                <Analytics />
                { children }
            </body>
        </html>
    );
}
