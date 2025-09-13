"use client";
import { useState } from "react";

export default function TrackForm() {
    const [inputValue, setInputValue] = useState("");
    const handleClear = () => {
        setInputValue("");
    };

    return (
        <form
            className="mb-15"
            method="POST"
            // Located at "./src/app/api/recommendations/route.ts"
            action="/api/recommendations"
        >
            <label
                className="mb-2 block text-xl"
                // Connected to `<input id=...>` attribute below
                htmlFor="spotifyTrackLink"
            >
                Submit your <strong>Spotify</strong> track link:
            </label>
            <input
                className="w-full px-3 py-2 mb-4 bg-white text-black placeholder-gray-400 focus:outline-none"
                // Connected to `<label htmlFor...>` attribute above
                id="spotifyTrackLink"
                // Connected to "./src/app/api/recommendations/route.ts::POST()::link"
                name="spotifyTrackLink"
                type="text"
                placeholder="https://open.spotify.com/track/..."
                autoComplete="off"
                required
                value={inputValue}
                onChange={(event) => {
                    setInputValue(event.target.value);
                }}
            />
            <button
                // Format
                className="px-4 py-2 mr-4 text-white bg-green-800 hover:bg-green-600 cursor-pointer"
                type="submit"
            >
                Submit
            </button>
            <button
                // Format
                className="px-4 py-2 text-white bg-red-800 hover:bg-red-600 cursor-pointer"
                type="button"
                onClick={handleClear}
            >
                Clear
            </button>
        </form>
    );
}
