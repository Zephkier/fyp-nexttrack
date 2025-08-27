import type { Metadata } from "next";

import Hero from "@/ui/components/Hero";
import SubmittedTrackDetails from "@/ui/components/SubmittedTrackDetails";
import CustomiseRecommendations from "@/ui/components/CustomiseRecommendations";
import RecommendedTracks from "@/ui/components/RecommendedTracks";

import { getSpotifyTrackDetails } from "@/libs/spotify";
import {
    getLastFmGenres_deprecated, // Hover over function to see why it is "deprecated"
    webScrapeLastFmGenres,
    getLastFmSimilarTracks,
    webScrapeLastFmYoutubeId,
} from "@/libs/lastfm";

type similarTrackType = Awaited<ReturnType<typeof getLastFmSimilarTracks>>;

export const metadata: Metadata = {
    title: "Recommendations",
};

export default async function RecommendationsWithId(
    // 1. `spotifyTrackId` is based on the directory's name (i.e. "[spotifyTrackId]" is used as the param)
    // 2. `params` MUST be called `params` not anything else
    // 3. `spotifyTrackId` MUST be enclosed in `{}` because `params` is of type `{ [key: string]: string | string[] }`
    //   - If it's not enclosed in `{}`, it will be of type `string` and the destructuring will not work
    { params }: { params: Promise<{ spotifyTrackId: string }> }
) {
    // As `params` is a Promise, we must `await` it (see demonstration from 3-nextjs-app-demo/src/app/users/[someUserID]/page.tsx::User())
    const { spotifyTrackId } = await params;

    // ------------------------------------------------------------------------------------------------ //
    // ----- 1. Get values for "Submitted Track Details" and "Customise Recommendations" ----- //
    // ------------------------------------------------------------------------------------------------ //

    // ----- 1a. Get incoming Spotify track details ----- //
    // - Was planning to get data from:
    //   - from track        @ https://developer.spotify.com/documentation/web-api/reference/get-track
    //   - to album          @ https://developer.spotify.com/documentation/web-api/reference/get-an-album
    //   - to album's genres @ https://developer.spotify.com/documentation/web-api/reference/get-an-album (scroll all the way down)
    //   - but album's genres is deprecated...
    // - After getting basic details, was planning to get data from:
    //   - track's audio features @ https://developer.spotify.com/documentation/web-api/reference/get-audio-features
    //   - track's audio analysis @ https://developer.spotify.com/documentation/web-api/reference/get-audio-analysis
    //   - recommendations        @ https://developer.spotify.com/documentation/web-api/reference/get-recommendations
    //   - but all are deprecated...
    const spotifyTrackDetails = await getSpotifyTrackDetails(spotifyTrackId);
    if (!spotifyTrackDetails) {
        // Return a page because, if this step fails, then nothing can happen anyway
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

    // ----- 1b. Get Last.fm genres ----- //
    // - Last.fm calls it "tags", but we shall call it "genres" for consistency
    const artistName = spotifyTrackDetails.artists[0].name; // Must always get the main artist
    const trackName = spotifyTrackDetails.name;
    let lastFmGenres = await webScrapeLastFmGenres(artistName, trackName);
    if (lastFmGenres.length == 0) lastFmGenres = ["No genres found"];

    // ----- 1c. Convert the retrieved data into something suitable for the website ----- //
    const submittedTrack = {
        name: spotifyTrackDetails.name,
        artists: spotifyTrackDetails.artists.map((artist) => artist.name),
        releaseDate: spotifyTrackDetails.album.release_date,
        popularity: spotifyTrackDetails.popularity,
        genres: lastFmGenres,
        moods: ["Happy", "Sad", "Party", "Chill"], // NOTE Strings are placeholders // TODO May want to replace "moods" with something more usable/realistic...
    };

    // -------------------------------------------------- //
    // ----- 3. Get values for "Recommended Tracks" ----- //
    // -------------------------------------------------- //

    // ----- 3a. Get recommended tracks NOTE Using similar tracks as placeholder TODO Recommended tracks should be based on "Customise Recommendations"
    let lastFmSimilarTracks = await getLastFmSimilarTracks(artistName, trackName);
    if (lastFmSimilarTracks.length == 0) lastFmSimilarTracks = ["No similar tracks found"]; // TODO Handle the case where no similar tracks are found because, so far, every track HAS similar tracks

    // ----- 3b. Get recommended tracks' YouTube ID for video embedding
    const lastFmSimilarTracksWithYoutubeId = await Promise.all(
        lastFmSimilarTracks
            // Limit number of results TODO Allow user to adjust this value, or create page navigation
            .slice(0, 5)
            // Add `youtubeId` key to `lastFmSimilarTracksWithYoutubeId` object
            .map(async (similarTrack: similarTrackType) => {
                const youtubeId = await webScrapeLastFmYoutubeId(similarTrack.url);
                return { ...similarTrack, youtubeId };
            })
    );

    // FIXME
    // ----- 3c. Get recommended tracks' `link` values TODO Start with Spotify, go to a track's Last.fm page, F12, CTRL + F "spotify"
    // FIXME

    // ----- 3y. Get xxx TODO Work on replacing placeholders below

    // ----- 3z. Convert the retrieved data into something suitable for the website ----- //
    const recommendedTracks = lastFmSimilarTracksWithYoutubeId.map((recommendedTrack) => ({
        name: recommendedTrack.name,
        artists: [recommendedTrack.artist.name],
        link: {
            // TODO Find another to ensure `null` is handled
            video: recommendedTrack.youtubeId,
            // NOTE All these are placeholders TODO Replace with actual links to the recommended track
            spotify: "https://open.spotify.com/track/4u7EnebtmKWzUH433cf5Qv?si=d402b163ddcb40b9",
            appleMusic: "https://music.apple.com/us/song/bohemian-rhapsody/1440650711",
            youtubeMusic: "https://music.youtube.com/watch?v=bSnlKl_PoQU&si=rizExhbi-h_Zog7w",
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
    }));

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
                <RecommendedTracks recommendedTracks={recommendedTracks} />
            </div>
        </main>
    );
}
