import type { Metadata } from "next";

import Hero from "@/ui/components/Hero";
import SubmittedTrackDetails from "@/ui/components/SubmittedTrackDetails";
import CustomiseRecommendations from "@/ui/components/CustomiseRecommendations";
import RecommendedTracks from "@/ui/components/RecommendedTracks";

import { getSpotifyTrackDetails } from "@/libs/spotify";
import { webScrapeLastFmGenres, getLastFmSimilarTracks, webScrapeLastFmYoutubeId } from "@/libs/lastfm";
import { getGeniusSearch, webScrapeGeniusGenres } from "@/libs/genius";
import { inferMoodsFromGenres } from "@/libs/mood";

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

    // --------------------------------------------------------------------------------------- //
    // ----- 1. Get values for "Submitted Track Details" and "Customise Recommendations" ----- //
    // --------------------------------------------------------------------------------------- //

    // ----- 1a. Get user-submitted Spotify track details ----- //

    /**
     * Was planning to get data (i.e. `spotifyTrackDetails`) via:
     *   - track          @ https://developer.spotify.com/documentation/web-api/reference/get-track
     *   - album          @ https://developer.spotify.com/documentation/web-api/reference/get-an-album
     *   - album's genres @ https://developer.spotify.com/documentation/web-api/reference/get-an-album (scroll all the way down)
     * but album's genres method is deprecated...
     *
     * Nonetheless, after getting data (i.e. `spotifyTrackDetails`), was planning to get parameters via:
     *   - track's audio features @ https://developer.spotify.com/documentation/web-api/reference/get-audio-features
     *   - track's audio analysis @ https://developer.spotify.com/documentation/web-api/reference/get-audio-analysis
     *   - recommendations        @ https://developer.spotify.com/documentation/web-api/reference/get-recommendations
     * but all methods are deprecated...
     */

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

    // Ensure track's ".album.release_date" is YYYY-MM-DD
    const releaseDate = spotifyTrackDetails.album.release_date;
    if (releaseDate.length == 4) spotifyTrackDetails.album.release_date = `${releaseDate}-01-01`; // When it is only YYYY
    if (releaseDate.length == 7) spotifyTrackDetails.album.release_date = `${releaseDate}-01`; //    When it is only YYYY-MM

    // Set artist and track names for future uses
    const artistName = spotifyTrackDetails.artists[0].name; // Must get main artist at index 0
    const trackName = spotifyTrackDetails.name;
    const artistAndTrackName = `${artistName} - ${trackName}`;

    // ----- 1b. Get Last.fm (or Genius) genres (they call it "tags" but we shall call it "genres") ----- //

    /**
     * Last.fm API may return only 1 genre element, which is insufficient.
     *
     * Thus, use Genius API (or web scrape Genius page) to retrieve better user-generated genres.
     *
     * Tested with "Dimitri Vegas & Like Mike - Thank You (Not So Bad)"
     * where Last.API returned: `["dimitri vegas and like mike"]`.
     *
     * Source (can manually compare genres too):
     * - https://www.last.fm/music/Dimitri+Vegas+%2526+Like+Mike/_/Thank+You+(Not+So+Bad)
     * - https://genius.com/Dimitri-vegas-and-like-mike-tiesto-dido-and-w-w-thank-you-not-so-bad-lyrics
     */

    let lastFmGenres = await webScrapeLastFmGenres(artistName, trackName);
    if (lastFmGenres.length == 0 || lastFmGenres.length == 1) {
        const searchResults = await getGeniusSearch(artistAndTrackName);
        const firstItemGeniusUrl = searchResults[0].result.url;
        lastFmGenres = await webScrapeGeniusGenres(firstItemGeniusUrl);
    }

    // ----- 1c. Get (custom-created) moods (inferred from genres) ----- //

    /**
     * Gotta "custom-create" and "infer" because:
     * - Spotify API's "audio features" and "audio analysis" methods are deprecated (would've been so useful...)
     * - Last.fm API retrieves nothing useful
     * - Genius API retrieves nothing useful
     */

    const numberOfMoodsToGet = 2;
    const inferredMoods = inferMoodsFromGenres(lastFmGenres, numberOfMoodsToGet);

    // ----- 1z. Convert the retrieved data into something suitable (i.e. its type) for frontend components ----- //

    const submittedTrack = {
        name: spotifyTrackDetails.name,
        artists: spotifyTrackDetails.artists.map((artist) => artist.name),
        releaseDate: spotifyTrackDetails.album.release_date,
        genres: lastFmGenres,
        popularity: spotifyTrackDetails.popularity,
        moods: inferredMoods,
    };

    // -------------------------------------------------- //
    // ----- 3. Get values for "Recommended Tracks" ----- //
    // -------------------------------------------------- //

    // ----- 3a. Get recommended tracks ----- //

    // NOTE Current recommendations are placeholders - it uses Last.fm API's "similar tracks" method
    // TODO Actual recommendations are dynamic and based on "submittedTrack.genres (similarity)", ".popularity", and ".moods"
    // NOTE This is not so urgent, work on FIXMEs below first!

    let lastFmSimilarTracks = await getLastFmSimilarTracks(artistName, trackName);
    // TODO Handle cases where there no similar tracks (so far, while testing, every track HAS some similar tracks)
    if (lastFmSimilarTracks.length == 0) lastFmSimilarTracks = ["No similar tracks found"];

    // ----- 3b. Get recommended tracks' YouTube ID for video embedding ----- //
    const lastFmSimilarTracksWithYoutubeId = await Promise.all(
        lastFmSimilarTracks
            // TODO Allow user to adjust this value, could create page navigation?
            // Limit number of results
            .slice(0, 5)
            // Add `youtubeId` key to `lastFmSimilarTracksWithYoutubeId` object
            .map(async (similarTrack: similarTrackType) => {
                const youtubeId = await webScrapeLastFmYoutubeId(similarTrack.url);
                return { ...similarTrack, youtubeId };
            })
    );

    // FIXME
    // ----- 3c. Get recommended tracks' `link` values (for "Listen at:" buttons) TODO Check out the track's Last.fm page and web scrape music platform links ----- //
    // FIXME

    // FIXME
    // ----- 3y. Get xxx TODO Work on replacing placeholders below ----- //
    // FIXME

    // ----- 3z. Convert the retrieved data into something suitable for the website ----- //
    const recommendedTracks = lastFmSimilarTracksWithYoutubeId.map((recommendedTrack) => ({
        name: recommendedTrack.name,
        artists: [recommendedTrack.artist.name],
        link: {
            // TODO Find another to ensure `null` is handled
            video: recommendedTrack.youtubeId,
            // NOTE All these are placeholders TODO Replace with actual links
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
