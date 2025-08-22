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

        const id = link //         Currently: "https://open.spotify.com/track/1DFmBjoeQN9DpOVTEewyx0?si=210d4a8f264e4430"
            .split("track/")[1] // Currently:                                "1DFmBjoeQN9DpOVTEewyx0?si=210d4a8f264e4430"
            .split("?si=")[0]; //  Currently:                                "1DFmBjoeQN9DpOVTEewyx0"

        // Connected to "./src/app/recommendations/[spotifyTrackId]/page.tsx"
        return NextResponse.redirect(new URL(`/recommendations/${id}`, request.url));
    } catch {
        // TODO Send to home or error page

        // Connected to "./src/app/page.tsx"
        return NextResponse.redirect(new URL(`/?error=invalid-link`, request.url));
    }
}
