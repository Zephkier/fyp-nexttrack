import type { Metadata } from "next";

import Hero from "@/ui/components/Hero";
import SubmittedTrackDetails from "@/ui/components/SubmittedTrackDetails";
import CustomiseRecommendations from "@/ui/components/CustomiseRecommendations";
import RecommendedTracks from "@/ui/components/RecommendedTracks";

import { getSpotifyTrackDetails } from "@/libs/spotify";
import { webScrapeLastFmGenres, getLastFmSimilarTracks, webScrapeLastFmYoutubeId, webScrapeLastFmListenAtLinks } from "@/libs/lastfm";
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

    // ----- 1b. Get Last.fm/Genius genres (they call it "tags" but we shall call it "genres") ----- //

    /**
     * Choices for getting genres:
     * - Spotify API           (but it has no genre-related data)
     * - Last.fm API           (but it may return different genres compared to its actual Last.fm page; inconsistent)
     * - Last.fm web scrape    (but it may return only 1 genre, which is insufficient)
     * - Genius API            (but it has no genre-related data)
     * - Genius web scrape     (last resort)
     * - `["no genres found"]` (fail-safe)
     *
     * -----
     *
     * Tested with "Dimitri Vegas & Like Mike - Thank You (Not So Bad)"
     * where Last.fm API and web scrape returns only:
     *
     * `["dimitri vegas and like mike"]`.
     *
     * Source (note how Genius page has more informative genres):
     * - https://www.last.fm/music/Dimitri+Vegas+%2526+Like+Mike/_/Thank+You+(Not+So+Bad)
     * - https://genius.com/Dimitri-vegas-and-like-mike-tiesto-dido-and-w-w-thank-you-not-so-bad-lyrics
     */

    // If nothing in Spotify API, and inconsistent Last.fm API, then use Last.fm web scrape
    let retrievedGenres = await webScrapeLastFmGenres(artistName, trackName);
    // If Last.fm web scrapes insufficient genres, and nothing in Genius API, then use Genius web scrape
    if (retrievedGenres.length < 2) {
        const searchResults = await getGeniusSearch(artistAndTrackName);
        const firstItemGeniusUrl = searchResults[0].result.url;
        retrievedGenres = await webScrapeGeniusGenres(firstItemGeniusUrl);
    }
    // If Genius web scrapes insufficient genres, then set fail-safe
    if (retrievedGenres.length < 2) retrievedGenres = ["no genres found"];

    // ----- 1c. Get (custom-created) moods (that are inferred from genres) ----- //

    /**
     * Must "custom-create" and "infer" because:
     * - Spotify API's "audio features" and "audio analysis" methods are deprecated (would've been so useful...)
     * - Last.fm API retrieves nothing useful
     * - Genius API retrieves nothing useful
     */

    const numberOfMoodsToGet = 2;
    const inferredMoods = inferMoodsFromGenres(retrievedGenres, numberOfMoodsToGet);

    // ----- 1z. Convert the retrieved data into something suitable (i.e. its type) for frontend components ----- //

    const submittedTrack = {
        name: spotifyTrackDetails.name,
        artists: spotifyTrackDetails.artists.map((artist) => artist.name),
        releaseDate: spotifyTrackDetails.album.release_date,
        genres: retrievedGenres,
        popularity: spotifyTrackDetails.popularity,
        moods: inferredMoods,
    };

    // -------------------------------------------------- //
    // ----- 3. Get values for "Recommended Tracks" ----- //
    // -------------------------------------------------- //

    // ----- 3a. Get recommended tracks ----- //

    // NOTE This is not so urgent, work on others below first
    // NOTE Current recommendations are placeholders, in fact, it simply uses Last.fm API's "similar tracks" method
    // TODO Actual recommendations must be dynamic and based on "submittedTrack.genres (similarity)", ".popularity", and ".moods"

    /**
     * This is either `["No similar tracks found"]` or the same as `getLastFmSimilarTracks()`:
     * 
     * ```js
        [
            {
                name: "You've Got the Love",
                playcount: 10170816,
                match: 1,
                url: 'https://www.last.fm/music/Florence+%252B+the+Machine/_/You%27ve+Got+the+Love',
                streamable: { '#text': '0', fulltrack: '0' },
                duration: 164,
                artist: {
                    name: 'Florence + the Machine',
                    mbid: '5fee3020-513b-48c2-b1f7-4681b01db0c6',
                    url: 'https://www.last.fm/music/Florence+%252B+the+Machine'
                },
                image: [
                    { '#text': 'https://lastfm...png', size: 'small' },
                    // And repeat a few more times
                ]
            },
            // And repeat 99 more times, for a total of 100 elements in this array
        ]
     * ```
     */
    let lastFmSimilarTracks1 = await getLastFmSimilarTracks(artistName, trackName);
    // Limit number of results
    lastFmSimilarTracks1 = lastFmSimilarTracks1
        // TODO Allow user to adjust this value via page navigation?
        .slice(0, 10);
    // TODO Handle cases where there no similar tracks (so far, while testing, every track HAS some similar tracks)
    // lastFmSimilarTracks1 = [];
    if (lastFmSimilarTracks1.length == 0) lastFmSimilarTracks1 = ["No similar tracks found"];

    // ----- 3b. Get recommended tracks' additional details ----- //

    /**
     * From this point onwards, the Spotify/Last.fm/Genius APIs are unable to retrieve anything useful.
     * Thus, web scraping is used to get more details.
     */

    /**
     * This is the same as `lastFmSimilarTracks1` but with additional keys:
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
            // ----- 3b.ii. Additional detail: Links for "Listen at" buttons ----- //
            const links = await webScrapeLastFmListenAtLinks(similarTrack.url);
            return { ...similarTrack, youtubeId, links };
        })
    );

    // ----- 3y. Get xxx TODO Work on replacing placeholders below ----- //

    // x

    // ----- 3z. Convert the retrieved data into something suitable for the website ----- //
    const recommendedTracks = lastFmSimilarTracks2.map((recommendedTrack) => ({
        name: recommendedTrack.name,
        artists: [recommendedTrack.artist.name],
        video: recommendedTrack.youtubeId, // May pass in a `null`
        links: {
            spotify: recommendedTrack.links.spotify,
            appleMusic: recommendedTrack.links.appleMusic,
            youtubeMusic: recommendedTrack.links.youtubeMusic,
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
