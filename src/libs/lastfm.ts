import * as cheerio from "cheerio";

/**
 * Convert (artist and track) names into Last.fm's format.
 *
 * For some reason, Last.fm...
 * - Double-encodes special characters.
 *   - Source: https://stackoverflow.com/questions/13968282/unknown-characters-252b-in-url.
 * - Does not encode spaces.
 *
 * Returns a string in Last.fm's format. Example:
 *
 * - "Florence + The Machine" --> "Florence+%252B+the+Machine"
 * - "Pink + White"           --> "Pink+%252B+White"
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
 * Returns an array of objects with `name` and `url` keys. Example:
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
 */
export async function getLastFmGenres(artistName: string, trackName: string) {
    // From https://www.last.fm/api/show/track.getInfo
    const baseUrl = "http://ws.audioscrobbler.com";
    // Could have used "track.getTopTags", but this offers more info if ever needed
    const method = "track.getInfo";
    const apiKey = process.env.LASTFM_API_KEY;
    const artistNameInLastFmFormat = convertToLastFmFormat(artistName);
    const trackNameInLastFmFormat = convertToLastFmFormat(trackName);
    const fullUrl = `${baseUrl}/2.0/?method=${method}&api_key=${apiKey}&artist=${artistNameInLastFmFormat}&track=${trackNameInLastFmFormat}&format=json`;

    // // TEST
    // // Ensure "Florence + The Machine" --> "Florence%252B+the+Machine
    // // Ensure "Pink + White"           --> "Pink%252B+White"
    // console.log(`[!] @ ./src/libs/lastfm.ts::getLastFmGenres()`);
    // console.log(`original:  ${artistName}`);
    // console.log(`formatted: ${artistNameInLastFmFormat}`);
    // console.log(`fullUrl:   ${fullUrl}`);
    // console.log(`[!]`);

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
                    mbid: '5fee3020-513b-48c2-b1f7-4681b01db0c6',
                    url: 'https://www.last.fm/music/Florence+++The+Machine'
                },
                
                // Toptags normal
                toptags: { tag: [Array] },
                // Toptags abnormal (possibly due to Last.fm double-encoding special characters)
                toptags: { tag: [] }
                
                // Wiki normal
                wiki: {
                    published: '31 Aug 2009, 11:29',
                    summary: `"Dog... Read more on Last.fm</a>.`,
                    content: `"Dog... \n` + '\n' + `A... \n` + '\n' + ... + '... terms may apply.'
                }
                // Wiki abnormal (possibly due to Last.fm double-encoding special characters)
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
 * Returns an array of objects with many keys. Example:
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
        // And repeat 99 more times
    ]
 * ```
 */
export async function getLastFmSimilarTracks(artistName: string, trackName: string) {
    // From https://www.last.fm/api/show/track.getSimilar
    const baseUrl = "http://ws.audioscrobbler.com";
    const method = "track.getSimilar";
    const apiKey = process.env.LASTFM_API_KEY;
    const artistNameInLastFmFormat = convertToLastFmFormat(artistName);
    const trackNameInLastFmFormat = convertToLastFmFormat(trackName);
    const fullUrl = `${baseUrl}/2.0/?method=${method}&artist=${artistNameInLastFmFormat}&track=${trackNameInLastFmFormat}&api_key=${apiKey}&format=json`;

    // // TEST
    // // Ensure "Florence + The Machine" --> "Florence%252B+the+Machine
    // // Ensure "Pink + White"           --> "Pink%252B+White"
    // console.log(`[!] @ ./src/libs/lastfm.ts::getLastFmSimilarTracks()`);
    // console.log(`original:  ${artistName}`);
    // console.log(`formatted: ${artistNameInLastFmFormat}`);
    // console.log(`fullUrl:   ${fullUrl}`);
    // console.log(`[!]`);

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
 * It web scraps and returns the value of `data-youtube-id`. Example:
 * 
 * `"Ch6xdV_ZjdU"`
 */
export async function getLastFmYoutubeId(lastFmUrl: string) {
    try {
        const response = await fetch(lastFmUrl, {
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
