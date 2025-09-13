"use client";
import { useState } from "react";

import type { submittedTrackType } from "@/ui/components/recommendations/SubmittedTrackDetails";
import { moods } from "@/libs/mood";

// FIXME
// TODO  split this page into components
// FIXME

export default function CustomiseRecommendations({ submittedTrack }: { submittedTrack: submittedTrackType }) {
    const [similarity, setSimilarity] = useState(100);
    const [popularity, setPopularity] = useState(submittedTrack.popularity);
    const [dateRange, setDateRange] = useState(2000);
    const [selectedMoods, setSelectedMoods] = useState<string[]>(submittedTrack.moods);

    function toggleMood(clickedMood: string) {
        setSelectedMoods((currentSelectedMoods) => {
            // If "clickedMood" is already checked (i.e. in array), then uncheck it (i.e. remove from array)
            if (currentSelectedMoods.includes(clickedMood)) return currentSelectedMoods.filter((mood) => mood != clickedMood);
            // Opposite of above ^
            else return [...currentSelectedMoods, clickedMood];
        });
    }

    function titleCase(s: string) {
        const firstLetter = s.charAt(0).toUpperCase();
        const restOfTheLetters = s.slice(1);
        return `${firstLetter}${restOfTheLetters}`;
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

            {/* Genres */}
            <div
                // Format
                className="mb-4 p-4"
                style={{ background: "var(--secondary)" }}
            >
                <h4 className="mb-1 text-xl font-bold">Genres</h4>
                <p className="mb-2">
                    <b>Current:</b> {submittedTrack.genres.join(", ")}
                    <br />
                    <b>Recommended track&apos;s similarity:</b> {similarity}%
                </p>
                <input
                    // Format
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={similarity}
                    onChange={(e) => setSimilarity(Number(e.target.value))}
                    className="w-full"
                />
            </div>

            {/* Popularity */}
            <div
                // Format
                className="mb-4 p-4"
                style={{ background: "var(--secondary)" }}
            >
                <h4 className="mb-1 text-xl font-bold">Popularity</h4>
                <p className="mb-2">
                    <b>Current:</b> {submittedTrack.popularity}%
                    <br />
                    <b>Recommended track&apos;s popularity:</b> {popularity}%
                </p>
                <input
                    // Format
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={popularity}
                    onChange={(e) => setPopularity(Number(e.target.value))}
                    className="w-full"
                />
            </div>

            {/* Release date range */}
            <div
                // Format
                className="mb-4 p-4"
                style={{ background: "var(--secondary)" }}
            >
                <h4 className="mb-1 text-xl font-bold">Release Date Range (Y-M-D)</h4>
                <p className="mb-2">
                    <b>Current:</b> {submittedTrack.releaseDate}
                    <br />
                    <b>Recommended track&apos;s release date:</b> {dateRange}
                </p>
                <input
                    // Format
                    type="range"
                    min="1800"
                    max="2025"
                    step="1"
                    value={dateRange}
                    onChange={(e) => setDateRange(Number(e.target.value))}
                    className="w-full"
                />
            </div>

            {/* Moods */}
            <div
                // Format
                className="mb-4 p-4"
                style={{ background: "var(--secondary)" }}
            >
                <h4 className="mb-1 text-xl font-bold">Mood(s)</h4>
                <p className="mb-2">
                    <b>Current:</b> {submittedTrack.moods.join(", ")}
                    <br />
                    <b>Recommended track&apos;s mood(s):</b>
                </p>
                {/* Checkbox and mood */}
                {moods.map((mood) => (
                    <label key={mood} className="flex w-fit space-x-2">
                        <input
                            type="checkbox"
                            checked={selectedMoods.includes(mood)}
                            // Not using "setSelectedMoods(mood)" as we are dealing with checkboxes (i.e. array of selected moods)
                            // If it was radio buttons (i.e. only 1 selection allowed), then can use "setSelectedMood(mood)"
                            onChange={() => toggleMood(mood)}
                        />
                        <span>{titleCase(mood)}</span>
                    </label>
                ))}
            </div>
        </section>
    );
}
