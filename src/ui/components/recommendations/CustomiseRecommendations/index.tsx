"use client";
import { useState } from "react";

import type { submittedTrackType } from "@/ui/components/recommendations/SubmittedTrackDetails";

import GenresSection from "./GenresSection";
import PopularitySection from "./PopularitySection";
import ReleaseDateRangeSection, { currentDate } from "./ReleaseDateRangeSection";
import MoodsSection from "./MoodsSection";
import { moods } from "@/libs/mood";

/**
 * `type` is more flexible and has more use cases than `interface`.\
 * Better to set this in child, and have parent import it.
 */
export type submittedCustomisationsType = {
    genreSimilarity: number;
    popularity: number;
    releaseDateFrom: string | null;
    releaseDateTo: string | null;
    moods: string[];
};

export default function CustomiseRecommendations({
    // Format
    submittedTrack,
    onSubmit,
}: {
    submittedTrack: submittedTrackType;
    // Need `?` because Customise Recommendation's params are not submitted (i.e. undefined) on the first EVER page load
    onSubmit?: (submittedCustomisations: submittedCustomisationsType) => void;
}) {
    const [genreSimilarity, setGenreSimilarity] = useState(100);
    const [popularity, setPopularity] = useState(submittedTrack.popularity);
    const [releaseDateFrom, setReleaseDateFrom] = useState("");
    const [releaseDateTo, setReleaseDateTo] = useState(currentDate);
    const [selectedMoods, setSelectedMoods] = useState(submittedTrack.moods);

    /**
     * Returns an array of strings where the clicked mood is either added or removed from it.
     *
     * -----
     *
     * `clickedMood` refers to the mood that the user has clicked on. Thus, upon clicking a mood...
     *
     * - If it was already checked (i.e. **in** the array), then uncheck it (i.e. remove from array).
     * - If it was unchecked (i.e. **not in** the array), then check it (i.e. add to array).
     */
    function toggleMood(clickedMood: string) {
        setSelectedMoods((currentSelectedMoods) => {
            // If `clickedMood` is, well, already checked (i.e. in array), then uncheck it (i.e. remove from array)
            if (currentSelectedMoods.includes(clickedMood)) return currentSelectedMoods.filter((mood) => mood != clickedMood);
            // Opposite from ^: If `clickedMood` is unchecked (i.e. not in array), then check it (i.e. add to array)
            else return [...currentSelectedMoods, clickedMood];
        });
    }

    /**
     * Submit/Send params to this component's parent at `./src/app/recommendations/[spotifyTrackId]/page.client.tsx`.
     */
    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        // TEST Printed in browser's console
        console.log(
            [
                // Format
                "Child component sending params to parent component!",
                "",
                "./src/ui/components/recommendations/CustomiseRecommendations/index.tsx",
                "::CustomiseRecommendations()",
                "::handleSubmit():",
                "",
                `genreSimilarity: ${genreSimilarity}`,
                `popularity:      ${popularity}`,
                `releaseDateFrom: ${releaseDateFrom || null}`,
                `releaseDateTo:   ${releaseDateTo || null}`,
                `selectedMoods:   ${selectedMoods}`,
            ].join("\n")
        );
        onSubmit?.({
            genreSimilarity,
            popularity,
            releaseDateFrom: releaseDateFrom || null,
            releaseDateTo: releaseDateTo || null,
            moods: selectedMoods,
        });
    }

    return (
        <section>
            <h3
                // Format
                className="mb-2 text-2xl font-bold"
                style={{ color: "var(--primary)" }}
            >
                Customise Recommendations
            </h3>

            <form
                // Format
                className="mb-15"
                onSubmit={handleSubmit}
            >
                {/* There is a duplicate button at the bottom of this form */}
                <div className="flex justify-end">
                    <button
                        // Format
                        className="mb-4 px-4 py-2 text-white bg-[var(--secondary)] hover:bg-green-600 cursor-pointer"
                        type="submit"
                    >
                        Submit Customisations
                    </button>
                </div>

                <GenresSection
                    // Format
                    incomingGenres={submittedTrack.genres}
                    selectedGenresSimilarityValue={genreSimilarity}
                    onChange={setGenreSimilarity}
                />

                <PopularitySection
                    // Format
                    incomingPopularity={submittedTrack.popularity}
                    selectedPopularityValue={popularity}
                    onChange={setPopularity}
                />

                <ReleaseDateRangeSection
                    // Format
                    incomingReleaseDate={submittedTrack.releaseDate}
                    releaseDateFrom={releaseDateFrom}
                    releaseDateTo={releaseDateTo}
                    onChangeFrom={setReleaseDateFrom}
                    onChangeTo={setReleaseDateTo}
                />

                <MoodsSection
                    // Format
                    moods={moods}
                    incomingMoods={submittedTrack.moods}
                    selectedMoods={selectedMoods}
                    onChange={toggleMood}
                />

                {/* There is a duplicate button at the top of this form */}
                <div className="flex justify-end">
                    <button
                        // Format
                        className="px-4 py-2 text-white bg-[var(--secondary)] hover:bg-green-600 cursor-pointer"
                        type="submit"
                    >
                        Submit Customisations
                    </button>
                </div>
            </form>
        </section>
    );
}
