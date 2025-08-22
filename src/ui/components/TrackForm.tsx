"use client";

export default function TrackForm() {
    return (
        <form method="POST" action="/recommendations" className="mb-40">
            <label
                // Format
                htmlFor="spotify_trackLink"
                className="mb-2 block text-xl"
            >
                Submit your <strong>Spotify</strong> track link:
            </label>
            <input
                // Format
                id="spotify_trackLink"
                name="spotify_trackLink"
                type="text"
                placeholder="https://open.spotify.com/track/..."
                autoComplete="off"
                required
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
                type="button"
                // NOTE This is a client-side component
                onClick={() => {
                    const input = document.getElementById("spotify_trackLink") as HTMLInputElement;
                    if (input) input.value = "";
                }}
                className="px-4 py-2 text-white bg-red-800 hover:bg-red-600 cursor-pointer"
            >
                Clear
            </button>
        </form>
    );
}
