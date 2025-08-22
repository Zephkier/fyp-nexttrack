"use client";
import { useState } from "react";

export default function TrackForm() {
    const [inputValue, setInputValue] = useState("");
    const handleClear = () => {
        setInputValue("");
    };

    return (
        <form
            method="POST"
            action="/api/recommendations" // This is located at "./src/app/api/recommendations/route.ts"
            className="mb-40"
        >
            <label
                htmlFor="spotifyTrackLink" // Connected to <input>'s "id" attribute below
                className="mb-2 block text-xl"
            >
                Submit your <strong>Spotify</strong> track link:
            </label>
            <input
                id="spotifyTrackLink" // Connected to <label>'s "htmlFor" attribute above
                name="spotifyTrackLink" // Connected to "./src/app/api/recommendations/route.ts::POST()::link"
                type="text"
                placeholder="https://open.spotify.com/track/..."
                autoComplete="off"
                required
                value={inputValue}
                onChange={(event) => {
                    setInputValue(event.target.value);
                }}
                className="w-full px-3 py-2 mb-4 bg-white text-black placeholder-gray-400 focus:outline-none"
            />
            <button
                // Format
                type="submit"
                className="px-4 py-2 mr-4 text-white bg-green-800 hover:bg-green-600 cursor-pointer"
            >
                Submit
            </button>
            <button
                // Format
                type="button"
                onClick={handleClear}
                className="px-4 py-2 text-white bg-red-800 hover:bg-red-600 cursor-pointer"
            >
                Clear
            </button>
        </form>
    );
}
