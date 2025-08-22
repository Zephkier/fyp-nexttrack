import type { Metadata } from "next";

import Hero from "@/ui/components/Hero";
import SubmittedTrackDetails from "@/ui/components/SubmittedTrackDetails";
import CustomiseRecommendations from "@/ui/components/CustomiseRecommendations";
import RecommendedTracks from "@/ui/components/RecommendedTracks";

// Sub-pages do not need additional " | ${siteConfig.name}"
export const metadata: Metadata = {
    title: `Recommendations`,
};

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

export default function Recommendations() {
    return (
        <main className="container mx-auto">
            {/*
            TODO
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

            <Hero customMarginBottom="mb-20" />
            <SubmittedTrackDetails submittedTrack={temp_submittedTrack} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <CustomiseRecommendations submittedTrack={temp_submittedTrack} />
                <RecommendedTracks recommendedTracks={temp_dummyRecommendedTracks} />
            </div>
        </main>
    );
}
