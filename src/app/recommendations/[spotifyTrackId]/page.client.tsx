"use client";

import type { submittedTrackType } from "@/ui/components/recommendations/SubmittedTrackDetails";
import type { submittedCustomisationsType } from "@/ui/components/recommendations/CustomiseRecommendations";
import type { recommendedTrackType } from "@/ui/components/recommendations/RecommendedTrack";

import { useState, useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import SubmittedTrackDetails from "@/ui/components/recommendations/SubmittedTrackDetails";
// This directory's `index.tsx` acts as the entry point, so no need to specify its `page.tsx` file
import CustomiseRecommendations from "@/ui/components/recommendations/CustomiseRecommendations";
import RecommendedTracks from "@/ui/components/recommendations/RecommendedTracks";
import LoadingAnimation from "@/ui/components/common/LoadingAnimation";

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
    const [recommendedTracks] = useState(initialRecommendedTracks);
    const [isPending, startTransition] = useTransition();

    // ----- Process URL params ----- //

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

    function parseCommaList(urlMood: string | null): string[] {
        if (urlMood == "" || urlMood == "null" || urlMood == null) return [];
        return urlMood
            .split(",")
            .map((mood) => mood.trim())
            .filter(Boolean);
    }

    // // TODO Implement `genreSimilarity`
    // const genreSimilarity = searchParams.get("genreSimilarity");
    const popularity = processValue(searchParams.get("popularity"));
    const releaseDateFrom = processReleaseDate(searchParams.get("releaseDateFrom"));
    const releaseDateTo = processReleaseDate(searchParams.get("releaseDateTo"));
    const moods = parseCommaList(searchParams.get("moods"));

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
    //         `genreSimilarity: Not implemented yet!`,
    //         `popularity     : {${typeof popularity}} ${popularity}`,
    //         `releaseDateFrom: {${typeof releaseDateFrom}} ${releaseDateFrom}`,
    //         `releaseDateTo  : {${typeof releaseDateTo}} ${releaseDateTo}`,
    //         `moods          : {${typeof moods}} ${moods}`,
    //     ].join("\n")
    // );

    // ----- Filter implementation ----- //

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
        return recommendedTracks.filter((recommendedTrack) => {
            /**
             * NOTE
             *
             * Must work in negative language (i.e. `if (!condition) return false`) \
             * to filter out (i.e. remove) recommended tracks that do not match any of the params.
             *
             * This also helps to safely ignore `genreSimilarity` that has not been implemented yet \
             * because there is a fail-safe `return true` line at the end of all the checks.
             *
             * Thus, within each param's checks, only `return false`, \
             * then, after all the params are checked, end off with a `return true` \
             * to let the remaining (i.e. matching) recommended tracks be returned (and displayed).
             */

            // // TODO Implement `genreSimilarity` (and consider its "no genres found" case) here
            // // Could have `if (...includes("no genres found")) return true` but we are working in negatives!
            // ...
            // if (!recommendedTrack.genres.includes("no genres found")) {
            //     ...
            // }
            // ...

            /**
             * Popularity: If recommended track's popularity <= URL param's popularity, then return it
             *
             * -----
             *
             * Rationale:
             *
             * - This param indicates the track's current popularity, but we shall treat it as \
             *   the track's **max** popularity achieved.
             * - If I submit a popular/mainstream track, then it has a high popularity of e.g. 80%.
             * - Whenever I adjust this param to e.g. 60%, I would be interested in seeing \
             *   recommended tracks that are 60% popular - duh.
             * - But! It is unrealistic to get recommended tracks that are exactly 60% popular (i.e. `== 60`).
             * - Thus, it is more realistic to get recommended tracks that \
             *   have a **max** popularity of 60% (i.e. 0% to 60% popular).
             *
             * -----
             *
             * Thoughts:
             *
             * - Honestly, it can be the other way round too - **min** popularity, return 60% to 100% - but it \
             *   makes less sense imo.
             * - Could also implement a min and max popularity value to be more explicit.
             */
            if (typeof recommendedTrack.popularity == "number") {
                // Must include `!= null` so that (slider) value of `0` still works
                if (popularity != null && recommendedTrack.popularity > popularity) return false;
            }
            // Release date: If recommended track's release date is within URL param's date range, then return it
            if (typeof recommendedTrack.releaseDate == "string") {
                if (releaseDateFrom && recommendedTrack.releaseDate < releaseDateFrom) return false;
                if (releaseDateTo && recommendedTrack.releaseDate > releaseDateTo) return false;
            }
            // Moods: If recommended track has any of the URL param's moods (or "no moods found"), then return it
            if (Array.isArray(recommendedTrack.moods)) {
                // Could have `if (...includes("no moods found")) return true` but we are working in negatives!
                if (!recommendedTrack.moods.includes("no moods found")) {
                    const haveAtLeastOneMatch = recommendedTrack.moods.some((mood) => moods.includes(mood));
                    if (moods.length > 0 && !haveAtLeastOneMatch) return false;
                }
            }
            // Done: After removing all `false` cases, all that is left is to return all `true` cases
            return true;
        });
        // TODO Implement `genreSimilarity`
    }, [recommendedTracks, popularity, releaseDateFrom, releaseDateTo, moods]);

    /**
     * Receive params from child component and insert into the URL. Example:
     *
     * `.../(spotify track id)?genreSimilarity=100&popularity=100&releaseDateFrom=2010-09-17&releaseDateTo=2025-09-17&moods=sad%2Cchill
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
        if (typeof submittedCustomisations.genreSimilarity == "number") {
            params.append("genreSimilarity", String(submittedCustomisations.genreSimilarity));
        }
        if (typeof submittedCustomisations.popularity == "number") {
            params.append("popularity", String(submittedCustomisations.popularity));
        }
        if (submittedCustomisations.releaseDateFrom) {
            params.append("releaseDateFrom", submittedCustomisations.releaseDateFrom);
        }
        if (submittedCustomisations.releaseDateTo) {
            params.append("releaseDateTo", submittedCustomisations.releaseDateTo);
        }
        if (submittedCustomisations.moods.length) {
            params.append("moods", submittedCustomisations.moods.join(","));
        }
        url.search = params.toString();
        // // Refresh URL with new query string
        // router.replace(url.toString());
        // Refresh URL with new query string with smooth transition
        startTransition(() => {
            router.replace(url.toString(), { scroll: false });
        });
    }

    /**
     * TODO
     *
     * General:
     *
     * - Handle `null` cases such that it displays greyed italic text \
     *   like for `video` in `./src/ui/components/recommendations/RecommendedTrack.tsx`.
     *   - This also means handling things like `"Unknown track/artist name"` etc.
     *
     * L side ("Customise Recommendations"):
     *
     * - Double-click to reset slider's value.
     *
     * R side ("Recommended Tracks"):
     *
     * - Make video's size responsive? 360p size? Ultimately, it must scale to video's width.
     * - Make buttons without links in different colour (i.e. greyed out or something).
     * - Display actual text (e.g. "About" section, lyrics) instead of linking a button to their page.
     */
    return (
        <main className="container mx-auto">
            <SubmittedTrackDetails submittedTrack={submittedTrack} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <CustomiseRecommendations submittedTrack={submittedTrack} onSubmit={handleSubmit} />
                <RecommendedTracks recommendedTracks={filteredRecommendedTracks} />
            </div>
            {isPending && <LoadingAnimation customText="Setting customisations..." />}
        </main>
    );
}
