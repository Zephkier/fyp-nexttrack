"use client";

async function copyToClipboard(
    // Format
    text: string,
    event: React.MouseEvent<HTMLButtonElement>
) {
    const button = event.currentTarget;
    await navigator.clipboard.writeText(text);
    button.innerText = "Copied!";
    setTimeout(() => (button.innerText = "Copy"), 1000);
}

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
        notes: [
            //
            "test multiple artists",
            "test character: í",
        ],
        spotifyLink: "https://open.spotify.com/track/1DFmBjoeQN9DpOVTEewyx0?si=210d4a8f264e4430",
    },
    {
        artistAndName: "Florence + The Machine - Dog Days Are Over",
        notes: ["test character: +"],
        spotifyLink: "https://open.spotify.com/track/456WNXWhDwYOSf5SpTuqxd?si=e9a5cc69ef9b4ffe",
    },
    {
        artistAndName: "AC/DC - Thunderstruck",
        notes: ["test character: /"],
        spotifyLink: "https://open.spotify.com/track/57bgtoPSgt236HzfBOd8kj?si=1f3b7d2fbc074a5e",
    },
    {
        artistAndName: "Dimitri Vegas & Like Mike - Thank You (Not So Bad)",
        notes: ["test character: &"],
        spotifyLink: "https://open.spotify.com/track/09CnYHiZ5jGT1wr1TXJ9Zt?si=68c00376f8e7456a",
    },
];

export default function Examples() {
    return (
        <div>
            <h3
                // Format
                className="text-2xl font-bold mb-2"
                style={{ color: "var(--primary)" }}
            >
                Examples
            </h3>
            <ul className="list-inside list-disc">
                {exampleTracks.map((exampleTrack, indexI) => (
                    <li key={indexI} className="mb-4">
                        {exampleTrack.artistAndName}
                        <div className="text-gray-400 ml-4">
                            {exampleTrack.notes.map((note, indexJ) => (
                                <p key={indexJ}>{note}</p>
                            ))}
                            <p>
                                <button
                                    // Format
                                    type="button"
                                    className="px-2 py-0.5 mr-2 text-white bg-teal-800 hover:bg-teal-600 cursor-pointer"
                                    onClick={(event) => copyToClipboard(exampleTrack.spotifyLink, event)}
                                >
                                    copy
                                </button>
                                <code className="text-blue-300 hover:underline">
                                    <a href={exampleTrack.spotifyLink} target="_blank">
                                        {exampleTrack.spotifyLink}
                                    </a>
                                </code>
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
