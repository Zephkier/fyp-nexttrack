"use client";

const exampleTracks = [
    {
        artistAndName: '"Playboi Carti" - Bando',
        notes: ["test unknown artist"],
        spotifyLink: "https://open.spotify.com/track/6z7dQwXh9UJJl4wsWxexuI?si=308467749bd94d0d",
    },
    {
        artistAndName: "The Beatles - Something",
        notes: ["test singular artist"],
        spotifyLink: "https://open.spotify.com/track/0pNeVovbiZHkulpGeOx1Gj?si=b9def5c53fe943a7",
    },
    {
        artistAndName: "Selena Gomez, benny blanco, The Marías - Ojos Tristes",
        notes: ["test multiple artists", 'test "í" character'],
        spotifyLink: "https://open.spotify.com/track/1DFmBjoeQN9DpOVTEewyx0?si=210d4a8f264e4430",
    },
    {
        artistAndName: "Florence + The Machine - Dog Days Are Over",
        notes: ['test "+" character'],
        spotifyLink: "https://open.spotify.com/track/456WNXWhDwYOSf5SpTuqxd?si=e9a5cc69ef9b4ffe",
    },
    {
        artistAndName: "AC/DC - Thunderstruck",
        notes: ['test "/" character'],
        spotifyLink: "https://open.spotify.com/track/57bgtoPSgt236HzfBOd8kj?si=1f3b7d2fbc074a5e",
    },
    {
        artistAndName: "Dimitri Vegas & Like Mike - Thank You (Not So Bad)",
        notes: ['test "&" character'],
        spotifyLink: "https://open.spotify.com/track/09CnYHiZ5jGT1wr1TXJ9Zt?si=68c00376f8e7456a",
    },
];

export default function HomeClient() {
    // NOTE This is part of "Examples" section, is temporary, and is to be deleted at final product
    async function copyToClipboard(text: string, event: React.MouseEvent<HTMLButtonElement | null>) {
        const button = event.currentTarget;
        if (!button) return;
        await navigator.clipboard.writeText(text);
        button.innerText = "Copied!";
        setTimeout(() => {
            button.innerText = "Copy";
        }, 1000);
    }

    return (
        <div className="container mx-auto max-w-4xl">
            <main>
                {/* Component: Hero */}
                <div className="my-32 flex flex-col items-center justify-center text-center">
                    <h1 className="text-8xl font-bold">
                        <a href="/" className="cursor-pointer">
                            NextTrack
                        </a>
                    </h1>
                    <h2 className="text-4xl">
                        Music recommendations in <strong>your</strong> control
                    </h2>
                </div>

                {/* Component: Form to submit Spotify track link */}
                <form method="POST" action="/recommendations" className="my-32 space-y-4">
                    <div>
                        <label htmlFor="spotify_trackLink" className="block my-2">
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
                            className="w-full px-4 py-2 bg-white text-black placeholder-gray-400 focus:outline-none"
                        />
                        <button
                            // Format
                            type="submit"
                            className="px-4 py-2 mr-2 mt-4 text-white bg-green-800 hover:bg-green-600 cursor-pointer"
                        >
                            Submit
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 ml-2 mt-4 text-white bg-red-800 hover:bg-red-600 cursor-pointer"
                            onClick={() =>
                                // Format
                                ((document.getElementById("spotify_trackLink") as HTMLInputElement).value = "")
                            }
                        >
                            Clear
                        </button>
                    </div>
                </form>

                {/* Component: Guide to get Spotify track link */}
                <div className="my-32">
                    <h3 className="text-2xl mb-2">Here's how you can get a link</h3>
                    <ol className="list-inside list-decimal mb-2">
                        <li>Hover over your desired song on Spotify</li>
                        <li>Right click</li>
                        <li>Select "Share"</li>
                        <li>Select "Copy link to Song"</li>
                    </ol>
                    <p className="italic text-gray-400">(GIF guides coming soon)</p>
                </div>

                {/* NOTE This is temporary, and is to be deleted at final product */}
                {/* Component: Examples */}
                <div className="my-32">
                    <h3 className="text-2xl mb-2">Examples</h3>
                    <ul className="list-inside list-disc space-y-4">
                        {exampleTracks.map((track, index) => (
                            <li key={index}>
                                {track.artistAndName}
                                <div className="text-gray-400 ml-4">
                                    {track.notes.map((note, index) => (
                                        <p key={index}>{note}</p>
                                    ))}
                                    <p>
                                        <button
                                            // Format
                                            type="button"
                                            onClick={(e) => copyToClipboard(track.spotifyLink, e)}
                                            className="px-2 py-0.5 mr-2 text-white bg-teal-800 hover:bg-teal-600 cursor-pointer"
                                        >
                                            copy
                                        </button>
                                        <code className="text-blue-300 hover:underline">
                                            <a href={track.spotifyLink} target="_blank">
                                                {track.spotifyLink}
                                            </a>
                                        </code>
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
        </div>
    );
}
