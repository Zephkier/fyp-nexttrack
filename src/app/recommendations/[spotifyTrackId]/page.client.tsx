"use client";
import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
    const searchParams = useSearchParams();

    const [recommendedTracks, setRecommendedTracks] = useState(initialRecommendedTracks);

    /**
     * Filter recommended tracks via params in URL. URL Example:
     *
     * `(domain name)/recommendations/(spotify track id)?genreSimilarity=67&popularity=42&from=null&to=2025-09-15&moods=party,happy`
     *
     * Notes:
     * - Only filter if the corresponding field exists on the track.
     * - If tracks are not yet enriched with `popularity` / `releaseDate`, \
     *   those checks will be skipped (no errors).
     */
    const filteredRecommendedTracks = useMemo(() => {
        // // TODO Implement later
        // const genreSimilarity = parseMaybeNumber(searchParams.get("genreSimilarity"));
        const popularity = Number(searchParams.get("popularity"));
        const releaseDateFrom = searchParams.get("releaseDateFrom") ?? null;
        const releaseDateTo = searchParams.get("releaseDateTo") ?? null;
        // // TODO Implement later
        // const moods = parseCommaList(searchParams.get("moods"));
        // TEST Printed in browser's console
        console.log(
            [
                // Format
                "Retrieving params from URL!",
                "",
                "./src/app/recommendations/[spotifyTrackId]/page.client.tsx",
                "::TrackRecommendationsClient()",
                "::filteredRecommendedTracks",
                "::useMemo():",
                "",
                `popularity: ${popularity}`,
                `releaseDateFrom: ${releaseDateFrom}`,
                `releaseDateTo  : ${releaseDateTo}`,
            ].join("\n")
        );
        return recommendedTracks.filter((recommendedTrack) => {
            /**
             * Popularity: If recommended track's popularity <= URL param's popularity, then return it
             *
             * Rationale:
             *
             * When I submit a track and see that its peak popularity is 80%, this means that \
             * I would want to see recommended tracks with peak popularity that is <= whatever value I adjust it to.
             */
            if (recommendedTrack.popularity) {
                if (popularity && recommendedTrack.popularity > popularity) return false;
            }
            // FIXME This param is broken. Must manually set dates to work. "All time" button doesn't work.
            // Release date: If recommended track's release date is within URL param's date range, then return it
            if (recommendedTrack.releaseDate) {
                const date = String(recommendedTrack.releaseDate);
                if (releaseDateFrom && date < releaseDateFrom) return false;
                if (releaseDateTo && date > releaseDateTo) return false;
            }
            return true;
        });
    }, [recommendedTracks, searchParams]);

    /**
     * Receive params from child component and insert into the URL. Example:
     *
     * `(domain name)/recommendations/(spotify track id)?genreSimilarity=67&popularity=42&from=null&to=2025-09-15&moods=party,happy`
     *
     * Child component is located at:
     *
     * - `./ui/components/recommendations/CustomiseRecommendations/index.tsx`
     * - aka. `<CustomiseRecommendations />`
     * - aka. the "Customise Recommendations" section
     */
    function handleSubmit(submittedCustomisations: submittedCustomisationsType) {
        // // TEST Printed in browser's console
        // console.log(
        //     [
        //         // Format
        //         "Parent component received params from child component!",
        //         "",
        //         "./src/app/recommendations/[spotifyTrackId]/page.client.tsx",
        //         "::TrackRecommendationsClient()",
        //         "::handleSubmit():",
        //         "",
        //         `submittedCustomisations:`,
        //         JSON.stringify(submittedCustomisations, null, 2),
        //     ].join("\n")
        // );
        // Write `submittedCustomisations` params into URL for easy sharing
        const url = new URL(window.location.href);
        // Ensure to remove any existing params from URL
        submittedCustomisations.genreSimilarity // Format
            ? url.searchParams.set("genreSimilarity", String(submittedCustomisations.genreSimilarity))
            : url.searchParams.delete("genreSimilarity");
        submittedCustomisations.popularity // Format
            ? url.searchParams.set("popularity", String(submittedCustomisations.popularity))
            : url.searchParams.delete("popularity");
        submittedCustomisations.releaseDateFrom // Format
            ? url.searchParams.set("releaseDateFrom", submittedCustomisations.releaseDateFrom)
            : url.searchParams.set("releaseDateFrom", "null");
        submittedCustomisations.releaseDateTo // Format
            ? url.searchParams.set("releaseDateTo", submittedCustomisations.releaseDateTo)
            : url.searchParams.set("releaseDateTo", "null");
        submittedCustomisations.moods // Format
            ? url.searchParams.set("moods", submittedCustomisations.moods.join(","))
            : url.searchParams.delete("moods");
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
                <RecommendedTracks recommendedTracks={filteredRecommendedTracks} />
            </div>
        </main>
    );
}
