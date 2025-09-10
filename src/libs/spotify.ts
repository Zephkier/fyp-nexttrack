import SpotifyWebApi from "spotify-web-api-node";

/**
 * Spotify API returns `null` or the `SpotifyWebApi()` instance with an access token.
 *
 * -----
 *
 * Source: https://www.npmjs.com/package/spotify-web-api-node
 */
export async function getSpotifyApiToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        console.error('[!] ./src/libs/spotify.ts::getSpotifyApiToken():\nNo "SPOTIFY_CLIENT_ID" or "SPOTIFY_CLIENT_SECRET"');
        return null;
    }
    try {
        /**
         * `clientId` **must** be called `clientId` and not anything else (like `clientID`).
         */
        const spotifyApi = new SpotifyWebApi({ clientId, clientSecret });
        const data = await spotifyApi.clientCredentialsGrant();
        const accessToken = data.body.access_token;
        spotifyApi.setAccessToken(accessToken);
        return spotifyApi;
    } catch (err) {
        console.error(`[!] ./src/libs/spotify.ts::getSpotifyApiToken():\n${err}`);
        return null;
    }
}

/**
 * Spotify API returns `null` or an object with many keys. Example:
 * 
 * ```js
    {
        album: {
            album_type: 'album',
            artists: [ [Object] ],
            available_markets: [ 'AR', 'AU', ... ],
            external_urls: { spotify: 'https://open.spotify.com/album/1rLLyY5p6HXNl2lKzINWp5' },
            href: 'https://api.spotify.com/v1/albums/1rLLyY5p6HXNl2lKzINWp5',
            id: '1rLLyY5p6HXNl2lKzINWp5',
            images: [ [Object], [Object], [Object] ],
            name: 'Lungs (Deluxe Version)',
            // Ensure this is YYYY-MM-DD
            release_date: '2009',
            // Could be 'year', 'month', or 'day'
            release_date_precision: 'year',
            total_tracks: 20,
            type: 'album',
            uri: 'spotify:album:1rLLyY5p6HXNl2lKzINWp5'
        },
        artists: [
            {
                external_urls: [Object],
                href: 'https://api.spotify.com/v1/artists/1moxjboGR7GNWYIMWsRjgG',
                id: '1moxjboGR7GNWYIMWsRjgG',
                name: 'Florence + The Machine',
                type: 'artist',
                uri: 'spotify:artist:1moxjboGR7GNWYIMWsRjgG'
            },
            // Repeat `{}` for however many artists there are
        ],
        available_markets: [ 'AR', 'AU', ... ],
        disc_number: 1,
        duration_ms: 252818,
        explicit: false,
        external_ids: { isrc: 'GBUM70900209' },
        external_urls: { spotify: 'https://open.spotify.com/track/456WNXWhDwYOSf5SpTuqxd' },
        href: 'https://api.spotify.com/v1/tracks/456WNXWhDwYOSf5SpTuqxd',
        id: '456WNXWhDwYOSf5SpTuqxd',
        is_local: false,
        name: 'Dog Days Are Over',
        popularity: 79,
        preview_url: null,
        track_number: 1,
        type: 'track',
        uri: 'spotify:track:456WNXWhDwYOSf5SpTuqxd'
    }
 * ```
 * 
 * -----
 * 
 * Source:
 * 
 * - https://www.npmjs.com/package/spotify-web-api-node
 * - https://developer.spotify.com/documentation/web-api/reference/get-track
 * 
 * View provided example (single artist):
 * 
 * - Uncomment `console.log()` lines.
 * - Submit "Florence + The Machine - Dog Days Are Over" \
 *   via https://open.spotify.com/track/456WNXWhDwYOSf5SpTuqxd?si=e9a5cc69ef9b4ffe \
 *   as NextTrack's user-submitted track.
 * 
 * View multiple artists:
 * 
 * - Uncomment `console.log()` lines.
 * - Submit "Dimitri Vegas & Like Mike - Thank You (Not So Bad)" \
 *   via https://open.spotify.com/track/456WNXWhDwYOSf5SpTuqxd?si=e9a5cc69ef9b4ffe \
 *   as NextTrack's user-submitted track.
 */
export async function getSpotifyTrackDetails(trackId: string) {
    try {
        const api = await getSpotifyApiToken();
        if (!api) return null;
        const response = await api.getTrack(trackId);
        // // TEST
        // console.log(response.body);
        // console.log("[!] ^ from ./src/libs/spotify.ts::getSpotifyTrackDetails()");
        return response.body;
    } catch (err) {
        console.error(`[!] ./src/libs/spotify.ts::getSpotifyTrackDetails():\n${err}`);
        return null;
    }
}
