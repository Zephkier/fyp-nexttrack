import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Header from "@/ui/components/Header";
import Footer from "@/ui/components/Footer";

// // NOTE This is a client-side component
// // Could easily set "title" this way, but it is not scalable (i.e. when there are more pages)
// export const metadata: Metadata = {
//     title: "Home | NextTrack",
// };

// NOTE This is a server-side component
// Better to set "title" this way for scalability
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
                {/* Header (has nothing and is mainly for whitespace) */}
                <Header />

                {/* Actual content (is enclosed with "<main>") */}
                {children}

                {/* Footer (has nothing and is mainly for whitespace) */}
                <Footer />
            </body>
        </html>
    );
}
