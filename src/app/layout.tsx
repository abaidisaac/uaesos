import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const inter = Poppins({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
    title: "SOS",
    description: "UAE rain SOS",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <Analytics />
            <body className={ inter.className }>{ children }</body>
        </html>
    );
}
