"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import type { submittedTrackType } from "@/ui/components/recommendations/SubmittedTrackDetails";
import type { submittedCustomisationsType } from "@/ui/components/recommendations/CustomiseRecommendations";
import type { recommendedTrackType } from "@/ui/components/recommendations/RecommendedTrack";

import SubmittedTrackDetails from "@/ui/components/recommendations/SubmittedTrackDetails";
// This directory's `index.tsx` acts as the entry point, so no need to specify its `page.tsx` file
import CustomiseRecommendations from "@/ui/components/recommendations/CustomiseRecommendations";
import RecommendedTracks from "@/ui/components/recommendations/RecommendedTracks";

export default function TrackRecommendationsClient({
    // Format
    submittedTrack,
    initialRecommendedTracks,
}: {
    submittedTrack: submittedTrackType;
    initialRecommendedTracks: recommendedTrackType[];
}) {
    const router = useRouter();
    const [recommendedTracks, setRecommendedTracks] = useState(initialRecommendedTracks);

    /**
     * Receive params from this component's child at:
     *
     * - `./ui/components/recommendations/CustomiseRecommendations/index.tsx`
     * - aka. `<CustomiseRecommendations />`
     * - aka. the "Customise Recommendations" section
     */
    function handleSubmit(submittedCustomisations: submittedCustomisationsType) {
        // TEST Printed in browser's console
        console.log(
            [
                // Format
                "Parent component received params from child component!",
                "",
                "./src/app/recommendations/[spotifyTrackId]/page.client.tsx",
                "::TrackRecommendationsClient()",
                "::handleSubmit():",
                "",
                `submittedCustomisations:`,
                JSON.stringify(submittedCustomisations, null, 2),
            ].join("\n")
        );
        // Write `submittedCustomisations` params into the current URL for easy sharing
        const url = new URL(window.location.href);
        submittedCustomisations.genreSimilarity // Format
            ? url.searchParams.set("genreSimilarity", String(submittedCustomisations.genreSimilarity))
            : null;
        submittedCustomisations.popularity // Format
            ? url.searchParams.set("popularity", String(submittedCustomisations.popularity))
            : null;
        submittedCustomisations.releaseDateFrom // Format
            ? url.searchParams.set("from", submittedCustomisations.releaseDateFrom)
            : url.searchParams.set("from", "null");
        submittedCustomisations.releaseDateTo // Format
            ? url.searchParams.set("to", submittedCustomisations.releaseDateTo)
            : null;
        submittedCustomisations.moods // Format
            ? url.searchParams.set("moods", submittedCustomisations.moods.join(","))
            : null;

        // Refresh URL with new params
        router.replace(url.toString());
    }

    /**
     * TODO
     *
     * L side ("Customise Recommendations"):
     *
     * - Double-click to reset slider's value.
     * - Upon form submission, put slider's value in URL via something like `?=` maybe?
     *      - So URL will have additional "?=genre-similarity=50&?=popularity=72&..." something like that.
     *      - So page refreshing stores those values.
     *
     * R side ("Recommended Tracks"):
     *
     * - Make video's size responsive? 360p size? Ultimately, it must scale to video's width.
     * - Make buttons without links greyed out.
     */
    return (
        <main className="container mx-auto">
            <SubmittedTrackDetails submittedTrack={submittedTrack} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <CustomiseRecommendations submittedTrack={submittedTrack} onSubmit={handleSubmit} />
                <RecommendedTracks recommendedTracks={recommendedTracks} />
            </div>
        </main>
    );
}
