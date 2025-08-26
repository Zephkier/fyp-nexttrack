import type { Metadata } from "next";

import Hero from "@/ui/components/Hero";
import SubmittedTrackDetails from "@/ui/components/SubmittedTrackDetails";
import CustomiseRecommendations from "@/ui/components/CustomiseRecommendations";
import RecommendedTracks from "@/ui/components/RecommendedTracks";

import { getSpotifyTrackDetails } from "@/libs/spotify";
import { getLastFmGenres, getLastFmSimilarTracks, getLastFmYoutubeId } from "@/libs/lastfm";

type trackDetailsFromSpotifyType = Awaited<ReturnType<typeof getSpotifyTrackDetails>>;
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

    // 1. Get Spotify track details
    //   - Could have gotten:
    //     - track's audio features @ https://developer.spotify.com/documentation/web-api/reference/get-audio-features
    //     - track's audio analysis @ https://developer.spotify.com/documentation/web-api/reference/get-audio-analysis
    //     - recommendations @ https://developer.spotify.com/documentation/web-api/reference/get-recommendations
    //     - but all are deprecated...
    //   - Could have went:
    //     - from track @ https://developer.spotify.com/documentation/web-api/reference/get-track
    //     - to album   @ https://developer.spotify.com/documentation/web-api/reference/get-an-album
    //     - to get album's genres, but album's genres is deprecated...
    //     - thus, next best thing is to get genres from Last.fm
    let trackDetailsFromSpotify: trackDetailsFromSpotifyType;
    try {
        // Hover over function to see exactly what is being returned
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
    const artistName = trackDetailsFromSpotify.artists[0].name; // Must always get the main artist
    const trackName = trackDetailsFromSpotify.name;
    let genresFromLastFm: { name: string }[] = [];
    try {
        // Hover over function to see exactly what is being returned
        genresFromLastFm = await getLastFmGenres(artistName, trackName);
        if (genresFromLastFm.length == 0) genresFromLastFm = [{ name: "No genres found in Last.fm" }];
    } catch {
        genresFromLastFm = [];
    }

    // 3. Convert the retrieved data into something suitable for the website
    const submittedTrack = {
        name: trackDetailsFromSpotify.name,
        artists: trackDetailsFromSpotify.artists.map((artist) => artist.name),
        releaseDate: trackDetailsFromSpotify.album.release_date,
        popularity: trackDetailsFromSpotify.popularity,
        genres: genresFromLastFm.map((genreObject) => genreObject.name),
        // TODO  May want to remove `moods`... see what it can be replaced with
        // NOTE Temporary placeholder
        moods: ["Happy", "Sad", "Party", "Chill"],
    };

    // 4. Get similar tracks as recommended tracks
    let similarTracksFromLastFm;
    try {
        // Hover over function to see exactly what is being returned
        similarTracksFromLastFm = await getLastFmSimilarTracks(artistName, trackName);
    } catch {
        similarTracksFromLastFm = [];
    }

    // 5. Web scrape the similar track's Last.fm page and add a `youtubeId` key
    //   - Hover over "getLastFmYoutubeId()" to see exactly what is being returned
    const similarTracksFromLastFmWithYoutubeIds = await Promise.all(
        similarTracksFromLastFm
            // Limit to first 5 tracks (TODO Allow user to change this value?)
            .slice(0, 5)
            .map(async (similarTrack: similarTrackType) => {
                // The URL leads to the similar track's respective Last.fm page
                const youtubeId = await getLastFmYoutubeId(similarTrack.url);
                // Basically append/push it to the `similarTracksFromLastFm` object
                return { ...similarTrack, youtubeId };
            })
    );

    // 6. Convert the retrieved data into something suitable for the website
    const recommendedTracks = similarTracksFromLastFmWithYoutubeIds.map((recommendedTrack) => ({
        name: recommendedTrack.name,
        artists: [recommendedTrack.artist.name],
        link: {
            video: recommendedTrack.youtubeId ?? null,
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
