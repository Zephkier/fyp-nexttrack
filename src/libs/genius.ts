import "server-only";
import * as cheerio from "cheerio";

function authHeaders(): HeadersInit {
    const clientAccessToken = process.env.GENIUS_CLIENT_ACCESS_TOKEN;
    if (!clientAccessToken) {
        throw new Error('[!] ./src/libs/genius.ts::authHeaders():\nNo "GENIUS_CLIENT_ACCESS_TOKEN"');
    }
    return { Authorization: `Bearer ${clientAccessToken}` };
}

/**
 * Returns a string. Example:
 *
 * `'https://genius.com/Dimitri-vegas-and-like-mike-tiesto-dido-and-w-w-thank-you-not-so-bad-lyrics'`
 */
export async function getGeniusSearchFirstItemGeniusUrl(trackArtistAndName: string) {
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

    const data = await response.json();
    const firstItemGeniusUrl = data.response.hits[0].result.url;
    return firstItemGeniusUrl;
}

/**
 * Web scraping returns `[]` or an array of strings. Example:
 * 
 * `["genre1", "genre2"]`
 * 
 * ---
 * 
 * Source:
 * - https://genius.com/Dimitri-vegas-and-like-mike-tiesto-dido-and-w-w-thank-you-not-so-bad-lyrics
 * - https://genius.com/Nujabes-luvsic-grand-finale-lyrics
 * 
 * In a track's Genius page, the HTML element containing genres is:
 * ```html
    <!--
    The class names have the same weird strings consistently:
    - "b55131f0-1 SEhjw"
    - "b55131f0-2 hYXsrC"
    - "b55131f0-2 bZuDYa"
    -->
    <div class="SongTags__Container-sc-b55131f0-1 SEhjw">
        <a class="SongTags__Tag-sc-b55131f0-2 hYXsrC" ...>Electronic</a>
        <a class="SongTags__Tag-sc-b55131f0-2 bZuDYa" ...>EDM</a>
    </div>
 * ```
 */
export async function webScrapeGeniusGenres(geniusUrl: string) {
    try {
        const response = await fetch(geniusUrl, {
            // Avoid being detected as a bot TODO Change to "+https://fyp-nexttrack.vercel.app/"
            // headers: { "User-Agent": "NextTrack/1.0 (+https://example.com)" },
            // Avoid being detected as a bot and look like a normal browser
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            },
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
