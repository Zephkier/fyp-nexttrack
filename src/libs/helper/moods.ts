/**
 * Set as `export const` so other files can import it for consistency.
 *
 * Currently contains:
 *
 * ```js
 * ["happy", "sad", "chill", "party"]
 * ```
 */
export const moods = ["happy", "sad", "chill", "party"];

/**
 * The mapping for a genre to its mood(s) and weight(s). Example:
 *
 * ```js
 * "neo-soul": [
 *     { mood: moods[1], weight: 1 },
 *     { mood: moods[2], weight: 2 },
 * ],
 * ```
 *
 * Note:
 *
 * - `mood` is based on `export const moods`.
 * - `weight` has values 1, 2, 3.
 *
 * Additional note:
 *
 * - This variable **does not** contain every user-generated genre in Last.fm and Genius.
 * - You (the developer) must manually add new genres into it.
 * - It is recommended to sort and group by similar genres.
 */
export const genreToMoodMapping: {
    [key: string]: {
        mood: string;
        weight: number;
    }[];
} = {
    // Pop family
    pop: [
        { mood: moods[0], weight: 2 },
        { mood: moods[3], weight: 3 },
    ],
    bedroom: [{ mood: moods[2], weight: 3 }],
    dream: [{ mood: moods[2], weight: 3 }],
    indie: [{ mood: moods[2], weight: 2 }],
    sunshine: [
        { mood: moods[0], weight: 3 },
        { mood: moods[3], weight: 1 },
    ],

    // Hip hop / Rap / R&B family
    hip: [
        { mood: moods[2], weight: 1 },
        { mood: moods[3], weight: 2 },
    ],
    rap: [{ mood: moods[3], weight: 2 }],
    rnb: [
        { mood: moods[2], weight: 3 },
        { mood: moods[3], weight: 2 },
    ],
    "r&b": [
        { mood: moods[2], weight: 3 },
        { mood: moods[3], weight: 2 },
    ],

    // Soul / Jazz / Blue family
    soul: [{ mood: moods[2], weight: 3 }],
    jazz: [
        { mood: moods[0], weight: 1 },
        { mood: moods[2], weight: 3 },
    ],
    blue: [
        { mood: moods[1], weight: 2 },
        { mood: moods[2], weight: 3 },
    ],

    // Rock / Metal family
    rock: [{ mood: moods[3], weight: 3 }],
    hard: [{ mood: moods[3], weight: 3 }],
    classic: [{ mood: moods[0], weight: 1 }],
    // (for both "alternate" and "alternative" words)
    alternat: [
        { mood: moods[0], weight: 2 },
        { mood: moods[2], weight: 2 },
    ],
    psych: [
        { mood: moods[2], weight: 3 },
        { mood: moods[3], weight: 1 },
    ],
    punk: [{ mood: moods[3], weight: 3 }],
    metal: [{ mood: moods[3], weight: 3 }],
    heavy: [{ mood: moods[3], weight: 3 }],

    // EDM family
    edm: [{ mood: moods[3], weight: 3 }],
    electronic: [{ mood: moods[3], weight: 3 }],
    dance: [{ mood: moods[3], weight: 3 }],
    dubstep: [{ mood: moods[3], weight: 3 }],
    house: [{ mood: moods[3], weight: 3 }],
    techno: [{ mood: moods[3], weight: 3 }],
    trap: [{ mood: moods[3], weight: 3 }],
    dnb: [{ mood: moods[3], weight: 3 }],
    drum: [{ mood: moods[3], weight: 3 }],
    bass: [{ mood: moods[3], weight: 3 }],
    future: [{ mood: moods[3], weight: 3 }],

    // Others
    lofi: [{ mood: moods[2], weight: 3 }],
    "lo-fi": [{ mood: moods[2], weight: 3 }],
    uplifting: [{ mood: moods[0], weight: 3 }],
    rage: [{ mood: moods[3], weight: 3 }],
    surf: [
        { mood: moods[0], weight: 2 },
        { mood: moods[2], weight: 2 },
    ],
};

/**
 * Helper function returns `["no moods found"]` or an array of strings. Example:
 *
 * - If `numberOfMoodsToGet = 2`, then returns `[ "mood1", "mood2" ]`.
 * - If `numberOfMoodsToGet = 4`, then returns `[ "mood1", ..., "mood4" ]`.
 *
 * ---
 *
 * This is a very manual and rudimentary implementation.
 *
 * Max `numberOfMoodsToGet` is based on `moods.length`.
 *
 * Ensure moods are the same as `./src/ui/components/CustomiseRecommendations/index.ts::allMoods`.
 */
export function inferMoodsFromGenres(genres: string[], numberOfMoodsToGet: number) {
    if (numberOfMoodsToGet > moods.length) {
        console.error(`[!] ./src/libs/helper/mood.ts::inferMoodsFromGenres():\nMax value allowed for "numberOfMoodsToGet" is ${moods.length} (current: ${numberOfMoodsToGet}).`);
        return ["no moods found"];
    }
    /**
     * This will eventually become something like:
     *
     * ```js
     * { chill: 9, party: 2, happy: 3 }
     * ```
     *
     * Where...
     *
     * - The key is the `mood` (based on `genreToMoodMapping`).
     * - The value is the sum of that `mood`'s `weight`.
     */
    const summedMappingObject: { [mood: string]: number } = {};
    // Iterate through track's genres
    for (const genre of genres) {
        for (const [genreKey, moodAndWeightValue] of Object.entries(genreToMoodMapping)) {
            // Better to use `.includes()` instead of `==`
            if (genre.toLowerCase().includes(genreKey.toLowerCase())) {
                // Iterate through genre's mappings to sum its mood's weight
                for (const { mood, weight } of moodAndWeightValue) {
                    if (!summedMappingObject[mood]) summedMappingObject[mood] = 0;
                    summedMappingObject[mood] += weight;
                }
            }
        }
    }
    /**
     * Convert from an object to an array. Example:
     *
     * ```js
     * // From (as per above):
     * { chill: 9, party: 2, happy: 3 }
     *
     * // To:
     * [ [ 'chill', 9 ], [ 'party', 2 ], [ 'happy', 3 ] ]
     * ```
     */
    const summedMappingArray = Object.entries(summedMappingObject);
    // When all of track's genres did not match anything in `genreToMoodMapping`
    if (summedMappingArray.length == 0) return ["no moods found"];
    /**
     * Sorts by weight, then return the top `numberOfMoodsToGet` (e.g. 2) moods. Example:
     *
     * ```js
     * // From (as per above):
     * [ [ 'chill', 9 ], [ 'party', 2 ], [ 'happy', 3 ] ]
     *
     * // To (re-ordered from highest to lowest):
     * [ [ 'chill', 9 ], [ 'happy', 3 ], [ 'party', 2 ] ]
     *
     * // To (get names only):
     * [ 'chill', 'happy', 'party' ]
     *
     * // To (limit to `numberOfMoodsToGet`):
     * [ 'chill', 'happy' ]
     * ```
     */
    const inferredMoods = summedMappingArray
        .sort((a, b) => b[1] - a[1])
        .map(([mood]) => mood)
        .slice(0, numberOfMoodsToGet);
    return inferredMoods;
}
