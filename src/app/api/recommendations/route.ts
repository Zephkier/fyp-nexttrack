import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const formDataObject = await request.formData();

        /**
         * The var name `spotifyTrackLink` comes from: \
         * `./src/ui/components/TrackForm.tsx::TrackForm()::<input name>`
         *
         * If use this line: \
         * `formDataObject.get("spotifyTrackLink");` \
         * then TS will complain, saying, "'link' is possibly null".
         *
         * Thus, use this line instead: \
         * `formDataObject.get("spotifyTrackLink") || ""`
         */
        const link = String(formDataObject.get("spotifyTrackLink") || "");

        const id = link
            .trim() //             e.g. "https://open.spotify.com/track/456WNXWhDwYOSf5SpTuqxd?si=e9a5cc69ef9b4ffe"
            .split("track/")[1] // e.g.                                "456WNXWhDwYOSf5SpTuqxd?si=e9a5cc69ef9b4ffe"
            .split("?si=")[0]; //  e.g.                                "456WNXWhDwYOSf5SpTuqxd"

        // Connected to "./src/app/recommendations/[spotifyTrackId]/page.tsx"
        return NextResponse.redirect(new URL(`/recommendations/${id}`, request.url));
    } catch {
        // Connected to "./src/app/page.tsx" TODO Create a popup window of some sort to notify user
        return NextResponse.redirect(new URL(`/?error=invalid-link`, request.url));
    }
}
