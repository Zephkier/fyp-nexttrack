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
        name: "Bohemian Rhapsody",
        artists: ["Queen"],
        link: {
            spotify: "https://open.spotify.com/track/4u7EnebtmKWzUH433cf5Qv?si=d402b163ddcb40b9",
            appleMusic: "https://music.apple.com/us/song/bohemian-rhapsody/1440650711",
            youtubeMusic: "https://music.youtube.com/watch?v=bSnlKl_PoQU&si=rizExhbi-h_Zog7w",
            // Can try using the YouTube video that is already in Last.fm's "About" page)
            // From "https://www.youtube.com/watch?v=fJ9rUzIMcZQ"
            // To                                   "fJ9rUzIMcZQ"
            video: "fJ9rUzIMcZQ",
        },
        lyrics: "https://genius.com/Queen-bohemian-rhapsody-lyrics",
        about: {
            genius: "https://genius.com/Queen-bohemian-rhapsody-lyrics",
            lastFm: "https://www.last.fm/music/Queen/_/Bohemian+Rhapsody+-+Remastered+2011/+wiki",
        },
        comments: {
            genius: "https://genius.com/Queen-bohemian-rhapsody-lyrics#comments",
            lastFm: "https://www.last.fm/music/Queen/_/Bohemian+Rhapsody+-+Remastered+2011#shoutbox",
        },
    },
    {
        name: "Yellow",
        artists: ["Coldplay"],
        link: {
            spotify: "https://open.spotify.com/track/3AJwUDP919kvQ9QcozQPxg?si=d5ef72260b42406a",
            appleMusic: "https://music.apple.com/us/song/yellow/1122782283",
            youtubeMusic: "https://music.youtube.com/watch?v=9qnqYL0eNNI&si=wQ2XdteTSQePEOve",
            // Can try using the YouTube video that is already in Last.fm's "About" page)
            // From "https://www.youtube.com/watch?v=yKNxeF4KMsY"
            // To                                   "yKNxeF4KMsY"
            video: "yKNxeF4KMsY",
        },
        lyrics: "https://genius.com/Queen-bohemian-rhapsody-lyrics",
        about: {
            genius: "https://genius.com/Coldplay-yellow-lyrics",
            lastFm: "https://www.last.fm/music/Coldplay/_/Yellow/+wiki",
        },
        comments: {
            genius: "https://genius.com/Coldplay-yellow-lyrics#comments",
            lastFm: "https://www.last.fm/music/Coldplay/_/Yellow#shoutbox",
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
        <main>
            {/*
            TODO
            General:
            - Convert every component/part/section into its own component.
            
            L side ("customise your recommendations"):
            - Convert every component/part/section into its own component.
            - Double-click to reset slider's value.
            - Upon form submission, put slider (and other param) values in URL via something like `?=`.
                - Then, with those `?=` in the URL, page refreshing will set it at that value.
            - For "release data range", follow wireframe that has 2 selectors on 1 slider to specify release date range.
                - Or can use calendar?
            
            R side ("recommended track(s)"):
            - Downwards triangle to become upwards triangle when "<details>" or "<summary>" is expanded".
            - Make it 360p size? Scale according to video's width.
            */}

            {/* Component: Hero */}
            <div className="mb-20"></div>
            <div className="mb-20 flex flex-col items-center justify-center text-center">
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
            <div className="mb-20">
                <h3
                    // Format
                    className="text-2xl font-bold mb-2"
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
                        className="text-2xl font-bold mb-2"
                        style={{ color: "var(--primary)" }}
                    >
                        Customise Your Recommendations
                    </h3>

                    {/* Similarity slider */}
                    <div
                        // Format
                        className="mb-4 p-4"
                        style={{ background: "var(--secondary)" }}
                    >
                        <h4 className="text-xl font-bold">Genres / Tags</h4>
                        <p className="mb-4">
                            <b>Current:</b> {temp_submittedTrack.genres.join(", ")}
                            <br />
                            <b>Recommended track's similarity:</b> {similarity}%
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

                    {/* Popularity slider */}
                    <div
                        // Format
                        className="mb-4 p-4"
                        style={{ background: "var(--secondary)" }}
                    >
                        <h4 className="text-xl font-bold">Popularity</h4>
                        <p className="mb-4">
                            <b>Current:</b> {temp_submittedTrack.popularity}%
                            <br />
                            <b>Recommended track's popularity:</b> {popularity}%
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

                    {/* Release date range slider */}
                    <div
                        // Format
                        className="mb-4 p-4"
                        style={{ background: "var(--secondary)" }}
                    >
                        <h4 className="text-xl font-bold">Release Date Range</h4>
                        <p className="mb-4">
                            <b>Current:</b> {temp_submittedTrack.releaseDate}
                            <br />
                            <b>Recommended track's release date:</b> {dateRange}
                        </p>
                        <input
                            // Format
                            type="range"
                            min="1800" // https://greatbigstory.com/what-was-the-first-song-ever-recorded/
                            max="2025"
                            step="1"
                            value={dateRange}
                            onChange={(e) => setDateRange(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    {/* Mood checkboxes */}
                    <div
                        // Format
                        className="mb-4 p-4"
                        style={{ background: "var(--secondary)" }}
                    >
                        <h4 className="text-xl font-bold">Moods</h4>
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
                        className="text-2xl font-bold mb-2"
                        style={{ color: "var(--primary)" }}
                    >
                        Recommended Track(s)
                    </h3>

                    {/* Recommended track */}
                    <div className="space-y-4">
                        {temp_dummyRecommendedTracks.map((track, index) => (
                            <details
                                // Format
                                key={index}
                                className="p-4"
                                style={{ background: "var(--secondary)" }}
                            >
                                {/* Collapsed details */}
                                <summary className="flex justify-between items-center cursor-pointer">
                                    <div>
                                        <h4 className="text-xl font-bold">{track.name}</h4>
                                        <p>by {track.artists}</p>
                                    </div>
                                    <span style={{ color: "var(--primary)" }}>▼</span>
                                </summary>

                                {/* Separator */}
                                <hr className="my-4" />

                                {/* Expanded details */}
                                <div>
                                    {/* "Listen at" */}
                                    <span className="mb-4 inline-flex items-center space-x-4">
                                        <span>Listen at:</span>
                                        <button type="button" className="px-2 py-0.5 mr-2 bg-green-700 text-white hover:bg-green-500 cursor-pointer">
                                            <a href={track.link.spotify} target="_blank">
                                                Spotify
                                            </a>
                                        </button>
                                        <button type="button" className="px-2 py-0.5 mr-2 bg-pink-700 text-white hover:bg-pink-500 cursor-pointer">
                                            <a href={track.link.appleMusic} target="_blank">
                                                Apple Music
                                            </a>
                                        </button>
                                        <button type="button" className="px-2 py-0.5 mr-2 bg-red-700 text-white hover:bg-red-500 cursor-pointer">
                                            <a href={track.link.youtubeMusic} target="_blank">
                                                YouTube Music
                                            </a>
                                        </button>
                                    </span>
                                    {/* YouTube video */}
                                    <iframe
                                        // Format
                                        width="100%"
                                        height="360"
                                        src={`https://www.youtube.com/embed/${track.link.video}`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        className="mb-4"
                                    />
                                    {/* About section */}
                                    <div className="block">
                                        <div className="mb-4 inline-flex items-center space-x-4">
                                            <span>About the song:</span>
                                            <button type="button" className="px-2 py-0.5 mr-2 bg-yellow-300 text-black hover:bg-yellow-100 cursor-pointer">
                                                <a href={track.about.genius} target="_blank">
                                                    Genius
                                                </a>
                                            </button>
                                            <button type="button" className="px-2 py-0.5 mr-2 bg-red-700 text-white hover:bg-red-500 cursor-pointer">
                                                <a href={track.about.lastFm} target="_blank">
                                                    Last.fm
                                                </a>
                                            </button>
                                        </div>
                                    </div>
                                    {/* Comments section */}
                                    <div className="block">
                                        <div className="inline-flex items-center space-x-4">
                                            <span>Comments:</span>
                                            <button type="button" className="px-2 py-0.5 mr-2 bg-yellow-300 text-black hover:bg-yellow-100 cursor-pointer">
                                                <a href={track.comments.genius} target="_blank">
                                                    Genius
                                                </a>
                                            </button>
                                            <button type="button" className="px-2 py-0.5 mr-2 bg-red-700 text-white hover:bg-red-500 cursor-pointer">
                                                <a href={track.comments.lastFm} target="_blank">
                                                    Last.fm
                                                </a>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </details>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
