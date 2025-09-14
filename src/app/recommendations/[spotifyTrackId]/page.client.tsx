"use client";
import { useState } from "react";

import type { submittedTrackType } from "@/ui/components/recommendations/SubmittedTrackDetails";
import type { customiseRecommendationsParamsType } from "@/ui/components/recommendations/CustomiseRecommendations";
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

    // Receive params from "Customise Recommendations" section
    function handleSubmit(customiseRecommendationsParams: customiseRecommendationsParamsType) {
        // TEST Printed in browser's console
        console.log("./src/app/recommendations/[spotifyTrackID]/pageClient.tsx::RecommendationsWithIdClient()::customiseRecommendationsParams:", customiseRecommendationsParams);
        // // Later can filter here and then:
        // setRecommendedTracks(filtered);
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
