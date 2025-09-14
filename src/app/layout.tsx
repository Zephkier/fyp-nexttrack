import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import Header from "@/ui/components/common/Header";
import Footer from "@/ui/components/common/Footer";

// Better to set `title` key in this manner for scalability
export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },
};

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {/*
                Due to website's small size, the Header is basically the Hero.
                But both "Header.tsx" and "Hero.tsx" are still created for scalability.
                */}
                <Header />

                {/* Actual content that is enclosed within `<main>` */}
                {children}

                {/* Currently a placeholder mainly for whitespace */}
                <Footer />
            </body>
        </html>
    );
}
