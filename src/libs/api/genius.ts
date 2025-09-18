import * as cheerio from "cheerio";

/**
 * Helper function returns a string that has been encoded as per **Genius URL's** format. Example:
 *
 * - If string is `"Joey Bada$$ - Killuminati (feat. Capital STEEZ)"`, \
 *   then its URL is `"https://genius.com/Joey-bada-killuminati-lyrics"`
 *
 * - If string is `"Sherane a.k.a Master Splinter’s Daughter"` (note its **special** single-quote (i.e. ’)), \
 *   then its URL is `"https://genius.com/Kendrick-lamar-sherane-aka-master-splinters-daughter-lyrics"`
 *
 * - If string is `"You've Got the Love"` , \
 *   then its URL is `"https://genius.com/Florence-the-machine-youve-got-the-love-lyrics"`
 */
function convertToGeniusUrlFormat(incomingString: string) {
    return (
        incomingString
            .toLowerCase()
            // "(" and ")" are excluded because of `.split()` in the next line
            // Special single-quote (i.e. ’) is included
            .replace(/[`~!@#$%^&*-_=+[{\]\}\\\|;:'’",<.>\/\?]/g, "")
            .split("(")[0]
            .trim()
            .replaceAll(" ", "-")
    );
}

/**
 * Helper function returns a string that has been encoded as per **Genius HTML page's** format. Example:
 *
 * - If string is `"Like A G6 (with Naeleck)"`, \
 *   then its HTML text is `"Like A G6"`
 *
 * Unsure if need to enclose strings in double-quotes or not. Example:
 *
 * ```js
 *  incomingString = `"${incomingString}"`;
 * ```
 */
function convertToGeniusHtmlFormat(incomingString: string) {
    return (
        incomingString
            // Format
            .split("(")[0]
            .trim()
    );
}

/**
 * Helper function returns `{}` or an object with `Authorization` key for Genius API.
 *
 * -----
 *
 * Source: https://docs.genius.com/#/authentication-h1
 */
export function authHeaders(): HeadersInit {
    const clientAccessToken = process.env.GENIUS_CLIENT_ACCESS_TOKEN;
    if (!clientAccessToken) {
        console.error('[!] ./src/libs/api/genius.ts::authHeaders():\nNo "GENIUS_CLIENT_ACCESS_TOKEN"');
        return {};
    }
    return { Authorization: `Bearer ${clientAccessToken}` };
}

/**
 * Genius API returns `null` or an array of objects. Example:
 *
 * ```js
 * [
 *     {
 *         highlights: [],
 *         index: 'song',
 *         type: 'song',
 *         result: {
 *             annotation_count: 0,
 *             api_path: '/songs/9268740',
 *             artist_names: 'Dimitri Vegas & Like Mike, Tiësto, Dido & W&W',
 *             full_title: 'Thank You (Not So Bad) by Dimitri Vegas & Like Mike, Tiësto, Dido & W&W',
 *             header_image_thumbnail_url: 'https://images.genius.com/15b2724af3f11162581a5a417bc29c0e.300x300x1.png',
 *             header_image_url: 'https://images.genius.com/15b2724af3f11162581a5a417bc29c0e.1000x1000x1.png',
 *             id: 9268740,
 *             lyrics_owner_id: 3499648,
 *             lyrics_state: 'complete',
 *             path: '/Dimitri-vegas-and-like-mike-tiesto-dido-and-w-w-thank-you-not-so-bad-lyrics',
 *             primary_artist_names: 'Dimitri Vegas & Like Mike, Tiësto, Dido & W&W',
 *             pyongs_count: null,
 *             relationships_index_url: 'https://genius.com/Dimitri-vegas-and-like-mike-tiesto-dido-and-w-w-thank-you-not-so-bad-sample',
 *             release_date_components: { year: 2023, month: 12, day: 1 },
 *             release_date_for_display: 'December 1, 2023',
 *             release_date_with_abbreviated_month_for_display: 'Dec. 1, 2023',
 *             song_art_image_thumbnail_url: 'https://images.genius.com/15b2724af3f11162581a5a417bc29c0e.300x300x1.png',
 *             song_art_image_url: 'https://images.genius.com/15b2724af3f11162581a5a417bc29c0e.1000x1000x1.png',
 *             stats: { unreviewed_annotations: 0, hot: false, pageviews: 11598 },
 *             title: 'Thank You (Not So Bad)',
 *             title_with_featured: 'Thank You (Not So Bad)',
 *             url: 'https://genius.com/Dimitri-vegas-and-like-mike-tiesto-dido-and-w-w-thank-you-not-so-bad-lyrics',
 *             featured_artists: [],
 *             primary_artist: {
 *                 api_path: '/artists/350871',
 *                 header_image_url: 'https://images.genius.com/5c42e339018bd297b29c3382c6d1a4f5.640x640x1.jpg',
 *                 id: 350871,
 *                 image_url: 'https://images.genius.com/d0c59ee76ab7d6fc786bb5027076175b.1000x1000x1.jpg',
 *                 is_meme_verified: false,
 *                 is_verified: false,
 *                 name: 'Dimitri Vegas & Like Mike',
 *                 url: 'https://genius.com/artists/Dimitri-vegas-and-like-mike'
 *             },
 *             primary_artists: [
 *                 [Object],
 *                 // Repeat `[Object]` for however many `primary_artists` there are
 *             ]
 *         }
 *     },
 *     // Repeat `{}` for however many search results there are
 * ]
 * ```
 *
 * -----
 *
 * Source: https://docs.genius.com/#/search-h2
 *
 * View provided example:
 *
 * - Uncomment `console.log()` lines.
 * - Submit "Dimitri Vegas & Like Mike - Thank You (Not So Bad)" \
 *   via https://open.spotify.com/track/456WNXWhDwYOSf5SpTuqxd?si=e9a5cc69ef9b4ffe \
 *   as NextTrack's user-submitted track.
 */
export async function getGeniusSearch(artistName: string, trackName: string) {
    // The API (and even via manual browser navigation) works best when track name is minimal
    const minimalTrackName = convertToGeniusHtmlFormat(trackName);
    const artistAndTrackName = `${artistName} - ${minimalTrackName}`;
    const encodedArtistAndTrackName = encodeURIComponent(artistAndTrackName);
    const geniusUrl = `https://api.genius.com/search?q=${encodedArtistAndTrackName}`;
    const response = await fetch(geniusUrl, {
        headers: authHeaders(),
        // Next.js has built-in caching, current implementation re-validates cache after 24 hours
        // 60 seconds * 60 minutes * 24 hours = 86400 seconds
        next: { revalidate: 86400 },
    });
    if (!response.ok) {
        console.error(`[!] ./src/libs/api/genius.ts::getGeniusSearch():\nstatus: ${response.status}\nstatusText: ${response.statusText}`);
        return null;
    }
    const data: {
        meta: { status: number };
        response: {
            hits: {
                highlights: [];
                index: string;
                type: string;
                // Repeat `{}` for however many search results there are
                result: { url: string };
            }[];
        };
    } = await response.json();
    const searchResults = data.response.hits;
    // // TEST Ensure that the first search result is usually correct
    // console.log(`Searched for: ${artistAndTrackName}`);
    // console.log(`Encoded into: ${encodedArtistAndTrackName}`);
    // console.log(`API endpoint: ${geniusUrl}`);
    // console.log();
    // for (const searchResult of searchResults) {
    //     console.log(searchResult.result.primary_artist.name);
    //     console.log(searchResult.result.title);
    //     console.log(`id: ${searchResult.result.id}, url: ${searchResult.result.url}`);
    //     console.log();
    // }
    // console.log("[!] ^ from ./src/libs/api/genius.ts::getGeniusSearch()");
    // console.log();
    return searchResults;
}

/**
 * # Deprecated because this Genius API endpoint has no genre-related data.
 *
 * -----
 *
 * Genius API returns an object of an object. Example:
 *
 * ```js
 * {
 *     song: {
 *         annotation_count: 0,
 *         api_path: '/songs/9268740',
 *         apple_music_id: '1716922911',
 *         apple_music_player_url: 'https://genius.com/songs/9268740/apple_music_player',
 *         artist_names: 'Dimitri Vegas & Like Mike, Tiësto, Dido & W&W',
 *         description: { dom: [Object] },
 *         embed_content: "<div ...>...</script>",
 *         full_title: 'Thank You (Not So Bad) by Dimitri Vegas & Like Mike, Tiësto, Dido & W&W',
 *         header_image_thumbnail_url: 'https://images.genius.com/15b2724af3f11162581a5a417bc29c0e.300x300x1.png',
 *         header_image_url: 'https://images.genius.com/15b2724af3f11162581a5a417bc29c0e.1000x1000x1.png',
 *         id: 9268740,
 *         language: 'en',
 *         lyrics_owner_id: 3499648,
 *         lyrics_state: 'complete',
 *         path: '/Dimitri-vegas-and-like-mike-tiesto-dido-and-w-w-thank-you-not-so-bad-lyrics',
 *         primary_artist_names: 'Dimitri Vegas & Like Mike, Tiësto, Dido & W&W',
 *         pyongs_count: null,
 *         recording_location: null,
 *         relationships_index_url: 'https://genius.com/Dimitri-vegas-and-like-mike-tiesto-dido-and-w-w-thank-you-not-so-bad-sample',
 *         release_date: '2023-12-01',
 *         release_date_for_display: 'December 1, 2023',
 *         release_date_with_abbreviated_month_for_display: 'Dec. 1, 2023',
 *         song_art_image_thumbnail_url: 'https://images.genius.com/15b2724af3f11162581a5a417bc29c0e.300x300x1.png',
 *         song_art_image_url: 'https://images.genius.com/15b2724af3f11162581a5a417bc29c0e.1000x1000x1.png',
 *         stats: {
 *             accepted_annotations: 0,
 *             contributors: 11,
 *             iq_earners: 11,
 *             transcribers: 1,
 *             unreviewed_annotations: 0,
 *             verified_annotations: 0,
 *             hot: false,
 *             pageviews: 11598
 *         },
 *         title: 'Thank You (Not So Bad)',
 *         title_with_featured: 'Thank You (Not So Bad)',
 *         url: 'https://genius.com/Dimitri-vegas-and-like-mike-tiesto-dido-and-w-w-thank-you-not-so-bad-lyrics',
 *         current_user_metadata: {
 *             permissions: [Array],
 *             excluded_permissions: [Array],
 *             interactions: [Object],
 *             relationships: {},
 *             iq_by_action: {}
 *         },
 *         song_art_primary_color: '#fc3c44',
 *         song_art_secondary_color: '#6b1c23',
 *         song_art_text_color: '#fff',
 *         album: {
 *             api_path: '/albums/1177323',
 *             cover_art_url: 'https://images.genius.com/856c67f3efd17070f507a719d9cec9cc.1000x1000x1.png',
 *             full_title: 'BRAVO Hits, Vol. 125 by Bravo Hits',
 *             id: 1177323,
 *             name: 'BRAVO Hits, Vol. 125',
 *             primary_artist_names: 'Bravo Hits',
 *             release_date_for_display: 'April 26, 2024',
 *             url: 'https://genius.com/albums/Bravo-hits/Bravo-hits-vol-125',
 *             artist: [Object],
 *             primary_artists: [Array]
 *         },
 *         custom_performances: [ [Object], ..., [Object] ],
 *         description_annotation: {
 *             _type: 'referent',
 *             annotator_id: 18337684,
 *             annotator_login: 'shark',
 *             api_path: '/referents/35093215',
 *             classification: 'needs_exegesis',
 *             fragment: 'Thank You (Not So Bad)',
 *             id: 35093215,
 *             is_description: true,
 *             path: '/35093215/Dimitri-vegas-and-like-mike-tiesto-dido-and-w-w-thank-you-not-so-bad/Thank-you-not-so-bad',
 *             range: [Object],
 *             song_id: 9268740,
 *             url: 'https://genius.com/35093215/Dimitri-vegas-and-like-mike-tiesto-dido-and-w-w-thank-you-not-so-bad/Thank-you-not-so-bad',
 *             verified_annotator_ids: [],
 *             annotatable: [Object],
 *             annotations: [Array]
 *         },
 *         featured_artists: [],
 *         lyrics_marked_complete_by: { Object containing user's info },
 *         lyrics_marked_staff_approved_by: { Object containing user's info },
 *         media: [ [Object] ],
 *         primary_artist: {
 *             api_path: '/artists/350871',
 *             header_image_url: 'https://images.genius.com/5c42e339018bd297b29c3382c6d1a4f5.640x640x1.jpg',
 *             id: 350871,
 *             image_url: 'https://images.genius.com/d0c59ee76ab7d6fc786bb5027076175b.1000x1000x1.jpg',
 *             is_meme_verified: false,
 *             is_verified: false,
 *             name: 'Dimitri Vegas & Like Mike',
 *             url: 'https://genius.com/artists/Dimitri-vegas-and-like-mike'
 *         },
 *         primary_artists: [ [Object], ..., [Object] ],
 *         producer_artists: [ [Object], ..., [Object] ],
 *         song_relationships: [ [Object], ..., [Object] ],
 *         translation_songs: [ [Object] ],
 *         verified_annotations_by: [],
 *         verified_contributors: [],
 *         verified_lyrics_by: [],
 *         writer_artists: [ [Object], ..., [Object] ],
 *     }
 * }
 * ```
 *
 * ---
 *
 * Source: https://docs.genius.com/#/songs-h2
 *
 * View provided example:
 *
 * - Uncomment `console.log()` lines.
 * - Submit "Dimitri Vegas & Like Mike - Thank You (Not So Bad)" \
 *   via https://open.spotify.com/track/456WNXWhDwYOSf5SpTuqxd?si=e9a5cc69ef9b4ffe \
 *   as NextTrack's user-submitted track.
 */
export async function getGeniusSong_deprecated(id: number) {
    const geniusUrl = `https://api.genius.com/songs/${id}`;
    const response = await fetch(geniusUrl, {
        headers: authHeaders(),
        // Next.js has built-in caching, current implementation re-validates cache after 24 hours
        // 60 seconds * 60 minutes * 24 hours = 86400 seconds
        next: { revalidate: 86400 },
    });
    if (!response.ok) {
        console.error(`[!] ./src/libs/api/genius.ts::getGeniusSong_deprecated():\nstatus: ${response.status}\nstatusText: ${response.statusText}`);
        return null;
    }
    /**
     * Returns an object of objects. Example:
     *
     * ```js
     * {
     *     meta: { status: 200 },
     *     response: { song: { Object } }
     * }
     * ```
     */
    // const data = await response.json();
    // // TEST
    // console.log(data.response);
    // console.log("[!] ^ from ./src/libs/api/genius.ts::getGeniusSong_deprecated()");
}

/**
 * Web scraping Genius page returns `[]` or an array of strings. Example:
 *
 * ```js
 * [ 'electronic', 'pop', ... ]
 * ```
 *
 * ---
 *
 * In a track's Genius page, the HTML element containing genres is:
 *
 * ```html
 * <div class="SongTags__Container-sc-b55131f0-1 SEhjw">
 *     <a class="SongTags__Tag-sc-b55131f0-2 hYXsrC" ...>Electronic</a>
 *     <a class="SongTags__Tag-sc-b55131f0-2 bZuDYa" ...>EDM</a>
 * </div>
 *
 * <!--
 * The same weird strings appear consistently across different tracks:
 * - "b55131f0-1 SEhjw"
 * - "b55131f0-2 hYXsrC"
 * - "b55131f0-2 bZuDYa"
 * -->
 * ```
 *
 * -----
 *
 * Source: https://genius.com/Dimitri-vegas-and-like-mike-tiesto-dido-and-w-w-thank-you-not-so-bad-lyrics
 *
 * View provided example:
 *
 * - Uncomment `console.log()` lines.
 * - Submit "Dimitri Vegas & Like Mike - Thank You (Not So Bad)" \
 *   via https://open.spotify.com/track/456WNXWhDwYOSf5SpTuqxd?si=e9a5cc69ef9b4ffe \
 *   as NextTrack's user-submitted track.
 */
export async function webScrapeGeniusGenres(geniusUrl: string) {
    try {
        const response = await fetch(geniusUrl, {
            headers: { "User-Agent": "NextTrack/1.0 (+https://example.com)" },
            // Next.js has built-in caching, current implementation re-validates cache after 24 hours
            // 60 seconds * 60 minutes * 24 hours = 86400 seconds
            next: { revalidate: 86400 },
        });
        if (!response.ok) {
            console.error(`[!] ./src/libs/api/genius.ts::webScrapeGeniusGenres():\nstatus: ${response.status}\nstatusText: ${response.statusText}`);
            return [];
        }
        // Parse HTML using Cheerio
        const html = await response.text();
        const $ = cheerio.load(html);
        // Extract specified HTML element's text
        const htmlElement1 = "div.SongTags__Container-sc-b55131f0-1";
        const htmlElement2 = "a.SongTags__Tag-sc-b55131f0-2";
        const selector = $(`${htmlElement1} ${htmlElement2}`);
        const genres = selector
            // Must iterate as there are multiple genres
            .map((index, htmlElement) => $(htmlElement).text().trim().toLowerCase())
            .get();
        // // TEST Ensure that genres retrieved are displayed on NextTrack
        // console.log(genres);
        // console.log("[!] ^ from ./src/libs/api/genius.ts::webScrapeGeniusGenres()");
        return genres;
    } catch (err) {
        console.error(`[!] ./src/libs/api/genius.ts::webScrapeGeniusGenres():\n${err}`);
        return [];
    }
}

/**
 * Genius API and web scraping Genius page returns `null` or a string. Example:
 *
 * ```js
 *  "https://genius.com/Timmy-trumpet-and-poltergst-like-a-g6-lyrics"
 * ```
 *
 * -----
 *
 * 1. If the incoming `geniusUrl` via Genius API is **correct**, then **return** it.
 *
 *    - _you may stop reading this JSDoc :)_
 *
 * 2. If the incoming `geniusUrl` via Genius API is **wrong**, then **access and web scrape** the (wrong) page nonetheless. \
 *    This is because it may be the **one and only** `geniusUrl` available.
 *
 *    - _you should continue reading this JSDoc :(_
 *
 * In the (wrong) Genius page, the HTML element containing the correct URL has text that matches the track's name:
 *
 * ```html
 * <!-- Example 1 -->
 * <a href="https://genius.com/Timmy-trumpet-and-poltergst-like-a-g6-lyrics" ...>
 * "Like A G6"
 * </a>
 * ```
 *
 * -----
 *
 * Source to view provided example:
 *
 * - Uncomment `console.log()` lines.
 * - Submit "Dimitri Vegas & Like Mike - Thank You (Not So Bad)" \
 *   via https://open.spotify.com/track/456WNXWhDwYOSf5SpTuqxd?si=e9a5cc69ef9b4ffe \
 *   as NextTrack's user-submitted track.
 * - Access https://genius.com/Genius-may-2024-singles-release-calendar-annotated \
 *   and `CTRL + F` "Like A G6".
 *
 * -----
 *
 * Explanation:
 *
 * 1. FIXME
 *
 * 2. Test via the following code (in `./src/app/recommendations/[spotifyTrackId]/page.tsx`):
 *
 * ```js
 * const demoWrong1 = "Timmy Trumpet - Like A G6 (with Naeleck)";
 * const demoWrong2 = "Alesso - I Like It (with Nate Smith)";
 * if (artistAndTrackName == demoWrong1 || artistAndTrackName == demoWrong2) {
 *     console.log(`Searching for: ${artistAndTrackName}`);
 *     console.log("Results' URL:");
 *     for (const searchResult of searchResults) {
 *         console.log(searchResult.result.url);
 *     }
 *     console.log();
 * }
 * ```
 *
 * 3. Note the console output:
 *
 * ```text
 * Searching for: Timmy Trumpet - Like A G6 (with Naeleck)
 * Results' URL:
 * https://genius.com/Genius-may-2024-singles-release-calendar-annotated
 *
 * Searching for: Alesso - I Like It (with Nate Smith)
 * Results' URL:
 * https://genius.com/Genius-july-2024-singles-release-calendar-annotated
 * https://genius.com/Genius-august-2024-singles-release-calendar-annotated
 * ...
 * ```
 */
export async function getGeniusAboutLink(geniusUrl: string | null, trackName: string) {
    if (!geniusUrl) return null;

    // ----- Genius URLs that are correct: the URLs are already the "about" link, so just return them ----- //

    const similarTrackNameInUrlFormat = convertToGeniusUrlFormat(trackName);
    const isTrackNameInUrl = geniusUrl.includes(similarTrackNameInUrlFormat);
    // // TEST
    // console.log(`Track name before:       ${trackName}`);
    // console.log(`Track name after :       ${similarTrackNameInUrlFormat}`);
    // console.log(`Its Genius URL from API: ${geniusUrl}`);
    // console.log(`Is track name in URL?    ${isTrackNameInUrl}`);
    // console.log("[!] ^ from ./src/libs/api/genius.ts::getGeniusAboutLink()");
    // console.log();
    if (isTrackNameInUrl) return geniusUrl;

    // ----- Genius URLs that are wrong: find track's name in current Genius page, return matching text's `href` link ----- //

    // NOTE The track's name is usually present even in the wrong Genius page
    const similarTrackNameInHtmlFormat = convertToGeniusHtmlFormat(trackName);

    // TODO Modularise into its own function
    try {
        const response = await fetch(geniusUrl, {
            headers: { "User-Agent": "NextTrack/1.0 (+https://example.com)" },
            // Next.js has built-in caching, current implementation re-validates cache after 24 hours
            // 60 seconds * 60 minutes * 24 hours = 86400 seconds
            next: { revalidate: 86400 },
        });
        if (!response.ok) {
            console.error(`[!] ./src/libs/api/genius.ts::getGeniusAboutLink():\nstatus: ${response.status}\nstatusText: ${response.statusText}`);
            return null;
        }
        // Parse HTML using Cheerio
        const html = await response.text();
        const $ = cheerio.load(html);
        // Extract specified HTML element's attribute's text
        const htmlElement = "a";
        const htmlElementAttribute = "href";
        const selector = $(htmlElement);
        const matchingHtmlElement = selector
            // Get the element whose text matches with the track's name
            .filter((index, element) => {
                const htmlElementText = $(element).text();
                const isMatching = htmlElementText.includes(similarTrackNameInHtmlFormat);
                return isMatching;
            })
            // NOTE The first matching element is usually correct
            .first();
        const correctGeniusUrl = matchingHtmlElement.attr(htmlElementAttribute);
        // // TEST
        // console.log(`Track name before:       ${trackName}`);
        // console.log(`Track name after :       ${similarTrackNameInUrlFormat}`);
        // console.log(`Its Genius URL from API: ${geniusUrl}`);
        // console.log(`Is track name in URL?    ${isTrackNameInUrl}`);
        // console.log("So...");
        // console.log(`In URL, search for this track name: ${similarTrackNameInHtmlFormat}`);
        // console.log(`The matching HTML element's text:   ${matchingHtmlElement.text() ?? null}`);
        // console.log(`Its Genius URL this time:           ${correctGeniusUrl}`);
        // console.log("[!] ^ from ./src/libs/api/genius.ts::getGeniusAboutLink()");
        // console.log();
        return correctGeniusUrl ?? null;
    } catch (err) {
        console.error(`[!] ./src/libs/api/genius.ts::getGeniusAboutLink():\n${err}`);
        return null;
    }
}
