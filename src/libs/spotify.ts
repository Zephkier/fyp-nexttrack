import SpotifyWebApi from "spotify-web-api-node";

/**
 * Returns `null` or the `SpotifyWebApi()` instance.
 *
 * Creates a new instance of `SpotifyWebApi()` via variables from `./.env` file.
 *
 * Sets an access token.
 */
export async function getSpotifyApiToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        console.error('[!] ./src/libs/spotify.ts::getSpotifyApiToken():\nNo "SPOTIFY_CLIENT_ID" or "SPOTIFY_CLIENT_SECRET"');
        return null;
    }
    try {
        // Key MUST be named "clientId" and not "clientID" or anything else
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
 * Returns `null` or an object with many keys. Example:
 * ```js
    {
        album: {
            album_type: 'album',
            artists: [ [Object] ],
            available_markets: ['AR', 'AU', ...],
            external_urls: {
                spotify: 'https://open.spotify.com/album/1rLLyY5p6HXNl2lKzINWp5'
            },
            href: 'https://api.spotify.com/v1/albums/1rLLyY5p6HXNl2lKzINWp5',
            id: '1rLLyY5p6HXNl2lKzINWp5',
            images: [ [Object], [Object], [Object] ],
            name: 'Lungs (Deluxe Version)',
            release_date: '2009',
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
            }
        ],
        available_markets: ['AR', 'AU', ...],
        disc_number: 1,
        duration_ms: 252818,
        explicit: false,
        external_ids: { isrc: 'GBUM70900209' },
        external_urls: {
            spotify: 'https://open.spotify.com/track/456WNXWhDwYOSf5SpTuqxd'
        },
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
 */
export async function getSpotifyTrackDetails(trackId: string) {
    try {
        const api = await getSpotifyApiToken();
        if (!api) return null;
        const response = await api.getTrack(trackId);
        return response.body;
    } catch (err) {
        console.error(`[!] ./src/libs/spotify.ts::getSpotifyTrackDetails():\n${err}`);
        return null;
    }
}
