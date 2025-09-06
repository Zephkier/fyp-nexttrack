import * as cheerio from "cheerio";

/**
 * Returns `{}` or an object with `Authorization` key for Genius API's `headers`.
 *
 * Source: https://docs.genius.com/#/authentication-h1
 */
export function authHeaders(): HeadersInit {
    const clientAccessToken = process.env.GENIUS_CLIENT_ACCESS_TOKEN;
    if (!clientAccessToken) {
        console.error('[!] ./src/libs/genius.ts::authHeaders():\nNo "GENIUS_CLIENT_ACCESS_TOKEN"');
        return {};
    }
    return { Authorization: `Bearer ${clientAccessToken}` };
}

/**
 * Genius API returns `null` or an array of objects. Example:
 * 
 * ```js
    [
        {
            highlights: [],
            index: 'song',
            type: 'song',
            result: {
                annotation_count: 0,
                api_path: '/songs/9268740',
                artist_names: 'Dimitri Vegas & Like Mike, Tiësto, Dido & W&W',
                full_title: 'Thank You (Not So Bad) by Dimitri Vegas & Like Mike, Tiësto, Dido & W&W',
                header_image_thumbnail_url: 'https://images.genius.com/15b2724af3f11162581a5a417bc29c0e.300x300x1.png',
                header_image_url: 'https://images.genius.com/15b2724af3f11162581a5a417bc29c0e.1000x1000x1.png',
                id: 9268740,
                lyrics_owner_id: 3499648,
                lyrics_state: 'complete',
                path: '/Dimitri-vegas-and-like-mike-tiesto-dido-and-w-w-thank-you-not-so-bad-lyrics',
                primary_artist_names: 'Dimitri Vegas & Like Mike, Tiësto, Dido & W&W',
                pyongs_count: null,
                relationships_index_url: 'https://genius.com/Dimitri-vegas-and-like-mike-tiesto-dido-and-w-w-thank-you-not-so-bad-sample',
                release_date_components: [Object],
                release_date_for_display: 'December 1, 2023',
                release_date_with_abbreviated_month_for_display: 'Dec. 1, 2023',
                song_art_image_thumbnail_url: 'https://images.genius.com/15b2724af3f11162581a5a417bc29c0e.300x300x1.png',
                song_art_image_url: 'https://images.genius.com/15b2724af3f11162581a5a417bc29c0e.1000x1000x1.png',
                stats: [Object],
                title: 'Thank You (Not So Bad)',
                title_with_featured: 'Thank You (Not So Bad)',
                url: 'https://genius.com/Dimitri-vegas-and-like-mike-tiesto-dido-and-w-w-thank-you-not-so-bad-lyrics',
                featured_artists: [],
                primary_artist: [Object],
                primary_artists: [Array]
            }
        },
        // Repeat for however many search results there are, but usually, first item is good enough
    ]
 * ```
 * 
 * -----
 * 
 * Source: https://docs.genius.com/#/search-h2
 */
export async function getGeniusSearch(trackArtistAndName: string) {
    const encodedTrackArtistAndName = encodeURIComponent(trackArtistAndName);
    const geniusUrl = `https://api.genius.com/search?q=${encodedTrackArtistAndName}`;
    const response = await fetch(geniusUrl, {
        headers: authHeaders(),
        cache: "no-store",
    });
    if (!response.ok) {
        console.error("[!] ./src/libs/genius.ts::getGeniusSearch()");
        return null;
    }
    /**
     * Returns an object with `meta` and `response` keys. Example:
     * ```js
        {
            meta: { status: 200 },
            response: { hits: [ [Object], ..., [Object] ] }
        }
     * ```
     */
    const data = await response.json();
    /**
     * _Same JSDoc as this function._
     */
    const searchResults = data.response.hits;
    return searchResults;
}

/**
 * **THIS IS DEPRECATED.**
 * 
 * The Genius API retrieves nothing useful in its `/songs/:id` method.
 * 
 * ---
 * 
 * Usage:
 * 
 * - In `./src/app/recommendations/[spotifyTrackID]/page.tsx`,
 * have the following code set up to view its `console.log()` output:
 * 
 * ```js
    lastFmGenres = ["forcefullySetToOneElement"];
    if (lastFmGenres.length == 1) {
        const searchResults = await getGeniusSearch(artistAndTrackName);
        const firstItemId = searchResults[0].result.id;
        getGeniusSong_deprecated(firstItemId);
    }
 * ```
 */
export async function getGeniusSong_deprecated(id: number) {
    const geniusUrl = `https://api.genius.com/songs/${id}`;
    const response = await fetch(geniusUrl, {
        headers: authHeaders(),
        cache: "no-store",
    });
    if (!response.ok) {
        console.error("[!] ./src/libs/genius.ts::getGeniusSong_deprecated()");
        return null;
    }
    /**
     * Returns an object with `meta` and `response` keys. Example:
     * ```js
        {
            meta: { status: 200 },
            response: { song: { Object } }
        }
     * ```
     */
    const data = await response.json();
    /**
     * Returns nothing useful, not even its tags/genres.
     */
    const geniusTrackDetails = data.response.song;
    // console.log(geniusTrackDetails);
}

/**
 * Web scraping returns `[]` or an array of strings. Example:
 * 
 * `["genre1", "genre2"]`
 * 
 * ---
 * 
 * In a track's Genius page, the HTML element containing genres is:
 * ```html
    <div class="SongTags__Container-sc-b55131f0-1 SEhjw">
        <a class="SongTags__Tag-sc-b55131f0-2 hYXsrC" ...>Electronic</a>
        <a class="SongTags__Tag-sc-b55131f0-2 bZuDYa" ...>EDM</a>
    </div>
    <!--
    Fortunately, the same strings appear consistently across different tracks:
    - "b55131f0-1 SEhjw"
    - "b55131f0-2 hYXsrC"
    - "b55131f0-2 bZuDYa"
    -->
 * ```
 * 
 * -----
 * 
 * Source:
 * - https://genius.com/Dimitri-vegas-and-like-mike-tiesto-dido-and-w-w-thank-you-not-so-bad-lyrics
 * - https://genius.com/Nujabes-luvsic-grand-finale-lyrics
 */
export async function webScrapeGeniusGenres(geniusUrl: string) {
    try {
        const response = await fetch(geniusUrl, {
            // Avoid being detected as a bot TODO Change to "+https://fyp-nexttrack.vercel.app/"
            headers: { "User-Agent": "NextTrack/1.0 (+https://example.com)" },
            cache: "no-store",
        });
        if (!response.ok) return [];
        // Parse HTML using Cheerio
        const html = await response.text();
        const $ = cheerio.load(html);
        // Extract text from specified HTML element
        const htmlElement1 = "div.SongTags__Container-sc-b55131f0-1";
        const htmlElement2 = "a.SongTags__Tag-sc-b55131f0-2";
        const selector = $(`${htmlElement1} ${htmlElement2}`);
        const genres = selector
            // Must iterate as there are multiple genres
            .map((index, htmlElement) => $(htmlElement).text().trim().toLowerCase())
            .get();
        return genres;
    } catch (err) {
        console.error(`[!] ./src/libs/genius.ts::webScrapeGeniusGenres():\n${err}`);
        return [];
    }
}
