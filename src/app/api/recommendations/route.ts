import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const formDataObject = await request.formData();

        // The var name `spotifyTrackLink` comes from:
        // "./src/ui/components/TrackForm.tsx::TrackForm()::<input name>"

        // If we use the following line, TS will complain, saying, "'link' is possibly null":
        // const link = formDataObject.get("spotifyTrackLink");

        // Thus, we use the following line instead:
        const link = String(formDataObject.get("spotifyTrackLink") || "");

        const id = link //         Currently: "https://open.spotify.com/track/456WNXWhDwYOSf5SpTuqxd?si=e9a5cc69ef9b4ffe"
            .split("track/")[1] // Currently:                                "456WNXWhDwYOSf5SpTuqxd?si=e9a5cc69ef9b4ffe"
            .split("?si=")[0]; //  Currently:                                "456WNXWhDwYOSf5SpTuqxd"

        // Connected to "./src/app/recommendations/[spotifyTrackId]/page.tsx"
        return NextResponse.redirect(new URL(`/recommendations/${id}`, request.url));
    } catch {
        // Connected to "./src/app/page.tsx" TODO Create a popup window of some sort to notify user
        return NextResponse.redirect(new URL(`/?error=invalid-link`, request.url));
    }
}
