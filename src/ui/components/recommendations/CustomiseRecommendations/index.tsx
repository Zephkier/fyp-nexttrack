"use client";
import { useState } from "react";

import type { submittedTrackType } from "@/ui/components/recommendations/SubmittedTrackDetails";
import GenresSection from "./GenresSection";
import PopularitySection from "./PopularitySection";
import ReleaseDateRangeSection from "./ReleaseDateRangeSection";
import MoodsSection from "./MoodsSection";

import { moods } from "@/libs/mood";

export default function CustomiseRecommendations({ submittedTrack }: { submittedTrack: submittedTrackType }) {
    const [similarity, setSimilarity] = useState(100);
    const [popularity, setPopularity] = useState(submittedTrack.popularity);
    const [releaseDateRange, setReleaseDateRange] = useState(2000);
    const [selectedMoods, setSelectedMoods] = useState<string[]>(submittedTrack.moods);

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

    return (
        <section>
            <h3
                // Format
                className="mb-2 text-2xl font-bold"
                style={{ color: "var(--primary)" }}
            >
                Customise Recommendations
            </h3>

            <GenresSection
                // Format
                incomingGenres={submittedTrack.genres}
                selectedGenresSimilarityValue={similarity}
                onChange={setSimilarity}
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
                selectedReleaseDateRange={releaseDateRange}
                onChange={setReleaseDateRange}
            />

            <MoodsSection
                // Format
                moods={moods}
                incomingMoods={submittedTrack.moods}
                selectedMoods={selectedMoods}
                onChange={toggleMood}
            />
        </section>
    );
}
