import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

// Only root page needs additional " | ${siteConfig.name}" due to being in the same directory level as the root layout
export const metadata: Metadata = {
    title: `Home | ${siteConfig.name}`,
};

import TrackForm from "@/ui/components/app/TrackForm";
import Guide from "@/ui/components/app/Guide";
import Examples from "@/ui/components/app/Examples";

export default function Home() {
    return (
        <main className="container mx-auto max-w-4xl">
            <TrackForm />
            <Guide />
            <Examples />
        </main>
    );
}
