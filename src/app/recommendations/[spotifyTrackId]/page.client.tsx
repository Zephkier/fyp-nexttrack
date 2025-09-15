"use client";
import { useState } from "react";

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
    const [recommendedTracks, setRecommendedTracks] = useState(initialRecommendedTracks);

    // IDEA Does this mean that this component's parent (page.tsx) needs an `onSubmit` too? To know when to refresh recommendations.
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

        // If track does not have a given param, then ignore and treat as valid
        const filteredRecommendedTracks = initialRecommendedTracks.filter((initialRecommendedTrack) => {
            // // TODO Implement this LATER because it is harder (must be converted from words to normalised numbers)
            // const filteredGenreSimilarity = initialRecommendedTrack.genreSimilarity && initialRecommendedTrack.genreSimilarity >= submittedCustomisations.genreSimilarity;

            // TODO Implement this NOW because it is easier
            // Must ensure it exists (i.e. the `&&` part) because TS will complain that it is possibly `undefined`
            const validPopularity = initialRecommendedTrack.popularity && initialRecommendedTrack.popularity >= submittedCustomisations.popularity;

            // TODO Implement this NOW because it is easier
            // Must ensure it exists (i.e. the `&&` part) because TS will complain that it is possibly `undefined` or `null`
            const releaseDate = initialRecommendedTrack.releaseDate;
            const validReleaseDateFrom = !submittedCustomisations.releaseDateFrom || (releaseDate && releaseDate >= submittedCustomisations.releaseDateFrom);
            const validReleaseDateTo = !submittedCustomisations.releaseDateTo || (releaseDate && releaseDate <= submittedCustomisations.releaseDateTo);
            const validReleaseDate = validReleaseDateFrom && validReleaseDateTo;

            // // TODO Implement this LATER because it relies on `genreSimilarity`
            // const wantMoods = submittedCustomisations.moods ?? [];
            // const hasMoods = Array.isArray(initialRecommendedTrack.moods) ? initialRecommendedTrack.moods : null;
            // const validMoods = wantMoods.length == 0 || !hasMoods ? true : hasMoods.some((mood) => wantMoods.includes(mood));

            // Done
            // return filteredGenreSimilarity && validPopularity && validReleaseDate && validMoods;
            return validPopularity && validReleaseDate;
        });
        setRecommendedTracks(filteredRecommendedTracks);
    }

    /**
     * TODO
     *
     * L side ("Customise Recommendations"):
     *
     * - Double-click to reset slider's value.
     * - For "Release date Range", follow the wireframe (i.e. 2 selectors on 1 slider to indicate range).
     *      - Or use a calendar?
     *      - But calendar that dives into individual days is unnecessary...
     *
     * - Option 1) Upon form submission, put slider's value in URL via something like `?=` maybe?
     *      - So URL will have additional "?=genre-similarity=50&?=popularity=72&..." something like that.
     *      - So page refreshing stores those values.
     * - Option 2) As slider value changes, "Recommended Tracks" is updated in real-time.
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
