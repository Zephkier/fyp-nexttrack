import { getLastFmGenres, webScrapeLastFmGenres } from "@/libs/api/lastfm";
import { getGeniusSearch, webScrapeGeniusGenres } from "@/libs/api/genius";

/**
 * Multiple APIs and web scraping returns `["no genres found"]` or an array of strings. Example:
 *
 * ```js
 * [ 'indie', 'female vocalists', 'alternative', 'indie pop', 'british' ]
 * ```
 *
 * Priority of getting genres:
 *
 * 1. Spotify API - has no genre-related data
 * 2. Last.fm API - inconsistent; may return `0` genres
 * 3. Last.fm web scrape - insufficient; may return `1` or `2` genres
 * 4. Genius API - has no genre-related data
 * 5. Genius web scrape - last resort
 * 6. Set `["no genres found"]` - fail-safe
 *
 * Note that Last.fm and Genius call it "tags", but we shall call it "genres" for consistency.
 *
 * -----
 *
 * Source: See inside this function for the various methods used.
 */
export async function getGenres(artistName: string, trackName: string) {
    // // TEST Handle cases where there are insufficient genres (move this line anywhere)
    // retrievedGenres = [];

    const minNumberOfGenres = 2;

    // Priority 1. Spotify API - has no genre-related data

    // 2. Last.fm API - inconsistent; may return `0` genres
    let retrievedGenres: string[] = await getLastFmGenres(artistName, trackName);

    // 3. Last.fm web scrape - insufficient; may return `1` or `2` genres
    if (retrievedGenres.length < minNumberOfGenres) retrievedGenres = await webScrapeLastFmGenres(artistName, trackName);

    // Priority 4. Genius API - has no genre-related data

    // Priority 5. Genius web scrape - last resort
    if (retrievedGenres.length < minNumberOfGenres) {
        const searchResults = await getGeniusSearch(artistName, trackName);
        const firstSearchResultGeniusUrl: string | null = searchResults?.[0]?.result?.url ?? null;
        if (firstSearchResultGeniusUrl) retrievedGenres = await webScrapeGeniusGenres(firstSearchResultGeniusUrl);
    }

    // Priority 6. Set `["no genres found"]` - fail-safe
    if (retrievedGenres.length < minNumberOfGenres) retrievedGenres = ["no genres found"];

    // Extra: Set all to lowercase for consistency between different naming conventions (e.g. words vs acronyms)
    retrievedGenres.map((genre) => genre.toLowerCase());

    return retrievedGenres;
}
