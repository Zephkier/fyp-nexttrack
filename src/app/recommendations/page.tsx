import type { Metadata } from "next";

// Sub-pages do not need additional " | ${siteConfig.name}"
export const metadata: Metadata = {
    title: `Recommendations`,
};

export default function RecommendationsPage() {
    return (
        /**
         * This page is loaded when users manually enter "/recommendations" in URL.
         *
         * The actual recommendations page (with content and stuff) is located at: \
         * "./src/app/recommendations/[spotifyTrackId]/page.tsx".
         */
        <main className="container mx-auto">
            {/* Height is meticulously calculated to ensure `<footer>` is out of vh so that the scrollbar appears */}
            <p className="h-[calc(100vh-26rem)] flex items-center justify-center text-gray-400 italic">
                {/* Format */}
                Submit a Spotify track link on the home page to see recommendations.
            </p>
        </main>
    );
}
