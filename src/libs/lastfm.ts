import * as cheerio from "cheerio";

/**
 * Returns a string in Last.fm's format. Example:
 *
 * - From `"Florence + The Machine"` to `"Florence+%252B+the+Machine"`
 * - From `"The Marías"` to `"The+Mar%25C3%25ADas"`
 *
 * -----
 *
 * Convert (artist or track) names into Last.fm's format.
 *
 * **NOTE THAT LAST.FM HAS INCONSISTENT ENCODING**. Example:
 *
 * - Some special characters (e.g. "+") are encoded **TWICE**.
 *   - Tested with "Florence + The Machine - Dog Days Are Over".
 *   - Tested with "Frank Ocean - Pink + White".
 *   - Source: https://stackoverflow.com/questions/13968282/unknown-characters-252b-in-url.
 *
 * - Some special characters (e.g. "é") are **NOT** encoded at all.
 *   - Tested with "The Marías - Déjate Llevar".
 *   - Should still encode twice as Last.fm still understands it.
 *
 * - Spaces are not encoded.
 *   - Instead, they are replaced with "+".
 */
export function convertToLastFmFormat(name: string): string {
    /**
     * Encode all special characters. Example:
     * - `" "` becomes `"%20"`
     * - `"+"` becomes `"%2B"`
     */
    const encodedOnce = encodeURIComponent(name);
    /**
     * But Last.fm encodes it **AGAIN** for some reason... Example:
     * - `"%20"` becomes `"%2520"`
     * - `"%2B"` becomes `"%252B"`
     */
    const encodedTwice = encodeURIComponent(encodedOnce);
    /**And Last.fm uses `"+"` instead of `"%2520"` to indicate spaces. */
    const lastFmFormat = encodedTwice.replace(/%2520/g, "+");
    /**_Same JSDoc as this function._ */
    return lastFmFormat;
}

/**
 * Returns `[]` or an array of objects with `name` and `url` keys. Example:
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
 * -----
 * 
 * **THIS IS DEPRECATED, USE `webScrapeLastFmGenres()` INSTEAD.**
 * 
 * **LAST.FM API INCONSISTENTLY RETRIEVES GENRES, SOMETIMES RETURNS EMPTY ARRAY.**
 * 
 * Source: https://www.last.fm/api/show/track.getInfo
 */
export async function getLastFmGenres_deprecated(artistName: string, trackName: string) {
    const baseUrl = "http://ws.audioscrobbler.com";
    const method = "track.getInfo"; // Could have used "track.getTopTags", but this offers more info if ever needed
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
                listeners: '2537',
                playcount: '8492',
                artist: {
                    name: 'Florence   The Machine',
                    // Some artists do not have "mbid"!
                    mbid: '5fee3020-513b-48c2-b1f7-4681b01db0c6',
                    url: 'https://www.last.fm/music/Florence+++The+Machine'
                },
                // ----- Note ----- //
                // Toptags normal
                toptags: { tag: [Array] },
                // Toptags abnormal
                toptags: { tag: [] }
                // Wiki normal
                wiki: {
                    published: '31 Aug 2009, 11:29',
                    summary: `"Dog... Read more on Last.fm</a>.`,
                    content: `"Dog... \n` + '\n' + `A... \n` + '\n' + ... + '... terms may apply.'
                }
                // Wiki abnormal
                // *nothing*
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
 * Web scrapes and returns `[]` or an array of strings within `<a>`. Example:
 * 
 * `["genre1", "genre2"]`
 * 
 * -----
 * 
 * Source:
 * - https://www.last.fm/music/The+Marías/_/Déjate+Llevar                   (via navigating website)
 * - https://www.last.fm/music/The+Mar%C3%ADas/_/D%C3%A9jate+Llevar         (encoded once)
 * - https://www.last.fm/music/The+Mar%25C3%25ADas/_/D%25C3%25A9jate+Llevar (encoded twice)
 * 
 * On Last.fm's page, the HTML element containing genres is:
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
            // Avoid being detected as a bot
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
            // Ensure to iterate as there are multiple genres
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
            image: [ [Object], [Object], [Object], [Object], [Object], [Object] ]
        },
        // And repeat 99 more times, for a total of 100 elements in this array
    ]
 * ```
 *
 * -----
 * 
 * Source: https://www.last.fm/api/show/track.getSimilar
 * 
 * Uses Last.fm API to retrieve similar tracks.
 * 
 * Note:
 * - If certain tracks return no similar tracks (i.e. `[]`), but its Last.fm page **HAS** similar tracks...
 * - Then replace this function with one that uses web scraping.
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
 * Web scrapes and returns the value of `data-youtube-id`. Example:
 * 
 * `"Ch6xdV_ZjdU"`
 * 
 * -----
 * 
 * On Last.fm's page, the HTML element containing its YouTube video is:
 * ```html
    <a
        id="track-page-video-playlink"
        href="https://www.youtube.com/watch?v=Ch6xdV_ZjdU"
        data-youtube-id="Ch6xdV_ZjdU"
        data-youtube-url="https://www.youtube.com/watch?v=Ch6xdV_ZjdU"
        ...
    ></a>
 * ```
 *
 */
export async function webScrapeLastFmYoutubeId(fullUrl: string) {
    try {
        const response = await fetch(fullUrl, {
            // Avoid being detected as a bot
            headers: { "User-Agent": "NextTrack/1.0 (+https://example.com)" },
            cache: "no-store",
        });
        if (!response.ok) return null;

        const html = await response.text();
        const $ = cheerio.load(html);

        // Select the HTML element via its "id" attribute, and then the desired attribute (i.e. data-youtube-id)
        const youtubeId = $("#track-page-video-playlink").attr("data-youtube-id");

        return youtubeId;
    } catch {
        return null;
    }
}
