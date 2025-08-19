"use client";

const temp_exampleTracks = [
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
        <main>
            {/*
            TODO
            General:
            - Convert every component/part/section into its own component.
            */}

            {/* Component: Hero */}
            <div className="mb-20"></div>
            <div className="mb-40 flex flex-col items-center justify-center text-center">
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
            <form method="POST" action="/recommendations" className="mb-40">
                <label htmlFor="spotify_trackLink" className="mb-2 block text-xl">
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
                    className="px-4 py-2 text-white bg-red-800 hover:bg-red-600 cursor-pointer"
                    onClick={() =>
                        // Format
                        ((document.getElementById("spotify_trackLink") as HTMLInputElement).value = "")
                    }
                >
                    Clear
                </button>
            </form>

            {/* Component: Guide to get Spotify track link */}
            <div className="mb-40">
                <h3
                    // Format
                    className="text-2xl font-bold mb-2"
                    style={{ color: "var(--primary)" }}
                >
                    Here's how you can get a link
                </h3>
                <ol className="mb-2 list-inside list-decimal">
                    <li>Hover over your desired song on Spotify</li>
                    <li>Right click</li>
                    <li>Select "Share"</li>
                    <li>Select "Copy link to Song"</li>
                </ol>
                <p className="italic text-gray-400">(GIF guides coming soon)</p>
            </div>

            {/* NOTE This is temporary, and is to be deleted at final product */}
            {/* Component: Examples */}
            <div>
                <h3
                    // Format
                    className="text-2xl font-bold mb-2"
                    style={{ color: "var(--primary)" }}
                >
                    Examples
                </h3>
                <ul className="list-inside list-disc">
                    {temp_exampleTracks.map((track, index) => (
                        <li key={index} className="mb-4">
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
    );
}
