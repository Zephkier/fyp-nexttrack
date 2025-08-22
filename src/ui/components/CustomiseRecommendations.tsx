"use client";
import { useState } from "react";

// "type" is more flexible (allows for more use cases) than "interface"
type submittedTrackProp = {
    name: string;
    artists: string[];
    releaseDate: string;
    popularity: number;
    genres: string[];
    moods: string[];
};

export default function CustomiseRecommendations(
    // Format
    { submittedTrack }: { submittedTrack: submittedTrackProp }
) {
    const [similarity, setSimilarity] = useState(100);
    const [popularity, setPopularity] = useState(submittedTrack.popularity);
    const [dateRange, setDateRange] = useState(2000);
    const [moods, setMoods] = useState<string[]>([]);

    const handleCheckboxChange = (mood: string) => {
        setMoods((prev) => (prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]));
    };

    return (
        <section>
            <h3
                // Format
                className="text-2xl font-bold mb-2"
                style={{ color: "var(--primary)" }}
            >
                Customise Recommendations
            </h3>

            {/* Similarity */}
            <div
                // Format
                className="mb-4 p-4"
                style={{ background: "var(--secondary)" }}
            >
                <h4 className="text-xl font-bold">Genres / Tags</h4>
                <p className="mb-4">
                    <b>Current:</b> {submittedTrack.genres.join(", ")} <br />
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
                <h4 className="text-xl font-bold">Popularity</h4>
                <p className="mb-4">
                    <b>Current:</b> {submittedTrack.popularity}% <br />
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

            {/* Release date */}
            <div
                // Format
                className="mb-4 p-4"
                style={{ background: "var(--secondary)" }}
            >
                <h4 className="text-xl font-bold">Release Date Range</h4>
                <p className="mb-4">
                    <b>Current:</b> {submittedTrack.releaseDate} <br />
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
                <h4 className="text-xl font-bold">Moods</h4>
                {submittedTrack.moods.map((mood, index) => (
                    <label key={index} className="flex items-center space-x-2">
                        <input
                            // Format
                            type="checkbox"
                            checked={moods.includes(mood.toLowerCase())}
                            onChange={() => handleCheckboxChange(mood.toLowerCase())}
                        />
                        <span>{mood}</span>
                    </label>
                ))}
            </div>
        </section>
    );
}
