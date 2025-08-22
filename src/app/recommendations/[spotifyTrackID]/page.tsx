import type { Metadata } from "next";

import Hero from "@/ui/components/Hero";
import SubmittedTrackDetails from "@/ui/components/SubmittedTrackDetails";
import CustomiseRecommendations from "@/ui/components/CustomiseRecommendations";
import RecommendedTracks from "@/ui/components/RecommendedTracks";

import { getSpotifyTrackDetails } from "@/libs/spotify";
import { getLastFmGenres } from "@/libs/lastfm";

export const metadata: Metadata = {
    title: "Recommendations",
};

const temp_dummyRecommendedTracks = [
    {
        name: "Bohemian Rhapsody",
        artists: ["Queen"],
        link: {
            spotify: "https://open.spotify.com/track/4u7EnebtmKWzUH433cf5Qv?si=d402b163ddcb40b9",
            appleMusic: "https://music.apple.com/us/song/bohemian-rhapsody/1440650711",
            youtubeMusic: "https://music.youtube.com/watch?v=bSnlKl_PoQU&si=rizExhbi-h_Zog7w",
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
            video: "yKNxeF4KMsY",
        },
        lyrics: "https://genius.com/Coldplay-yellow-lyrics",
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

export default async function RecommendationsWithID(
    // 1. `spotifyTrackId` is based on the directory's name (i.e. "[spotifyTrackId]" is used as the param)
    // 2. `params` MUST be called `params` not anything else
    { params }: { params: Promise<{ spotifyTrackId: string }> }
) {
    // As `params` is a Promise, we must `await` it
    const { spotifyTrackId } = await params;

    // 1. Get Spotify track details
    //   - Hover over "getSpotifyTrackDetails()" to see exactly what is being returned
    //
    //   - Could have gotten:
    //     - track's audio features @ https://developer.spotify.com/documentation/web-api/reference/get-audio-features
    //     - track's audio analysis @ https://developer.spotify.com/documentation/web-api/reference/get-audio-analysis
    //     - but both are deprecated...
    //
    //   - Could have went:
    //     - from track @ https://developer.spotify.com/documentation/web-api/reference/get-track
    //     - to album   @ https://developer.spotify.com/documentation/web-api/reference/get-an-album
    //     - to get album's genres, but album's genres is deprecated...
    //     - thus, must get genres from Last.fm
    let trackDetailsFromSpotify: { [key: string]: any } = {};
    try {
        trackDetailsFromSpotify = await getSpotifyTrackDetails(spotifyTrackId);
    } catch {
        return (
            <main className="container mx-auto">
                <Hero customMarginBottom="mb-20" />
                <p className="h-[calc(100vh-24rem)] flex items-center justify-center text-gray-400 italic">
                    {/* Height is meticulously calculated to ensure <footer> is out of vh (i.e. requires scrolling to be seen) */}
                    Cannot retrieve track data from Spotify.
                </p>
            </main>
        );
    }

    // 2. Get Last.fm genres
    //   - Last.fm calls it "tags", but we will call it genres for consistency
    //   - Hover over "getLastFmGenres()" to see exactly what is being returned
    const artistName = trackDetailsFromSpotify.artists[0].name; // Must always get the main artist
    const trackName = trackDetailsFromSpotify.name;
    let genresFromLastFm: { name: string }[] = [];
    try {
        genresFromLastFm = await getLastFmGenres(artistName, trackName);
    } catch {
        genresFromLastFm = [];
    }

    // 3. Convert the retrieved data into something suitable for the website
    const submittedTrack = {
        name: trackDetailsFromSpotify.name,
        artists: trackDetailsFromSpotify.artists.map((a: any) => a.name),
        releaseDate: trackDetailsFromSpotify.album.release_date,
        popularity: trackDetailsFromSpotify.popularity,
        genres: genresFromLastFm.map((genreObject) => genreObject.name),
        // NOTE Temporary placeholder
        moods: ["Happy", "Sad", "Party", "Chill"],
    };

    // FIXME
    // TODO  Use https://www.last.fm/api/show/track.getSimilar to create a rough list of recommended tracks
    // TODO  May want to remove `moods`... see what it can be replaced with
    // FIXME

    return (
        /**
         * L side ("Customise Recommendations"):
         * - Double-click to reset slider's value.
         * - For "Release date Range", follow the wireframe (i.e. 2 selectors on 1 slider to indicate range).
         *      - Or use a calendar?
         *      - But calendar that dives into individual days is unnecessary...
         *
         * - Option 1) Upon form submission, put slider's value in URL via something like `?=` maybe?
         *      - So URL will have additional "?=genre-similarity=50&?=popularity=72&..." something like that.
         *      - So page refreshing stores those values.
         * - Option 2) As slider value changes, "Recommended Tracks" is updated in real-time.
         *
         * R side ("Recommended Tracks"):
         * - Make video's size responsive? 360p size? Ultimately, it must scale to video's width.
         */
        <main className="container mx-auto">
            <Hero customMarginBottom="mb-20" />
            <SubmittedTrackDetails submittedTrack={submittedTrack} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <CustomiseRecommendations submittedTrack={submittedTrack} />
                <RecommendedTracks recommendedTracks={temp_dummyRecommendedTracks} />
            </div>
        </main>
    );
}
