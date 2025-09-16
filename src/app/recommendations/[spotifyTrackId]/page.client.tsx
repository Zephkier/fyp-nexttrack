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
        // ----- Process URL params ----- //

        // Helpers
        function processValue(urlValue: string | null) {
            if (urlValue == "" || urlValue == "null" || urlValue == null) return null;
            const value = Number(urlValue);
            // Ensure the value `0` is also valid
            if (Number.isFinite(value)) return value;
            else return null;
        }
        function processReleaseDate(urlDate: string | null) {
            if (urlDate == "" || urlDate == "null" || urlDate == null) return null;
            return urlDate;
        }
        // Actual
        const popularity = processValue(searchParams.get("popularity"));
        const releaseDateFrom = processReleaseDate(searchParams.get("releaseDateFrom"));
        const releaseDateTo = processReleaseDate(searchParams.get("releaseDateTo"));
        // // TODO Implement later
        // const genreSimilarity = processValue(searchParams.get("genreSimilarity"));
        // const moods = parseCommaList(searchParams.get("moods"));
        // // TEST Printed in browser's console
        // console.log(
        //     [
        //         // Format
        //         "Filtering recommended tracks by retrieving params from URL!",
        //         "",
        //         "./src/app/recommendations/[spotifyTrackId]/page.client.tsx",
        //         "::TrackRecommendationsClient()",
        //         "::filteredRecommendedTracks",
        //         "::useMemo():",
        //         "",
        //         `popularity     : {${typeof popularity}} ${popularity}`,
        //         `releaseDateFrom: {${typeof releaseDateFrom}} ${releaseDateFrom}`,
        //         `releaseDateTo  : {${typeof releaseDateTo}} ${releaseDateTo}`,
        //     ].join("\n")
        // );

        // ----- Filter recommended tracks ----- //

        return recommendedTracks.filter((recommendedTrack) => {
            /**
             * Popularity: If recommended track's popularity <= URL param's popularity, then return it
             *
             * Rationale:
             *
             * When I submit a track and it has a popularity of e.g. 80%, this means that \
             * I would want to see recommended tracks with max popularities that are <= whatever value I adjust it to.
             */
            if (typeof recommendedTrack.popularity == "number") {
                // Must include `!= null` so that value of `0` works as intended
                if (popularity != null && recommendedTrack.popularity > popularity) return false;
            }
            // Release date: If recommended track's release date is within URL param's date range, then return it
            if (typeof recommendedTrack.releaseDate == "string") {
                if (releaseDateFrom && recommendedTrack.releaseDate < releaseDateFrom) return false;
                if (releaseDateTo && recommendedTrack.releaseDate > releaseDateTo) return false;
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
        // Set query string at one go, while also ensuring the order of params
        const params = new URLSearchParams();
        typeof submittedCustomisations.genreSimilarity == "number" // Format
            ? params.append("genreSimilarity", String(submittedCustomisations.genreSimilarity))
            : null;
        typeof submittedCustomisations.popularity == "number" // Format
            ? params.append("popularity", String(submittedCustomisations.popularity))
            : null;
        submittedCustomisations.releaseDateFrom // Format
            ? params.append("releaseDateFrom", submittedCustomisations.releaseDateFrom)
            : null;
        submittedCustomisations.releaseDateTo // Format
            ? params.append("releaseDateTo", submittedCustomisations.releaseDateTo)
            : null;
        submittedCustomisations.moods?.length // Format
            ? params.append("moods", submittedCustomisations.moods.join(","))
            : null;
        url.search = params.toString();
        // Refresh URL with new query string
        router.replace(url.toString());
    }

    /**
     * TODO
     *
     * L side ("Customise Recommendations"):
     *
     * - Double-click to reset slider's value.
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
