"use client";
import { useState } from "react";
import "../globals.css";

const temp_submittedTrack = {
    name: "track name",
    artists: ["artist1, artist2"],
    releaseDate: "YYYY-MM-DD",
    popularity: 72,
    genres: ["genre1, genre2"],
    moods: ["happy", "sad", "chill", "etc."],
};

const temp_dummyRecommendedTracks = [
    {
        name: "Song A",
        artists: "Artist A",
        link: {
            spotify: "https://open.spotify.com",
            appleMusic: "https://music.apple.com",
            youtubeMusic: "https://music.youtube.com",
            video: "dQw4w9WgXcQ",
        },
        about: {
            genius: "https://genius.com",
            lastFm: "https://last.fm",
        },
        comments: {
            genius: "https://genius.com",
            lastFm: "https://last.fm",
        },
    },
    {
        name: "Song B",
        artists: "Artist B",
        link: {
            spotify: "https://open.spotify.com",
            appleMusic: "https://music.apple.com",
            youtubeMusic: "https://music.youtube.com",
            video: "dQw4w9WgXcQ",
        },
        about: {
            genius: "https://genius.com",
            lastFm: "https://last.fm",
        },
        comments: {
            genius: "https://genius.com",
            lastFm: "https://last.fm",
        },
    },
];

export default function RecommendationsClient() {
    // Sliders + checkboxes states
    const [similarity, setSimilarity] = useState(100);
    const [popularity, setPopularity] = useState(temp_submittedTrack.popularity);
    const [dateRange, setDateRange] = useState(2000);
    const [moods, setMoods] = useState<string[]>([]);

    const handleCheckboxChange = (mood: string) => {
        setMoods((prev) => (prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]));
    };

    return (
        <div className="container mx-auto">
            <main>
                {/*
                TODO
                - Convert every component/part/section into its own component.
                - Double-click to reset slider's value.
                - Upon form submission, put slider (and other param) values in URL via something like `?=`.
                    - Then, with those `?=` in the URL, page refreshing will set it at that value.
                - For "release data range", follow wireframe that has 2 selectors on 1 slider to specify release date range.
                    - Or can use calendar?
                    
                FIXME
                - Lightly re-style "recommended tracks" and make it consistent
                */}

                {/* Component: Hero */}
                <div className="my-24 flex flex-col items-center justify-center text-center">
                    <h1 className="text-8xl font-bold">
                        <a href="/" className="cursor-pointer">
                            NextTrack
                        </a>
                    </h1>
                    <h2 className="text-4xl">
                        Music recommendations in <strong>your</strong> control
                    </h2>
                </div>

                {/* Component: Submitted track details */}
                <div className="my-12">
                    <h3
                        // Format
                        className="text-2xl mb-2 font-bold"
                        style={{ color: "var(--primary)" }}
                    >
                        Submitted Track's Details
                    </h3>
                    <ul>
                        <li>
                            <b>Name:</b> {temp_submittedTrack.name}
                        </li>
                        <li>
                            <b>Artist(s):</b> {temp_submittedTrack.artists.join(", ")}
                        </li>
                        <li>
                            <b>Release Date:</b> {temp_submittedTrack.releaseDate}
                        </li>
                    </ul>
                </div>

                {/* Component: Customise recommendations + Recommended tracks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Component: Customise recommendations */}
                    <section>
                        {/* Title */}
                        <h3
                            // Format
                            className="text-2xl mb-2 font-bold"
                            style={{ color: "var(--primary)" }}
                        >
                            Customise Your Recommendations
                        </h3>
                        {/* Similarity slider */}
                        <div className="mb-6">
                            <h4 className="text-lg font-bold">Genres / Tags</h4>
                            <p>
                                <b>Current:</b> {temp_submittedTrack.genres.join(", ")}
                            </p>
                            <p>
                                <b>Recommendations' similarity:</b> {similarity}%
                            </p>
                            <input
                                // Format
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={similarity}
                                onChange={(e) => setSimilarity(Number(e.target.value))}
                                className="w-full mt-2"
                            />
                        </div>

                        {/* Popularity slider */}
                        <div className="mb-6">
                            <h4 className="text-lg font-bold">Popularity</h4>
                            <p>
                                <b>Current:</b> {temp_submittedTrack.popularity}%
                            </p>
                            <p>
                                <b>Recommendations' popularity:</b> {popularity}%
                            </p>
                            <input
                                // Format
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={popularity}
                                onChange={(e) => setPopularity(Number(e.target.value))}
                                className="w-full mt-2"
                            />
                        </div>

                        {/* Release date range slider */}
                        <div className="mb-6">
                            <h4 className="text-lg font-bold">Release Date Range</h4>
                            <p>
                                <b>Current:</b> {temp_submittedTrack.releaseDate}
                            </p>
                            <p>
                                <b>Recommendations' release date:</b> {dateRange}
                            </p>
                            <input
                                // Format
                                type="range"
                                min="1800" // https://greatbigstory.com/what-was-the-first-song-ever-recorded/
                                max="2025"
                                step="1"
                                value={dateRange}
                                onChange={(e) => setDateRange(Number(e.target.value))}
                                className="w-full mt-2"
                            />
                        </div>

                        {/* Mood checkboxes */}
                        <div className="mb-6">
                            <h4 className="text-lg font-bold">Moods</h4>
                            {temp_submittedTrack.moods.map((mood, index) => (
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

                    {/* Component: Recommended tracks */}
                    <section>
                        {/* Title */}
                        <h3
                            // Format
                            className="text-2xl mb-2 font-bold"
                            style={{ color: "var(--primary)" }}
                        >
                            Recommended Tracks
                        </h3>
                        {/* Recommended track */}
                        <div className="space-y-4">
                            {temp_dummyRecommendedTracks.map((track, index) => (
                                <details key={index} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                                    <summary className="flex justify-between items-center cursor-pointer">
                                        <div>
                                            <h4 className="text-lg font-semibold">{track.name}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">by {track.artists}</p>
                                        </div>
                                        <span className="text-gray-500">▼</span>
                                    </summary>

                                    <div className="mt-4 space-y-3">
                                        <p className="space-x-2">
                                            Listen at:
                                            <a href={track.link.spotify} target="_blank" className="btn-link text-green-500 underline">
                                                Spotify
                                            </a>
                                            <a href={track.link.appleMusic} target="_blank" className="btn-link text-red-500 underline">
                                                Apple Music
                                            </a>
                                            <a href={track.link.youtubeMusic} target="_blank" className="btn-link text-yellow-500 underline">
                                                YouTube Music
                                            </a>
                                        </p>

                                        <iframe width="100%" height="200" src={`https://www.youtube.com/embed/${track.link.video}`} title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="rounded-lg" />

                                        <p>
                                            About:{" "}
                                            <a href={track.about.genius} className="underline">
                                                Genius
                                            </a>{" "}
                                            |{" "}
                                            <a href={track.about.lastFm} className="underline">
                                                Last.fm
                                            </a>
                                        </p>

                                        <p>
                                            Comments:{" "}
                                            <a href={track.comments.genius} className="underline">
                                                Genius
                                            </a>{" "}
                                            |{" "}
                                            <a href={track.comments.lastFm} className="underline">
                                                Last.fm
                                            </a>
                                        </p>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
