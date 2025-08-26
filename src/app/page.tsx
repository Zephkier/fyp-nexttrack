import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

import Hero from "@/ui/components/Hero";
import TrackForm from "@/ui/components/TrackForm";
import Guide from "@/ui/components/Guide";
import Examples from "@/ui/components/Examples";

// Only root page needs additional " | ${siteConfig.name}" due to being in the same directory level as the root layout
export const metadata: Metadata = {
    title: `Home | ${siteConfig.name}`,
};

export default function Home() {
    return (
        <main className="container mx-auto max-w-4xl">
            <Hero customMarginBottom="mb-40" />
            <TrackForm />
            <Guide />
            {/* NOTE This is temporary and is to be removed/deleted when deployed */}
            <Examples />
        </main>
    );
}
