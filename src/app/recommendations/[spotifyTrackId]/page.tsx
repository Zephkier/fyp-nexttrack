import type { Metadata } from "next";
import type { lastFmSimilarTrackType } from "@/libs/api/lastfm";
import type { recommendedTrackType } from "@/ui/components/recommendations/RecommendedTrack";

import { getSpotifyTrackId, getSpotifyTrackDetails, setSpotifyReleaseDate } from "@/libs/api/spotify";
import { getLastFmSimilarTracks, webScrapeLastFmYoutubeId, webScrapeLastFmListenAtLinks } from "@/libs/api/lastfm";
import { getGeniusSearch, getGeniusAboutLink } from "@/libs/api/genius";

import { getGenres } from "@/libs/helper/genres";
import { inferMoodsFromGenres } from "@/libs/helper/moods";

import TrackRecommendationsClient from "./page.client";

export const metadata: Metadata = {
    title: "Recommendations",
};

/**
 * 1. `spotifyTrackId` is based on the directory's name (which has been named `[spotifyTrackId]`).
 * 2. `params` **must** be called `params` and not anything else due to nature of Next.js.
 */
export default async function TrackRecommendationsPage({ params }: { params: Promise<{ spotifyTrackId: string }> }) {
    /**
     * `spotifyTrackId` must...
     *
     * - be enclosed in `{}` due to `params` being enclosed in `{}` too.
     * - use `await` due to `params`'s type being a Promise.
     */
    const { spotifyTrackId } = await params;

    /**
     * NOTE
     *
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

    // --------------------------------------------------------------------------------------------------- //
    // ----- 1. Get values for "Submitted Track Details" and 2. "Customise Recommendations" sections ----- //
    // --------------------------------------------------------------------------------------------------- //

    // ----- Get user-submitted (Spotify) track details (i.e. name, artist, release date) ----- //

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
    spotifyTrackDetails.album.release_date = setSpotifyReleaseDate(spotifyTrackDetails.album.release_date);

    // Set artist (must get main artist at `[0]`) and track names for future use
    const artistName = spotifyTrackDetails.artists[0].name;
    const trackName = spotifyTrackDetails.name;

    // ----- Get genres ----- //

    const retrievedGenres = await getGenres(artistName, trackName);

    // ----- Get moods (that are custom-created and inferred from genres) ----- //

    /**
     * Must "custom-create" and "infer" because:
     *
     * - Spotify API's `/audio-features/{id}` and `/audio-analysis/{id}` methods are deprecated
     * - Last.fm API has no genre-related data
     * - Genius API has no genre-related data
     */

    const numberOfMoodsToGet = 2;
    const inferredMoods = inferMoodsFromGenres(retrievedGenres, numberOfMoodsToGet);

    // ----- (Last) Convert and standardise retrieved data into suitable types for frontend components to render ----- //

    const submittedTrack = {
        name: spotifyTrackDetails.name,
        artists: spotifyTrackDetails.artists.map((artist) => artist.name),
        genres: retrievedGenres,
        popularity: spotifyTrackDetails.popularity,
        releaseDate: spotifyTrackDetails.album.release_date,
        moods: inferredMoods,
    };

    // -------------------------------------------------- //
    // ----- 3. Get values for "Recommended Tracks" ----- //
    // -------------------------------------------------- //

    // ----- Get recommended tracks ----- //

    /**
     * Last.fm API returns `[]` or an array of 100 objects. \
     * \+ \
     * Limit the number of recommended tracks shown (i.e. to work with) (max: 100).
     *
     * - Tried working with 100 recommended tracks but it tends to run into "ECONNRESET" error.
     * - Best to work with 50 to 75 recommended tracks.
     *
     * -----
     *
     * TODO
     *
     * - Idea 1: Browse via pagination?
     * - Idea 2: Adjust recommended tracks shown (i.e. to work with) via dropdown box?
     *
     * -----
     *
     * @see {@linkcode getLastFmSimilarTracks()}
     */
    let lastFmSimilarTracks: lastFmSimilarTrackType[] = await getLastFmSimilarTracks(artistName, trackName);
    const numberOfRecommendedTracks = 100;
    lastFmSimilarTracks = lastFmSimilarTracks.slice(0, numberOfRecommendedTracks);

    // // TEST Handle cases where there are no recommended tracks.
    // lastFmSimilarTracks = [];

    /**
     * Converting from `lastFmSimilarTrackType` to `recommendedTrackType`.
     *
     * -----
     *
     * TODO
     *
     * - Unsure to set `??` here or within their own functions over at `./src/libs`.
     *
     * - Handle `null` cases such that it displays greyed italic text like for `video`.
     *   - This means handling things like `"Unknown track/artist name"` etc.
     *
     * - Display the actual (about and lyrics) text instead of having a button with its link.
     */
    const initialRecommendedTracksNew: recommendedTrackType[] = [];

    for (const lastFmSimilarTrack of lastFmSimilarTracks) {
        // ----- Get recommended tracks' additional details ----- //

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
        const spotifyLink = listenAtLinks?.spotify ?? "https://open.spotify.com";
        /**
         * **Additional detail 3: "About" buttons' link** \
         * Genius API (`getGeniusSearch()`) returns `null` or an array of objects. \
         * Then Genius API or web scraping (`getGeniusAboutLink()`) returns `null` or a string.
         * @see {@linkcode getGeniusSearch()}
         * @see {@linkcode getGeniusAboutLink()}
         */
        const searchResults = await getGeniusSearch(lastFmSimilarTrack.artist.name, lastFmSimilarTrack.name);
        const firstSearchResultGeniusUrl: string | null = searchResults?.[0]?.result?.url ?? null;
        const geniusAboutLink = await getGeniusAboutLink(firstSearchResultGeniusUrl, lastFmSimilarTrack.name);
        const lastFmAboutLink = lastFmSimilarTrack.url;
        /**
         * For (extra) params: Uses same methods for getting user-submitted (Spotify) track details.
         */
        const genres = await getGenres(lastFmSimilarTrack.artist.name, lastFmSimilarTrack.name);
        const spotifyTrackId = getSpotifyTrackId(spotifyLink);
        const spotifyDetails = spotifyTrackId ? await getSpotifyTrackDetails(spotifyTrackId) : null;
        if (spotifyDetails && spotifyDetails.album.release_date) spotifyDetails.album.release_date = setSpotifyReleaseDate(spotifyDetails.album.release_date);
        const numberOfMoodsToGet = 2;
        const inferredMoods = inferMoodsFromGenres(genres, numberOfMoodsToGet);

        // ----- (Last) Convert retrieved data into suitable types for frontend components to render ----- //

        initialRecommendedTracksNew.push({
            // (Basic) Details
            name: lastFmSimilarTrack.name ?? "Unknown track name",
            artist: lastFmSimilarTrack.artist.name ?? "Unknown artist name",
            video: youtubeId ?? null,
            listenAtLinks: {
                spotify: spotifyLink, // Set above
                appleMusic: listenAtLinks?.appleMusic ?? "https://geo.music.apple.com",
                youtubeMusic: listenAtLinks?.youtubeMusic ?? "https://music.youtube.com",
            },
            aboutLinks: {
                genius: geniusAboutLink ?? "https://genius.com",
                lastFm: lastFmAboutLink ?? "https://www.last.fm",
            },
            comments: {
                genius: `${geniusAboutLink}#comments`,
                lastFm: `${lastFmAboutLink}#shoutbox`,
            },
            lyrics: geniusAboutLink ?? "https://genius.com",
            // (Extra) Params
            // // TODO Implement `genreSimilarity`
            // genreSimilarity: null,
            genres: genres ?? null,
            popularity: spotifyDetails?.popularity ?? null,
            releaseDate: spotifyDetails?.album.release_date ?? null,
            moods: inferredMoods ?? null,
        });

        // ----- NOTE (Extra) Prevent error 429 "Too Many Requests" ----- //
        await new Promise((resolve) => {
            // TEST
            const somethingObvious = (Math.random() * 2) | 0;
            console.log(`Delaying... ${somethingObvious == 0 ? "hello" : "everyone"}`);
            // Reference: 1000 ms = 1 s --> 100 ms = 0.1 s
            // Target is ~10 requests per second plus-minus some jitter via `Math.random()`
            setTimeout(resolve, 100 + Math.random() * 100);
        });
    }

    // // TEST
    // for (const initialRecommendedTrack of initialRecommendedTracks) {
    //     console.log(`${initialRecommendedTrack.name}\n${initialRecommendedTrack.popularity}\n${initialRecommendedTrack.releaseDate}\n`);
    // }
    // console.log("[!] ^ from ./src/app/recommendations/[spotifyTrackID]/page.tsx");

    return (
        <TrackRecommendationsClient
            // Format
            submittedTrack={submittedTrack}
            initialRecommendedTracks={initialRecommendedTracksNew}
        />
    );
}
