import type { Metadata } from "next";

import Hero from "@/ui/components/Hero";

// Sub-pages do not need additional " | ${siteConfig.name}")
export const metadata: Metadata = {
    title: `Recommendations`,
};

export default function Recommendations() {
    return (
        /**
         * This page is loaded when users manually enter "/recommendations" in URL.
         * Else, the actual page is located at "./src/app/recommendations/[spotifyTrackId]/page.tsx".
         */
        <main className="container mx-auto">
            <Hero customMarginBottom="mb-20" />
            <p className="h-[calc(100vh-24rem)] flex items-center justify-center text-gray-400 italic">
                {/* Height is meticulously calculated to ensure <footer> is out of vh (i.e. requires scrolling to be seen) */}
                Submit a Spotify track link on the home page to see recommendations.
            </p>
        </main>
    );
}
