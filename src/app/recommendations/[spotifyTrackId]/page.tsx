import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Recommendations",
};

import RecommendationsWithIdClient from "./pageClient";

import { inferMoodsFromGenres } from "@/libs/mood";
import { getSpotifyTrackDetails } from "@/libs/spotify";
import type { lastFmSimilarTrackType } from "@/libs/lastfm";
import {
    // Format
    getLastFmGenres,
    webScrapeLastFmGenres,
    getLastFmSimilarTracks,
    webScrapeLastFmYoutubeId,
    webScrapeLastFmListenAtLinks,
    // TODO This is very similar to previous `get...()` functions, could further modularise
    getLastFmAboutLink,
} from "@/libs/lastfm";
import {
    // Format
    getGeniusSearch,
    webScrapeGeniusGenres,
    getGeniusAboutLink,
} from "@/libs/genius";

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

    /**
     * Spotify API returns `null` or an object with many keys.
     * @see {@linkcode getSpotifyTrackDetails()}
     */
    const spotifyTrackDetails = await getSpotifyTrackDetails(spotifyTrackId);
    // Return a page because, if this step fails, then nothing can happen anyway
    if (!spotifyTrackDetails) {
        return (
            <main className="container mx-auto">
                <p className="h-[calc(100vh-24rem)] flex items-center justify-center text-gray-400 italic">
                    {/* Height is meticulously calculated to ensure `<footer>` is out of vh so that the scrollbar appears */}
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

    // // TEST Handle cases where there are insufficient genres (move this line anywhere)
    // retrievedGenres = [];

    let retrievedGenres: string[] = await getLastFmGenres(artistName, trackName);
    const minNumberOfGenres = 2;
    if (retrievedGenres.length < minNumberOfGenres) retrievedGenres = await webScrapeLastFmGenres(artistName, trackName);
    if (retrievedGenres.length < minNumberOfGenres) {
        const searchResults = await getGeniusSearch(artistName, trackName);
        const firstSearchResultGeniusUrl: string | null = searchResults?.[0]?.result?.url ?? null;
        if (firstSearchResultGeniusUrl) retrievedGenres = await webScrapeGeniusGenres(firstSearchResultGeniusUrl);
    }
    if (retrievedGenres.length < minNumberOfGenres) retrievedGenres = ["no genres found"];

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
        genres: retrievedGenres.map((genre) => genre.toLowerCase()),
        popularity: spotifyTrackDetails.popularity,
        moods: inferredMoods,
    };

    // -------------------------------------------------- //
    // ----- 3. Get values for "Recommended Tracks" ----- //
    // -------------------------------------------------- //

    // ----- Get recommended tracks ----- //

    /**
     * TODO This is not urgent, work on others first.
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

    /**
     * Last.fm API returns `[]` or an array of objects.
     * @see {@linkcode getLastFmSimilarTracks()}
     */
    let lastFmSimilarTracks1 = await getLastFmSimilarTracks(artistName, trackName);

    // TODO Allow users to adjust this value (via page navigation? select value via dropdown box?)
    // Limit number of results
    const numberOfRecommendations = 10;
    lastFmSimilarTracks1 = lastFmSimilarTracks1.slice(0, numberOfRecommendations);

    // // TEST Handle cases where there are no recommended tracks.
    // lastFmSimilarTracks1 = [];

    // ----- Get recommended tracks' additional details ----- //

    /**
     * From this point onwards, the Spotify/Last.fm/Genius APIs are unable to retrieve anything useful.
     *
     * Thus, web scraping is used more often to get data.
     */

    /**
     * Last.fm API returns `[]` or an array of objects, where each object has additional keys like:
     *
     * ```js
     * {
     *     ...lastFmSimilarTracks1[0],
     *     youtubeId: 'WbN0nX61rIs',
     *     listenAtLinks: {
     *         spotify: 'https://open.spotify.com/track/71iSmEeF0qRVyULABxP75P',
     *         appleMusic: 'https://geo.music.apple.com/album/id1440862789?i=1440862797&at=10l3Sh',
     *         youtubeMusic: 'https://music.youtube.com/watch?v=WbN0nX61rIs'
     *     }
     * },
     * // Repeat `{}` for `numberOfRecommendations` more times
     * ```
     *
     * @see {@linkcode getLastFmSimilarTracks()}
     * @see `youtubeId` via {@linkcode webScrapeLastFmYoutubeId()}
     * @see `listenAtLinks` via {@linkcode webScrapeLastFmListenAtLinks()}
     */
    const lastFmSimilarTracks2 = await Promise.all(
        lastFmSimilarTracks1.map(async (lastFmSimilarTrack: lastFmSimilarTrackType) => {
            /**
             * **Additional detail 1: YouTube ID for video embed** \
             * Web scraping Last.fm page returns `null` or a string.
             * @see {@linkcode webScrapeLastFmYoutubeId()}
             */
            const youtubeId = await webScrapeLastFmYoutubeId(lastFmSimilarTrack.url);

            /**
             * **Additional detail 2: "Listen at" buttons' link** \
             * Web scraping Last.fm page returns a `listenAtLinks` object with 3 keys.
             * @see {@linkcode webScrapeLastFmListenAtLinks()}
             */
            const listenAtLinks = await webScrapeLastFmListenAtLinks(lastFmSimilarTrack.url);

            /**
             * **Additional detail 3: "About" buttons' link** \
             * Genius API returns `null` or an array of objects.
             * @see {@linkcode getGeniusSearch()}
             */
            const searchResults = await getGeniusSearch(lastFmSimilarTrack.artist.name, lastFmSimilarTrack.name);
            const firstSearchResultGeniusUrl: string | null = searchResults?.[0]?.result?.url ?? null;
            const geniusAboutLink = await getGeniusAboutLink(firstSearchResultGeniusUrl, lastFmSimilarTrack.name);
            const lastFmAboutLink = await getLastFmAboutLink(lastFmSimilarTrack.artist.name, lastFmSimilarTrack.name);

            // ----- Done ----- //
            return {
                ...lastFmSimilarTrack,
                // Format
                youtubeId,
                listenAtLinks,
                aboutLinks: {
                    genius: geniusAboutLink,
                    lastFm: lastFmAboutLink,
                },
            };
        })
    );

    // ----- (Last step) Convert retrieved data into suitable types for frontend components to render ----- //

    // TODO Unsure to set `... ?? ...` here or within their own "lib" functions
    const recommendedTracks = lastFmSimilarTracks2.map((recommendedTrack) => {
        const linkToItsGeniusPage = recommendedTrack?.aboutLinks?.genius ?? "https://genius.com/";
        const linkToItsLastFmPage = recommendedTrack?.aboutLinks?.lastFm ?? "https://www.last.fm/";
        return {
            // TODO Handle `null` cases such that it displays greyed italic text like for `video`
            name: recommendedTrack?.name ?? "Unknown track name",
            // TODO Handle `null` cases such that it displays greyed italic text like for `video`
            artists: [recommendedTrack?.artist.name ?? "Unknown artist name"],
            video: recommendedTrack?.youtubeId ?? null,
            links: {
                spotify: recommendedTrack?.listenAtLinks?.spotify ?? "https://open.spotify.com/",
                appleMusic: recommendedTrack?.listenAtLinks?.appleMusic ?? "https://geo.music.apple.com",
                youtubeMusic: recommendedTrack?.listenAtLinks?.youtubeMusic ?? "https://music.youtube.com",
            },
            // TODO Display the actual text instead of having a button with its link
            // Re-use value in its `about.genius` key
            about: {
                genius: linkToItsGeniusPage,
                lastFm: linkToItsLastFmPage,
            },
            // TODO Display the actual text instead of having a button with its link
            // Re-use value in its `about.genius` key
            comments: {
                genius: `${linkToItsGeniusPage}#comments`,
                lastFm: `${linkToItsLastFmPage}#shoutbox`,
            },
            // TODO Display the actual text instead of having a button with its link
            // Re-use value in its `about.genius` key
            lyrics: linkToItsGeniusPage,
        };
    });

    // // TEST
    // for (const recommendedTrack of recommendedTracks) {
    //     console.log(recommendedTrack);
    // }
    // console.log("[!] ^ from ./src/app/recommendations/[spotifyTrackID]/page.tsx");

    return (
        <RecommendationsWithIdClient
            // Format
            submittedTrack={submittedTrack}
            initialRecommendedTracks={recommendedTracks}
        />
    );
}
