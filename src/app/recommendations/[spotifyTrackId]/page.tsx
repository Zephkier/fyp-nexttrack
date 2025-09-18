import type { Metadata } from "next";
import type { lastFmSimilarTrackType } from "@/libs/lastfm";
import type { recommendedTrackType } from "@/ui/components/recommendations/RecommendedTrack";

import TrackRecommendationsClient from "./page.client";

import { getGenres } from "@/libs/genres";
import { inferMoodsFromGenres } from "@/libs/moods";
import { getSpotifyTrackId, getSpotifyTrackDetails, setSpotifyReleaseDate } from "@/libs/spotify";
import { getLastFmSimilarTracks, webScrapeLastFmYoutubeId, webScrapeLastFmListenAtLinks } from "@/libs/lastfm";
import { getGeniusSearch, getGeniusAboutLink } from "@/libs/genius";

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

    // ----- (Last step) Convert and standardise retrieved data into suitable types for frontend components to render ----- //

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
     * Last.fm API returns `[]` or an array of objects.
     * @see {@linkcode getLastFmSimilarTracks()}
     */
    let lastFmSimilarTracks1 = await getLastFmSimilarTracks(artistName, trackName);

    /**
     * Limit number of recommended tracks returned. Max: 100.
     *
     * - Tried working with 100 recommended tracks but it tends to run into "ECONNRESET" error.
     * - Best to work with 50 to 75 recommended tracks.
     *
     * -----
     *
     * TODO
     *
     * - Idea 1: Return max number of recommendations (100) and allow users to browse through via pagination?
     * - Idea 2: Allow users to adjust this value via dropdown box?
     */
    const numberOfRecommendations = 50;
    lastFmSimilarTracks1 = lastFmSimilarTracks1.slice(0, numberOfRecommendations);

    // // TEST Handle cases where there are no recommended tracks.
    // lastFmSimilarTracks1 = [];

    // ----- Get recommended tracks' additional details ----- //

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
            const lastFmAboutLink = lastFmSimilarTrack.url;
            /**
             * Done
             */
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

    /**
     * Convert from Last.fm similar tracks to NextTrack recommended tracks.
     *
     * Bunch of TODOs:
     *
     * - Unsure to set `??` here or within their own functions over at `./src/libs`.
     *
     * - Handle `null` cases such that it displays greyed italic text like for `video`.
     *   - This means handling things like `"Unknown track/artist name"` etc.
     *
     * - Display the actual (about and lyrics) text instead of having a button with its link.
     */
    const initialRecommendedTracks: recommendedTrackType[] = await Promise.all(
        lastFmSimilarTracks2.map(async (lastFmSimilarTrack) => {
            const name = lastFmSimilarTrack?.name ?? "Unknown track name";
            const artist = lastFmSimilarTrack?.artist.name ?? "Unknown artist name";
            const video = lastFmSimilarTrack?.youtubeId ?? null;
            const spotifyLink = lastFmSimilarTrack?.listenAtLinks?.spotify ?? "https://open.spotify.com";
            const appleMusicLink = lastFmSimilarTrack?.listenAtLinks?.appleMusic ?? "https://geo.music.apple.com";
            const youtubeMusicLink = lastFmSimilarTrack?.listenAtLinks?.youtubeMusic ?? "https://music.youtube.com";
            const linkToItsGeniusPage = lastFmSimilarTrack?.aboutLinks?.genius ?? "https://genius.com";
            const linkToItsLastFmPage = lastFmSimilarTrack?.aboutLinks?.lastFm ?? "https://www.last.fm";
            // Use the same methods (that were used above) to get params
            const genres = await getGenres(name, artist);
            const spotifyTrackId = getSpotifyTrackId(spotifyLink);
            const spotifyDetails = spotifyTrackId ? await getSpotifyTrackDetails(spotifyTrackId) : null;
            if (spotifyDetails && spotifyDetails.album.release_date) spotifyDetails.album.release_date = setSpotifyReleaseDate(spotifyDetails.album.release_date);
            const numberOfMoodsToGet = 2;
            const inferredMoods = inferMoodsFromGenres(genres, numberOfMoodsToGet);
            return {
                // (basic) Details
                name: name,
                artist: artist,
                video: video,
                links: {
                    spotify: spotifyLink,
                    appleMusic: appleMusicLink,
                    youtubeMusic: youtubeMusicLink,
                },
                about: {
                    genius: linkToItsGeniusPage,
                    lastFm: linkToItsLastFmPage,
                },
                comments: {
                    genius: `${linkToItsGeniusPage}#comments`,
                    lastFm: `${linkToItsLastFmPage}#shoutbox`,
                },
                lyrics: linkToItsGeniusPage,
                // (extra) Params
                // // TODO Implement `genreSimilarity`
                // genreSimilarity: null,
                genres: genres,
                popularity: spotifyDetails?.popularity ?? null,
                releaseDate: spotifyDetails?.album.release_date ?? null,
                moods: inferredMoods,
            };
        })
    );

    // // TEST
    // for (const initialRecommendedTrack of initialRecommendedTracks) {
    //     console.log(`${initialRecommendedTrack.name}\n${initialRecommendedTrack.popularity}\n${initialRecommendedTrack.releaseDate}\n`);
    // }
    // console.log("[!] ^ from ./src/app/recommendations/[spotifyTrackID]/page.tsx");

    return (
        <TrackRecommendationsClient
            // Format
            submittedTrack={submittedTrack}
            initialRecommendedTracks={initialRecommendedTracks}
        />
    );
}
