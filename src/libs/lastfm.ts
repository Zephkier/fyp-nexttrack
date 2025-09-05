import * as cheerio from "cheerio";

/**
 * Returns a string in Last.fm's format. Example:
 *
 * - `"AC/DC"` returns `"AC%252FDC"`
 * - `"Florence + The Machine"` returns `"Florence+%252B+the+Machine"`
 * - `"The Marías"` returns `"The+Mar%25C3%25ADas"`
 *
 * -----
 *
 * Note that Last.fm has inconsistent encoding! Example:
 *
 * - Some special characters (e.g. "/") are encoded **ONCE** (as it should).
 *   - Tested with "AC/DC" when accessing their Last.fm page via browser navigation.
 *   - Source: https://www.last.fm/music/AC%2FDC.
 *
 * - Some special characters (e.g. "+") are encoded **TWICE** (which is weird).
 *   - Tested with "Florence + The Machine" when accessing their Last.fm page via browser navigation.
 *   - Source:
 *     - https://www.last.fm/music/Florence+%252B+the+Machine.
 *     - https://stackoverflow.com/questions/13968282/unknown-characters-252b-in-url.
 *
 * - Some special characters (e.g. "é") are **NOT ENCODED** (at this point, idk what is up...).
 *   - Tested with "The Marías - Déjate Llevar".
 *   - Source: https://www.last.fm/music/The+Marías/_/Déjate+Llevar.
 *
 * # Just encode everything twice!
 * # Last.fm still understands it (thankfully).
 *
 * - Spaces are not encoded.
 *   - Instead, they are replaced with "+".
 */
export function convertToLastFmFormat(incomingString: string): string {
    const encodedOnce = encodeURIComponent(incomingString);
    const encodedTwice = encodeURIComponent(encodedOnce);
    // Spaces went from " " to "%20" to "%2520", which must then be "+"
    const replacedSpace = encodedTwice.replace(/%2520/g, "+");
    return replacedSpace;
}

/**
 * **THIS IS DEPRECATED, USE `webScrapeLastFmGenres()` INSTEAD.**
 * 
 * - The Last.fm API retrieves genres inconsistently.
 * - Despite a track's Last.fm page having genres listed, the API would return an empty array.
 * - Thus, safer to web scrape via `webScrapeLastFmGenres()`.
 * 
 * ---
 * 
 * Last.fm API returns `[]` or an array of objects with `name` and `url` keys. Example:
 *
 * ```js
    [
        { name: 'indie',            url: 'https://www.last.fm/tag/indie'            },
        { name: 'female vocalists', url: 'https://www.last.fm/tag/female+vocalists' },
        { name: 'alternative',      url: 'https://www.last.fm/tag/alternative'      },
        { name: 'indie pop',        url: 'https://www.last.fm/tag/indie+pop'        },
        { name: 'british',          url: 'https://www.last.fm/tag/british'          }
    ]
 * ```
 *
 * ---
 * 
 * Source: https://www.last.fm/api/show/track.getInfo
 */
export async function getLastFmGenres_deprecated(artistName: string, trackName: string) {
    const baseUrl = "http://ws.audioscrobbler.com";
    const method = "track.getInfo"; // Using this method to get more info than ".getTopTags" method
    const apiKey = process.env.LASTFM_API_KEY;
    const artistNameInLastFmFormat = convertToLastFmFormat(artistName);
    const trackNameInLastFmFormat = convertToLastFmFormat(trackName);
    const fullUrl = `${baseUrl}/2.0/?method=${method}&api_key=${apiKey}&artist=${artistNameInLastFmFormat}&track=${trackNameInLastFmFormat}&format=json`;

    const response = await fetch(fullUrl);
    if (!response.ok) return [];

    /**
     * Returns an object with many keys. Example:
     * ```js
        {
            track: {
                name: 'Dog Days Are Over',
                mbid: '52587f93-2a1d-45fb-a8ba-97aafa2c1f28',
                url: 'https://www.last.fm/music/Florence+++The+Machine/_/Dog+Days+Are+Over',
                duration: '0',
                streamable: { '#text': '0', fulltrack: '0' },
                listeners: '2537', // Potential parameter, but Spotify's "popularity" is better
                playcount: '8492', // Potential parameter, but Spotify's "popularity" is better
                artist: {
                    name: 'Florence   The Machine',
                    // Some artists do not have "mbid"!
                    mbid: '5fee3020-513b-48c2-b1f7-4681b01db0c6',
                    url: 'https://www.last.fm/music/Florence+++The+Machine'
                },
                // ----- Normal ----- //
                toptags: { tag: [Array] },
                wiki: {
                    published: '31 Aug 2009, 11:29',
                    summary: `"Dog... Read more on Last.fm</a>.`,
                    content: `"Dog... \n` + '\n' + `A... \n` + '\n' + ... + '... terms may apply.'
                }
                // ----- Abnormal ----- //
                toptags: { tag: [] }
                // *"wiki:" does not exist*
            }
        }
     * ```
     */
    const data = await response.json();
    /**_Same JSDoc as this function._ */
    const genres = data.track.toptags.tag;
    return genres;
}

/**
 * Web scraping returns `[]` or an array of strings. Example:
 * 
 * `["genre1", "genre2"]`
 * 
 * -----
 * 
 * Source:
 * - https://www.last.fm/music/The+Marías/_/Déjate+Llevar                   (via browser navigation)
 * - https://www.last.fm/music/The+Mar%C3%ADas/_/D%C3%A9jate+Llevar         (encoded once)
 * - https://www.last.fm/music/The+Mar%25C3%25ADas/_/D%25C3%25A9jate+Llevar (encoded twice)
 * 
 * In a track's Last.fm page, the HTML element containing genres is:
 * ```html
    <section class="catalogue-tags">
        <ul class="tags-list tags-list--global">
            <li class="tag">
                <a href="/tag/dream+pop">dream pop</a>
            </li>
            <!-- And more `<li>` for each genre -->
        </ul>
    </section>
 * ```
 * 
 * Note that there is a similar section (i.e. artist's tags) that should be avoided:
 * ```html
    <section class="catalogue-tags about-artist-tags">
        <!-- Same as above -->
    </section>
 * ```
 */
export async function webScrapeLastFmGenres(artistName: string, trackName: string) {
    const artistNameInLastFmFormat = convertToLastFmFormat(artistName);
    const trackNameInLastFmFormat = convertToLastFmFormat(trackName);
    const fullUrl = `https://www.last.fm/music/${artistNameInLastFmFormat}/_/${trackNameInLastFmFormat}`;
    try {
        const response = await fetch(fullUrl, {
            // Avoid being detected as a bot TODO Change to "+https://fyp-nexttrack.vercel.app/"
            headers: { "User-Agent": "NextTrack/1.0 (+https://example.com)" },
            cache: "no-store",
        });
        if (!response.ok) return [];
        // Parse HTML using Cheerio
        const html = await response.text();
        const $ = cheerio.load(html);
        // Extract text from specified HTML element, remember to avoid the artist's tags
        const htmlElement1 = "section.catalogue-tags:not(.about-artist-tags)";
        const htmlElement2 = "ul.tags-list";
        const htmlElement3 = "li.tag";
        const htmlElement4 = "a";
        const selector = $(`${htmlElement1} ${htmlElement2} ${htmlElement3} ${htmlElement4}`);
        const genres = selector
            // Must iterate as there are multiple genres
            .map((index, htmlElement) => $(htmlElement).text().trim())
            .get();
        return genres;
    } catch (err) {
        console.error(`[!] ./src/libs/lastfm.ts::webScrapeLastFmGenres():\n${err}`);
        return [];
    }
}

/**
 * Last.fm API returns `[]` or an array of objects with many keys. Example:
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
                {
                    '#text': 'https://lastfm...png',
                    size: 'small'
                },
                // And repeat a few more times
            ]
        },
        // And repeat 99 more times, for a total of 100 elements in this array
    ]
 * ```
 *
 * -----
 * 
 * Source: https://www.last.fm/api/show/track.getSimilar
 * 
 * Note:
 * - If certain tracks return `[]`, but its Last.fm page **HAS** similar tracks (aka. Last.fm API being inconsistent)...
 * - Then replace this function with one that uses web scraping.
 * - But, for now, I have yet to encounter such an issue.
 */
export async function getLastFmSimilarTracks(artistName: string, trackName: string) {
    const baseUrl = "http://ws.audioscrobbler.com";
    const method = "track.getSimilar";
    const apiKey = process.env.LASTFM_API_KEY;
    const artistNameInLastFmFormat = convertToLastFmFormat(artistName);
    const trackNameInLastFmFormat = convertToLastFmFormat(trackName);
    const fullUrl = `${baseUrl}/2.0/?method=${method}&artist=${artistNameInLastFmFormat}&track=${trackNameInLastFmFormat}&api_key=${apiKey}&format=json`;

    const response = await fetch(fullUrl);
    if (!response.ok) return [];

    /**
     * Returns an object of an object. Example:
     * ```js
        {
            similartracks: {
                track: [[Object], ..., [Object]], // Has 100x [Object]
                '@attr': { artist: 'Florence + the Machine', track: 'Dog Days Are Over' }
            }
        }
     * ```
     */
    const data = await response.json();
    /**_Same JSDoc as this function._ */
    const similarTracks = data.similartracks.track;
    return similarTracks;
}

/**
 * Web scraping returns `null` or a string of the YouTube video ID. Example:
 * 
 * `"7ICS45rZsvo"`
 * 
 * -----
 * 
 * Source:
 * - https://www.last.fm/music/The+Marías/_/Déjate+Llevar                   (via browser navigation)
 * - https://www.last.fm/music/The+Mar%C3%ADas/_/D%C3%A9jate+Llevar         (encoded once)
 * - https://www.last.fm/music/The+Mar%25C3%25ADas/_/D%25C3%25A9jate+Llevar (encoded twice)
 * 
 * In a track's Last.fm page, the HTML element containing the YouTube video ID is:
 * ```html
    <a
        id="track-page-video-playlink"
        href="https://www.youtube.com/watch?v=7ICS45rZsvo"
        data-youtube-id="7ICS45rZsvo"
        data-youtube-url="https://www.youtube.com/watch?v=7ICS45rZsvo"
        ...
    ></a>
 * ```
 */
export async function webScrapeLastFmYoutubeId(lastFmUrl: string) {
    try {
        const response = await fetch(lastFmUrl, {
            // Avoid being detected as a bot TODO Change to "+https://fyp-nexttrack.vercel.app/"
            headers: { "User-Agent": "NextTrack/1.0 (+https://example.com)" },
            cache: "no-store",
        });
        if (!response.ok) return null;
        // Parse HTML using Cheerio
        const html = await response.text();
        const $ = cheerio.load(html);
        // Extract text from specified HTML element's (via its "id") attribute
        const htmlElementId = "#track-page-video-playlink";
        const htmlElementAttribute = "data-youtube-id";
        const selector = $(htmlElementId).attr(htmlElementAttribute);
        return selector;
    } catch (err) {
        console.error(`[!] ./src/libs/lastfm.ts::webScrapeLastFmYoutubeId():\n${err}`);
        return null;
    }
}
