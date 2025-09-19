"use client";

import { useState } from "react";

import ButtonToSubmitSpotifyTrackLink from "@/ui/primitives/ButtonToSubmitSpotifyTrackLink";

export default function TrackForm() {
    const [inputValue, setInputValue] = useState("");
    const handleClear = () => {
        setInputValue("");
    };

    return (
        <form
            className="mb-20"
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
            <ButtonToSubmitSpotifyTrackLink
                // Format
                margin="mr-4"
                colour="green"
                type="submit"
                onClick={() => {}}
                buttonText="Submit"
            />
            <ButtonToSubmitSpotifyTrackLink
                // Format
                margin=""
                colour="red"
                type="button"
                onClick={handleClear}
                buttonText="Clear"
            />
        </form>
    );
}
