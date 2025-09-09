import type { Metadata } from "next";

import Hero from "@/ui/components/Hero";
import SubmittedTrackDetails from "@/ui/components/SubmittedTrackDetails";
import CustomiseRecommendations from "@/ui/components/CustomiseRecommendations";
import RecommendedTracks from "@/ui/components/RecommendedTracks";

import { getSpotifyTrackDetails } from "@/libs/spotify";
import { getLastFmGenres, webScrapeLastFmGenres, getLastFmSimilarTracks, webScrapeLastFmYoutubeId, webScrapeLastFmListenAtLinks } from "@/libs/lastfm";
import { getGeniusSearch, getGeniusSong_deprecated, webScrapeGeniusGenres } from "@/libs/genius";
import { inferMoodsFromGenres } from "@/libs/mood";

type similarTrackType = Awaited<ReturnType<typeof getLastFmSimilarTracks>>;

export const metadata: Metadata = {
    title: "Recommendations",
};

/**
 * 1. `spotifyTrackId` is based on the directory's name (which has been named `[spotifyTrackId]`).
 * 2. `params` **must** be called `params` and not anything else due to nature of Next.js.
 */
export default async function RecommendationsWithId({ params }: { params: Promise<{ spotifyTrackId: string }> }) {
    /**
     * `spotifyTrackId` must...
     *
     * - be enclosed in `{}` due to `params` being enclosed in `{}` too.
     * - use `await` due to `params`'s type being a Promise.
     */
    const { spotifyTrackId } = await params;

    // ------------------------------------------------------- //
    // ----- 1. Get values for "Submitted Track Details" ----- //
    // ------------------------------------------------------- //

    // ----- Get user-submitted (Spotify) track details ----- //

    /**
     * Unfortunately, Spotify API's `/albums/`, `/audio-features/`, `/audio-analysis/`, \
     * and `/recommendations` endpoints are deprecated.
     *
     * Source: https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api
     *
     * -----
     *
     * Was planning to get details (i.e. data) for `spotifyTrackDetails` via:
     *
     * - `GET /tracks/{id}` via https://developer.spotify.com/documentation/web-api/reference/get-track \
     *   to get its `album.id` value, then...
     *
     * - `GET /albums/{album.id}` via https://developer.spotify.com/documentation/web-api/reference/get-an-album \
     *   to get its `genres` value.
     *
     * And then getting parameters for `spotifyTrackDetails` via:
     *
     * - `GET /audio-features/{id}` via https://developer.spotify.com/documentation/web-api/reference/get-audio-features \
     *   to get its `acousticness`, `danceability`, and more, or...
     *
     * - `GET /audio-analysis/{id}` via https://developer.spotify.com/documentation/web-api/reference/get-audio-analysis \
     *   to get its `track.tempo`, `track.key`, and more, or...
     *
     * - `GET /recommendations` via https://developer.spotify.com/documentation/web-api/reference/get-recommendations \
     *   to get its recommendations based on the user-submitted artist and track names.
     */

    const spotifyTrackDetails = await getSpotifyTrackDetails(spotifyTrackId);
    // Return a page because, if this step fails, then nothing can happen anyway
    if (!spotifyTrackDetails) {
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

    // Ensure user-submitted track's `album.release_date` is YYYY-MM-DD
    const releaseDate = spotifyTrackDetails.album.release_date;
    // When it is only YYYY
    if (releaseDate.length == 4) spotifyTrackDetails.album.release_date = `${releaseDate}-01-01`;
    // When it is only YYYY-MM
    if (releaseDate.length == 7) spotifyTrackDetails.album.release_date = `${releaseDate}-01`;

    // Set artist (must get main artist at `[0]`) and track names for future use
    const artistName = spotifyTrackDetails.artists[0].name;
    const trackName = spotifyTrackDetails.name;
    const artistAndTrackName = `${artistName} - ${trackName}`;

    // --------------------------------------------------------- //
    // ----- 2. Get values for "Customise Recommendations" ----- //
    // --------------------------------------------------------- //

    // ----- Get genres (Last.fm and Genius call it "tags", but we shall call it "genres" for simplicity) ----- //

    /**
     * Sources to get genres:
     *
     * Priority 1. Spotify API               - has no genre-related data \
     * Priority 2. Last.fm API               - inconsistent; may return 0 genres \
     * Priority 3. Last.fm web scrape        - insufficient; may return 1 genre \
     * Priority 4. Genius API                - has no genre-related data \
     * Priority 5. Genius web scrape         - last resort \
     * Priority 6. Set `["no genres found"]` - fail-safe
     */

    // Doing "Priority 1. Spotify API"
    // NIL

    // Doing "Priority 2. Last.fm API"
    let retrievedGenres = await getLastFmGenres(artistName, trackName);

    // Doing "Priority 3. Last.fm web scrape" when the above returns insufficient genres
    if (retrievedGenres.length < 2) retrievedGenres = await webScrapeLastFmGenres(artistName, trackName);

    // Doing "Priority 4. Genius API"
    // NIL, in "./src/libs/genius.ts", created `getGeniusSong_deprecated()` function
    // only to find out that it has no genre-related data.

    // Doing "Priority 5. Genius web scrape" when the above (still) returns insufficient genres
    if (retrievedGenres.length < 2) {
        const searchResults = await getGeniusSearch(artistAndTrackName);
        // NOTE The first search result is usually correct
        const firstResultGeniusUrl = searchResults[0].result.url;
        retrievedGenres = await webScrapeGeniusGenres(firstResultGeniusUrl);
    }

    // Doing "Priority 6. Set..." when the above (still) returns insufficient genres
    if (retrievedGenres.length < 2) retrievedGenres = ["no genres found"];

    // ----- Get moods that are custom-created and inferred from genres ----- //

    /**
     * Must "custom-create" and "infer" because:
     *
     * - Spotify API's `/audio-features/{id}` and `/audio-analysis/{id}` methods are deprecated
     * - Last.fm API has no genre-related data
     * - Genius API has no genre-related data
     */

    const numberOfMoodsToGet = 2;
    const inferredMoods = inferMoodsFromGenres(retrievedGenres, numberOfMoodsToGet);

    // ----- (Last step) Convert and standardise retrieved data into suitable types for frontend components to render ----- //

    const submittedTrack = {
        name: spotifyTrackDetails.name,
        artists: spotifyTrackDetails.artists.map((artist) => artist.name),
        releaseDate: spotifyTrackDetails.album.release_date,
        genres: retrievedGenres.map((genre: string) => genre.toLowerCase()),
        popularity: spotifyTrackDetails.popularity,
        moods: inferredMoods,
    };

    // -------------------------------------------------- //
    // ----- 3. Get values for "Recommended Tracks" ----- //
    // -------------------------------------------------- //

    // ----- Get recommended tracks ----- //

    /**
     * NOTE
     *
     * This is not urgent. Work on others (below) first.
     *
     * Current recommendations are placeholders.
     *
     * In fact, it simply uses similar tracks as recommendations \
     * via Last.fm API's `track.getSimilar` endpoint.
     *
     * Actual recommendations must be dynamic and based on:
     *
     * - `submittedTrack.genres` similarity value
     * - `submittedTrack.popularity` value
     * - `submittedTrack.releaseDate` range of values
     * - `submittedTrack.moods` value
     */

    let lastFmSimilarTracks1 = await getLastFmSimilarTracks(artistName, trackName);

    // TODO Allow users to adjust this value via page navigation?
    // Limit number of results (done here for better separation of concerns)
    const numberOfRecommendations = 10;
    lastFmSimilarTracks1 = lastFmSimilarTracks1.slice(0, numberOfRecommendations);

    // // TEST Handle cases where there are no recommended tracks (done in "./src/ui/components/RecommendedTracks.tsx")
    // lastFmSimilarTracks1 = [];

    // DONE Continue housekeeping from below here DONE

    // ----- Get recommended tracks' additional details ----- //

    /**
     * From this point onwards, the Spotify/Last.fm/Genius APIs are unable to retrieve anything useful.
     *
     * Thus, web scraping is used more often to get data.
     */

    /**
     * Contains the same as `lastFmSimilarTracks1` but with additional keys:
     * 
     * ```js
        [
            {
                ...lastFmSimilarTracks1[0],
                // Via `webScrapeLastFmYoutubeId()`
                youtubeId: "X_SEwgDl02E"
                // Via `webScrapeLastFmListenAtLinks()`
                link: {
                    spotify: 'https://open.spotify.com/track/35xSkNIXi504fcEwz9USRB',
                    appleMusic: 'https://geo.music.apple.com/album/id1146195596?i=1146195716&at=10l3Sh',
                    youtubeMusic: 'https://music.youtube.com/watch?v=X_SEwgDl02E'
                }
            },
            // And repeat however more times based on `.slice()` amount after calling `getLastFmSimilarTracks()` above
        ]
     * ```
     */
    const lastFmSimilarTracks2 = await Promise.all(
        lastFmSimilarTracks1.map(async (similarTrack: similarTrackType) => {
            // ----- 3b.i. Additional detail: YouTube ID for video embed ----- //
            const youtubeId = await webScrapeLastFmYoutubeId(similarTrack.url);

            // ----- 3b.ii. Additional detail: "Listen at" buttons' link ----- //
            const listenAtLinks = await webScrapeLastFmListenAtLinks(similarTrack.url);

            // ----- 3b.iii. Additional detail: "About" buttons' link ----- //
            const artistAndTrackName = `${similarTrack.artist.name} - ${similarTrack.name}`;
            // // TEST Start
            // /**
            //  * Not using `getGeniusSearch()` because its first (and, sometimes, only) search result may be wrong.
            //  *
            //  * The following demo uses "Dimitri Vegas & Like Mike - Thank You (Not So Bad)" \
            //  * (via https://open.spotify.com/track/09CnYHiZ5jGT1wr1TXJ9Zt?si=68c00376f8e7456a) \
            //  * as NextTrack's user-submitted track.
            //  */
            // const searchResults = await getGeniusSearch(artistAndTrackName);
            // const firstResultGeniusUrl = searchResults[0].result.url;
            // // Demo of both correct and wrong search results
            // const demoCorrect = "David Guetta - When We Were Young (The Logical Song)";
            // if (artistAndTrackName == demoCorrect) {
            //     console.log("\nCorrect URL:");
            //     console.log(`Name: ${artistAndTrackName}`);
            //     console.log(`URL : ${firstResultGeniusUrl}`);
            // }
            // const demoWrong1 = "Timmy Trumpet - Like A G6 (with Naeleck)";
            // const demoWrong2 = "Alesso - I Like It (with Nate Smith)";
            // if (artistAndTrackName == demoWrong1 || artistAndTrackName == demoWrong2) {
            //     console.log("\nWrong URL:");
            //     console.log(`Name: ${artistAndTrackName}`);
            //     console.log(`URL : ${firstResultGeniusUrl}`);
            // }
            // // TEST End

            // ----- Done ----- //
            return { ...similarTrack, youtubeId, listenAtLinks };
        })
    );

    // FIXME TODO Continue replacing placeholders below. For now, it is for the `about` key.

    // TEST
    // console.log("[!] v from '...[spotifyTrackID]/page.tsx' @ line ~222");
    // console.log(lastFmSimilarTracks2[1]);
    // console.log("[!] ^ from '...[spotifyTrackID]/page.tsx' @ line ~228");

    // ----- 3y. Get xxx FIXME Work on replacing placeholders below FIXME ----- //

    // x

    // ----- (Last step) Convert retrieved data into suitable types for frontend components to render ----- //

    const recommendedTracks = lastFmSimilarTracks2.map((recommendedTrack) => ({
        name: recommendedTrack.name,
        artists: [recommendedTrack.artist.name],
        video: recommendedTrack.youtubeId, // May pass in a `null`
        links: {
            spotify: recommendedTrack.listenAtLinks.spotify,
            appleMusic: recommendedTrack.listenAtLinks.appleMusic,
            youtubeMusic: recommendedTrack.listenAtLinks.youtubeMusic,
        },
        about: {
            genius: "https://genius.com/Queen-bohemian-rhapsody-lyrics",
            lastFm: "https://www.last.fm/music/Queen/_/Bohemian+Rhapsody+-+Remastered+2011/+wiki",
        },
        comments: {
            genius: "https://genius.com/Queen-bohemian-rhapsody-lyrics#comments",
            lastFm: "https://www.last.fm/music/Queen/_/Bohemian+Rhapsody+-+Remastered+2011#shoutbox",
        },
        lyrics: "https://genius.com/Queen-bohemian-rhapsody-lyrics",
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
