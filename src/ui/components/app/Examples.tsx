import type { exampleTrackType } from "./Example";

import Example from "./Example";

const exampleTracks: exampleTrackType[] = [
    {
        artistAndName: '"Playboi Carti" - Bando',
        notes: [
            // Format
            "test unknown artist",
            "test singular artist",
        ],
        spotifyLink: "https://open.spotify.com/track/6z7dQwXh9UJJl4wsWxexuI?si=308467749bd94d0d",
    },
    {
        artistAndName: "Selena Gomez, benny blanco, The Marías - Ojos Tristes",
        notes: ["test multiple artists"],
        spotifyLink: "https://open.spotify.com/track/1DFmBjoeQN9DpOVTEewyx0?si=210d4a8f264e4430",
    },
    {
        artistAndName: "Florence + The Machine - Dog Days Are Over",
        notes: ["test character: +"],
        spotifyLink: "https://open.spotify.com/track/456WNXWhDwYOSf5SpTuqxd?si=e9a5cc69ef9b4ffe",
    },
    {
        artistAndName: "Frank Ocean - Pink + White",
        notes: ["test character: +"],
        spotifyLink: "https://open.spotify.com/track/3xKsf9qdS1CyvXSMEid6g8?si=a806ea6aea05450c",
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
    {
        artistAndName: "A$AP Rocky, Moby - A$AP Forever (feat. Moby)",
        notes: ["test character: $"],
        spotifyLink: "https://open.spotify.com/track/1YmF9PvLhIISIANoMLIYGq?si=ec42eff2f25f4c9a",
    },
    {
        artistAndName: "The Marías - Déjate Llevar",
        notes: [
            // Format
            "test character: í",
            "test character: é",
        ],
        spotifyLink: "https://open.spotify.com/track/4eevohYu5jHXgnCitivUVT?si=435a57ee92ac4463",
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
                {exampleTracks.map((exampleTrack, index) => (
                    <Example key={index} exampleTrack={exampleTrack} />
                ))}
            </ul>
        </div>
    );
}
