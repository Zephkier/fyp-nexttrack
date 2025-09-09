import * as cheerio from "cheerio";

/**
 * Helper function returns a string that has been encoded twice as per Last.fm's format. Example:
 *
 * - Input: `"AC/DC"` - Output: `"AC%252FDC"`
 * - Input: `"The Marías"` - Output: `"The+Mar%25C3%25ADas"`
 * - Input: `"Florence + The Machine"` - Output: `"Florence+%252B+the+Machine"`
 *
 * -----
 *
 * Note that Last.fm has inconsistent encoding! Example:
 *
 * - Some special characters (e.g. "/") are encoded **ONCE** - as it should.
 *   - Tested with "AC/DC" when accessing their Last.fm page via manual browser navigation.
 *   - Source: https://www.last.fm/music/AC%2FDC
 *
 * - Some special characters (e.g. "+") are encoded **TWICE** - which is weird.
 *   - Tested with "Florence + The Machine" when accessing their Last.fm page via manual browser navigation.
 *   - Source:
 *     - https://www.last.fm/music/Florence+%252B+the+Machine
 *     - https://stackoverflow.com/questions/13968282/unknown-characters-252b-in-url
 *
 * - Some special characters (e.g. "é") are **NOT ENCODED** - at this point, idk what is up...
 *   - Tested with "The Marías - Déjate Llevar".
 *   - Source: https://www.last.fm/music/The+Marías/_/Déjate+Llevar
 *
 * **Just encode everything twice!** Last.fm still understands it (thankfully).
 *
 * - Spaces are not encoded.
 *   - Instead, they are replaced with "+".
 */
export function convertToLastFmFormat(incomingString: string) {
    const encodedOnce = encodeURIComponent(incomingString);
    const encodedTwice = encodeURIComponent(encodedOnce);
    // Spaces went from " " to "%20" to "%2520", which must then be "+"
    const replacedSpace = encodedTwice.replace(/%2520/g, "+");
    return replacedSpace;
}

/**
 * Last.fm API returns `[]` or an array of objects. Example:
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
 * - Last.fm API may return 0 genres (i.e. `[]`) even if its Last.fm page has genres listed.
 * 
 * -----
 * 
 * Source: https://www.last.fm/api/show/track.getInfo
 * 
 * View various outputs (ensure to uncomment `console.log()` lines):
 * 
 * - View provided example:
 *   - Submit "Florence + The Machine - Dog Days Are Over" \
 *     via https://open.spotify.com/track/456WNXWhDwYOSf5SpTuqxd?si=e9a5cc69ef9b4ffe \
 *     as NextTrack's user-submitted track.
 * 
 * - View `[]` and non-existent `wiki:` key:
 *   - Submit "Dimitri Vegas & Like Mike - Thank You (Not So Bad)" \
 *     via https://open.spotify.com/track/456WNXWhDwYOSf5SpTuqxd?si=e9a5cc69ef9b4ffe \
 *     as NextTrack's user-submitted track.
 */
export async function getLastFmGenres(artistName: string, trackName: string) {
    const baseUrl = "http://ws.audioscrobbler.com";
    // Using this method to get more info than the ".getTopTags" method
    const method = "track.getInfo";
    const apiKey = process.env.LASTFM_API_KEY;
    const artistNameInLastFmFormat = convertToLastFmFormat(artistName);
    const trackNameInLastFmFormat = convertToLastFmFormat(trackName);
    const fullUrl = `${baseUrl}/2.0/?method=${method}&api_key=${apiKey}&artist=${artistNameInLastFmFormat}&track=${trackNameInLastFmFormat}&format=json`;
    const response = await fetch(fullUrl);
    if (!response.ok) return [];
    /**
     * Returns an object with many keys. Example:
     * 
     * ```js
        {
            track: {
                name: 'Dog Days Are Over',
                mbid: '52587f93-2a1d-45fb-a8ba-97aafa2c1f28',
                url: 'https://www.last.fm/music/Florence+++The+Machine/_/Dog+Days+Are+Over',
                duration: '0',
                streamable: { '#text': '0', fulltrack: '0' },
                // `listeners` and `playcount` could be potential parameters
                // but Spotify's `popularity` key seems better
                listeners: '2537',
                playcount: '8492',
                artist: {
                    name: 'Florence   The Machine',
                    // Some artists do not have `mbid` key
                    mbid: '5fee3020-513b-48c2-b1f7-4681b01db0c6',
                    url: 'https://www.last.fm/music/Florence+++The+Machine'
                },
                // ----- Normal ----- //
                toptags: { tag: [Array] },
                wiki: {
                    published: '31 Aug 2009, 11:29',
                    summary: `"Dog... Read more on Last.fm</a>.`,
                    content: `"Dog... \n` + '\n' + '...' + '... terms may apply.'
                }
                // ----- Abnormal ----- //
                toptags: { tag: [] }
                // `wiki:` does not exist at all
            }
        }
     * ```
     */
    let data = await response.json();
    /**
     * Returns an array of objects. Example:
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
    const genresAndUrls = data.track.toptags.tag;
    const genres = genresAndUrls.map((genre: { name: string }) => genre.name);
    // // TEST
    // console.log(data);
    // console.log(genres);
    // console.log(fullUrl);
    // console.log("[!] ^ from ./src/libs/lastfm.ts::getLastFmGenres()");
    return genres;
}

/**
 * Web scraping Last.fm page returns `[]` or an array of strings. Example:
 * 
 * ```js
    [ 'indie', 'female vocalists', 'alternative', 'indie pop', 'british' ]
 * ```
 * 
 * -----
 * 
 * In a track's Last.fm page, the HTML element containing genres is:
 * 
 * ```html
    <section class="catalogue-tags">
        <ul class="tags-list tags-list--global">
            <li class="tag">
                <a href="/tag/indie">indie</a>
            </li>
            <!-- Repeat `<li>` for however many genres there are -->
        </ul>
    </section>
    
    <!-- There is a similar section (i.e. artist's tags) to avoid -->
    <section class="catalogue-tags about-artist-tags">
        <!-- Possibly the exact same content as above -->
    </section>
 * ```
 * 
 * -----
 * 
 * Source: https://www.last.fm/music/Florence+%252B+the+Machine/_/Dog+Days+Are+Over
 * 
 * View various outputs (ensure to uncomment `console.log()` lines):
 * 
 * - View provided example:
 *   - Submit "Florence + The Machine - Dog Days Are Over" \
 *     via https://open.spotify.com/track/456WNXWhDwYOSf5SpTuqxd?si=e9a5cc69ef9b4ffe \
 *     as NextTrack's user-submitted track.
 * 
 * - View insufficient genres:
 *   - Submit "Dimitri Vegas & Like Mike - Thank You (Not So Bad)" \
 *     via https://open.spotify.com/track/456WNXWhDwYOSf5SpTuqxd?si=e9a5cc69ef9b4ffe \
 *     as NextTrack's user-submitted track.
 */
export async function webScrapeLastFmGenres(artistName: string, trackName: string) {
    const artistNameInLastFmFormat = convertToLastFmFormat(artistName);
    const trackNameInLastFmFormat = convertToLastFmFormat(trackName);
    const fullUrl = `https://www.last.fm/music/${artistNameInLastFmFormat}/_/${trackNameInLastFmFormat}`;
    try {
        const response = await fetch(fullUrl, {
            headers: { "User-Agent": "NextTrack/1.0 (+https://example.com)" },
            cache: "no-store",
        });
        if (!response.ok) return [];
        // Parse HTML using Cheerio
        const html = await response.text();
        const $ = cheerio.load(html);
        // Extract specified HTML element's text (ensure to avoid the similar section (i.e. artist's tags))
        const htmlElement1 = "section.catalogue-tags:not(.about-artist-tags)";
        const htmlElement2 = "ul.tags-list";
        const htmlElement3 = "li.tag";
        const htmlElement4 = "a";
        const selector = $(`${htmlElement1} ${htmlElement2} ${htmlElement3} ${htmlElement4}`);
        const genres = selector
            // Must iterate as there are multiple genres
            .map((index, htmlElement) => $(htmlElement).text().trim())
            .get();
        // // TEST
        // console.log(genres);
        // console.log(fullUrl);
        // console.log("[!] ^ from ./src/libs/lastfm.ts::webScrapeLastFmGenres()");
        return genres;
    } catch (err) {
        console.error(`[!] ./src/libs/lastfm.ts::webScrapeLastFmGenres():\n${err}`);
        return [];
    }
}

/**
 * Last.fm API returns `[]` or an array of objects. Example:
 *
 * ```js
    [
        {
            name: "You've Got the Love",
            playcount: 10210622,
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
                    '#text': 'https://lastfm.freetls.fastly.net/i/u/34s/2a96cbd8b46e442fc41c2b86b821562f.png',
                    size: 'small'
                },
                // Repeat `{}` for however many times
            ]
        },
        // Repeat `{}` for 99 more times until 100 elements
    ]
 * ```
 * 
 * -----
 * 
 * Source: https://www.last.fm/api/show/track.getSimilar
 * 
 * - View provided example:
 *   - Submit "Florence + The Machine - Dog Days Are Over" \
 *     via https://open.spotify.com/track/456WNXWhDwYOSf5SpTuqxd?si=e9a5cc69ef9b4ffe \
 *     as NextTrack's user-submitted track.
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
     * 
     * ```js
        {
            similartracks: {
                track: [
                    [Object],
                    // Repeat `[Object]` for 99 more times until 100 elements
                ],
                '@attr': { artist: 'Florence + the Machine', track: 'Dog Days Are Over' }
            }
        }
     * ```
     */
    const data = await response.json();
    const similarTracks = data.similartracks.track;
    // // TEST
    // console.log(similarTracks[0]);
    // console.log("[!] ^ from ./src/libs/lastfm.ts::getLastFmSimilarTracks()");
    return similarTracks;
}

// DONE Continue housekeeping from below here DONE

/**
 * Web scraping Last.fm page returns `null` or a string. Example:
 * 
 * ```js
    "7ICS45rZsvo"
 * ```
 * 
 * -----
 * 
 * In a track's Last.fm page, the HTML element containing the YouTube video ID is:
 * 
 * ```html
    <a
        id="track-page-video-playlink"
        href="https://www.youtube.com/watch?v=7ICS45rZsvo"
        data-youtube-id="7ICS45rZsvo"
        data-youtube-url="https://www.youtube.com/watch?v=7ICS45rZsvo"
        ...
    ></a>
 * ```
 * 
 * Note that the returned string (i.e. `id`) can be used for anything YouTube-related:
 * 
 * - Normal YouTube: `https://www.youtube.com/watch?v={id}`
 * - Embedded YouTube: `https://www.youtube.com/embed/${id}`
 * - YouTube Music: `https://music.youtube.com/watch?v=${id}`
 * 
 * -----
 * 
 * Source:
 * - Via browser navigation: https://www.last.fm/music/The+Marías/_/Déjate+Llevar
 * - Encoded once: https://www.last.fm/music/The+Mar%C3%ADas/_/D%C3%A9jate+Llevar
 * - Encoded twice: https://www.last.fm/music/The+Mar%25C3%25ADas/_/D%25C3%25A9jate+Llevar
 */
export async function webScrapeLastFmYoutubeId(lastFmUrl: string) {
    try {
        const response = await fetch(lastFmUrl, {
            headers: { "User-Agent": "NextTrack/1.0 (+https://example.com)" },
            cache: "no-store",
        });
        if (!response.ok) return null;
        // Parse HTML using Cheerio
        const html = await response.text();
        const $ = cheerio.load(html);
        // Extract specified HTML element's attribute's text
        const htmlElementId = "#track-page-video-playlink";
        const htmlElementAttribute = "data-youtube-id";
        const selector = $(htmlElementId);
        const youtubeId = selector.attr(htmlElementAttribute);
        return youtubeId;
    } catch (err) {
        console.error(`[!] ./src/libs/lastfm.ts::webScrapeLastFmYoutubeId():\n${err}`);
        return null;
    }
}

/**
 * Web scraping returns a `listenAtLinks` object with 3 keys, either:
 * 
 * ```js
    // If no links are found
    listenAtLinks: {
        spotify: 'https://open.spotify.com',
        appleMusic: 'https://geo.music.apple.com',
        youtubeMusic: 'https://music.youtube.com'
    }
 * ```
 * 
 * Or:
 * 
 * ```js
 *  // If links are found (ideal scenario)
    listenAtLinks: {
        spotify: 'https://open.spotify.com/track/1CcLA0eaauck34YEIrvAAq',
        appleMusic: 'https://geo.music.apple.com/album/id1713571199?i=1713571204&at=10l3Sh',
        youtubeMusic: 'https://music.youtube.com/watch?v=YBGtzfK5Bak'
    }
 * ```
 * 
 * -----
 * 
 * In a track's Last.fm page, the HTML element containing links to other music platform is:
 * 
 * # (1 of 2) Under the "Play this track" section:
 * 
 * ```html
    <ul class="play-this-track-playlinks">
        <li>
            <a
                class="play-this-track-playlink play-this-track-playlink--youtube js-playlink"
                href="https://www.youtube.com/watch?v=YBGtzfK5Bak"
                ...
            >YouTube</a>
        </li>
        <li>
            <a
                class="hidden-xs play-this-track-playlink play-this-track-playlink--spotify js-playlink"
                href="https://open.spotify.com/track/1CcLA0eaauck34YEIrvAAq"
                ...
            >Spotify</a>
        </li>
        <li>
            <a
                class="hidden-xs play-this-track-playlink play-this-track-playlink--itunes"
                href="https://geo.music.apple.com/album/id1713571199?i=1713571204&amp;at=10l3Sh"
                ...
            >Apple Music</a>
        </li>
    </ul>
 * ```
 * 
 * # (2 of 2) Under the "External Links" section:
 * 
 * ```html
    <ul class="resource-external-links">
        <li>
            <!-- There is a weird "itscg=30200&amp;at=10l3Sh&amp;ls=1&amp;" string consistently (even in other tracks that are lacking links) that should be removed -->
            <a
                class="resource-external-link resource-external-link--apple-music"
                href="https://music.apple.com/SG/search?itscg=30200&amp;at=10l3Sh&amp;ls=1&amp;term=mikeeysmind-Tayk_hard_x_resonance"
                ...
            >Apple Music</a>
        </li>
    </ul>
 * ```
 * 
 * -----
 * 
 * Source:
 * 
 * - Has all links: https://www.last.fm/music/David+Guetta/_/When+We+Were+Young+(The+Logical+Song)
 *   - How to reach ^?
 *     - Submit "Thank You (Not So Bad)"
 *     - via https://open.spotify.com/track/09CnYHiZ5jGT1wr1TXJ9Zt?si=68c00376f8e7456a
 *     - and it will be the first default result.
 * 
 * - Has no links: https://www.last.fm/music/mikeeysmind/_/Tayk+hard+x+resonance
 *   - How to reach ^?
 *     - Submit "Bando"
 *     - via https://open.spotify.com/track/6z7dQwXh9UJJl4wsWxexuI?si=308467749bd94d0d
 *     - and it will be the first default result.
 */
export async function webScrapeLastFmListenAtLinks(lastFmUrl: string) {
    let listenAtLinks = {
        spotify: "",
        appleMusic: "",
        youtubeMusic: "",
    };
    try {
        const response = await fetch(lastFmUrl, {
            headers: { "User-Agent": "NextTrack/1.0 (+https://example.com)" },
            cache: "no-store",
        });
        if (!response.ok) return null;
        // Parse HTML using Cheerio
        const html = await response.text();
        const $ = cheerio.load(html);
        // Extract specified HTML element's attribute's text
        // - For YouTube Music
        let htmlElement = "a.play-this-track-playlink--youtube";
        let htmlElementAttribute = "href";
        let selector = $(htmlElement);
        let link = selector.attr(htmlElementAttribute);
        if (link) listenAtLinks.youtubeMusic = link.replace("https://www.", "https://music.");
        // TODO If no link, then I want a window popup that informs user there's no link found
        else listenAtLinks.youtubeMusic = "https://music.youtube.com";
        // - For Spotify
        htmlElement = "a.play-this-track-playlink--spotify";
        selector = $(htmlElement);
        link = selector.attr(htmlElementAttribute);
        if (link) listenAtLinks.spotify = link;
        // TODO Same as above ^
        else listenAtLinks.spotify = "https://open.spotify.com";
        // - For Apple Music (under the "Play this track" section)
        htmlElement = "a.play-this-track-playlink--itunes";
        selector = $(htmlElement);
        link = selector.attr(htmlElementAttribute);
        if (link) listenAtLinks.appleMusic = link;
        else {
            // - For Apple Music (under the "External Links" section)
            htmlElement = "a.resource-external-link--apple-music";
            selector = $(htmlElement);
            link = selector.attr(htmlElementAttribute);
            if (link) listenAtLinks.appleMusic = link.replace("itscg=30200&amp;at=10l3Sh&amp;ls=1&amp;", "");
            // TODO Same as above ^
            else listenAtLinks.appleMusic = "https://geo.music.apple.com";
        }
        // - Done
        return listenAtLinks;
    } catch (err) {
        console.error(`[!] ./src/libs/lastfm.ts::webScrapeLastFmListenAtLinks():\n${err}`);
        return null;
    }
}
