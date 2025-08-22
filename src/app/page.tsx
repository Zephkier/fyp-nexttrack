import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

import Hero from "@/ui/components/Hero";
import TrackForm from "@/ui/components/TrackForm";
import Guide from "@/ui/components/Guide";
import Examples from "@/ui/components/Examples";

// Only root page needs additional " | ${siteConfig.name}" due to being in the same directory level as the root layout
export const metadata: Metadata = {
    title: `Home | ${siteConfig.name}`,
};

// NOTE This is temporary and is to be removed/deleted when deployed
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
        notes: [
            // Format
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

export default function Home() {
    return (
        <main className="container mx-auto max-w-4xl">
            <Hero customMarginBottom="mb-40" />
            <TrackForm />
            <Guide />
            {/* NOTE This is temporary and is to be removed/deleted when deployed */}
            <Examples exampleTracks={temp_exampleTracks} />
        </main>
    );
}
